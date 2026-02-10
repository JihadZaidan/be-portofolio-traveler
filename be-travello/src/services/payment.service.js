const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config/database.config.js');
const axios = require('axios');

class MidtransPaymentService {
    static SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    static CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
    static ENVIRONMENT = process.env.MIDTRANS_ENVIRONMENT || 'sandbox';
    static API_URL = this.ENVIRONMENT === 'production' 
        ? 'https://api.midtrans.com/v2' 
        : 'https://api.sandbox.midtrans.com/v2';

    // Create Midtrans payment
    static async createPayment(paymentData) {
        try {
            const payload = {
                payment_type: 'snap',
                transaction_details: {
                    order_id: paymentData.orderId,
                    gross_amount: paymentData.amount
                },
                customer_details: paymentData.customerDetails,
                item_details: paymentData.itemDetails,
                callbacks: paymentData.callbacks
            };

            // Create payment record first using Sequelize
            const payment = {
                id: uuidv4(),
                user_id: 'current_user',
                method: 'midtrans',
                amount: paymentData.amount,
                currency: 'IDR',
                description: `Payment for order ${paymentData.orderId}`,
                booking_id: null,
                customer_info: JSON.stringify(paymentData.customerDetails),
                status: 'pending',
                processing_fee: 0,
                total_amount: paymentData.amount,
                payment_gateway_response: '',
                created_at: new Date(),
                updated_at: new Date()
            };

            await this.createPaymentRecord(payment);

            // Call real Midtrans API using axios
            const response = await axios.post(`${this.API_URL}/charge`, payload, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(this.SERVER_KEY + ':').toString('base64')}`
                }
            });

            const result = response.data;

            if (result.token) {
                // Update payment with Midtrans response
                await this.updatePaymentWithMidtransResponse(payment.id, {
                    token: result.token,
                    transaction_id: result.transaction_id || paymentData.orderId,
                    order_id: paymentData.orderId,
                    status: 'pending'
                });

                return {
                    token: result.token,
                    redirect_url: result.redirect_url || '',
                    transaction_id: result.transaction_id || paymentData.orderId,
                    order_id: paymentData.orderId,
                    status: 'pending',
                    amount: paymentData.amount
                };
            } else {
                throw new Error(result.error_message || 'Failed to create Midtrans payment');
            }
        } catch (error) {
            console.error('Midtrans payment creation error:', error);
            throw new Error(error.message || 'Payment processing failed');
        }
    }

    // Get payment status from Midtrans
    static async getPaymentStatus(orderId) {
        try {
            // Call real Midtrans API using axios
            const response = await axios.get(`${this.API_URL}/${orderId}/status`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Basic ${Buffer.from(this.SERVER_KEY + ':').toString('base64')}`
                }
            });

            const result = response.data;

            // Update payment in database
            await this.updatePaymentStatus(orderId, result.transaction_status);

            return {
                paymentId: orderId,
                status: result.transaction_status,
                amount: result.gross_amount,
                currency: result.currency,
                method: 'midtrans',
                createdAt: result.transaction_time,
                updatedAt: new Date().toISOString(),
                isCompleted: result.transaction_status === 'settlement',
                isPending: ['pending', 'authorize'].includes(result.transaction_status),
                isFailed: ['deny', 'expire', 'cancel'].includes(result.transaction_status),
                transactionId: result.transaction_id
            };
        } catch (error) {
            console.error('Midtrans status check error:', error);
            throw new Error(error.message || 'Status check failed');
        }
    }

    // Get available payment methods
    static async getPaymentMethods() {
        return [
            {
                id: 'credit_card',
                name: 'Credit Card',
                description: 'Visa, Mastercard, JCB, Amex',
                icon: 'credit-card',
                type: 'credit_card',
                available: true
            },
            {
                id: 'bank_transfer',
                name: 'Bank Transfer',
                description: 'BCA, BNI, BRI, Mandiri, Permata, etc',
                icon: 'bank',
                type: 'bank_transfer',
                available: true
            },
            {
                id: 'ewallet',
                name: 'E-Wallet',
                description: 'GoPay, OVO, DANA, ShopeePay, LinkAja',
                icon: 'wallet',
                type: 'ewallet',
                available: true
            },
            {
                id: 'qris',
                name: 'QRIS',
                description: 'Scan QR code with any e-wallet app',
                icon: 'qrcode',
                type: 'qris',
                available: true
            },
            {
                id: 'cstore',
                name: 'Convenience Store',
                description: 'Alfamart, Indomaret',
                icon: 'store',
                type: 'cstore',
                available: true
            }
        ];
    }

    // Process refund
    static async processRefund(paymentId, reason) {
        try {
            const payment = await this.getPaymentRecord(paymentId);
            
            if (!payment) {
                throw new Error('Payment not found');
            }

            if (payment.status !== 'settlement') {
                throw new Error('Only settled payments can be refunded');
            }

            // Call real Midtrans API using axios
            const response = await axios.post(`${this.API_URL}/${payment.order_id}/refund`, {
                refund_key: uuidv4(),
                amount: payment.amount,
                reason: reason || 'Customer requested refund'
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(this.SERVER_KEY + ':').toString('base64')}`
                }
            });

            const result = response.data;

            // Update payment status
            await this.updatePaymentStatus(payment.order_id, 'refund');

            const refundResult = {
                refundId: result.refund_id || `REF_${Date.now()}`,
                originalPaymentId: paymentId,
                amount: payment.amount,
                reason: reason || 'Customer requested refund',
                status: 'processed',
                processedAt: new Date().toISOString(),
                estimatedSettlement: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            };

            return refundResult;
        } catch (error) {
            console.error('Midtrans refund error:', error);
            throw new Error(error.message || 'Refund processing failed');
        }
    }

    // Database operations using Sequelize
    static async createPaymentRecord(payment) {
        try {
            const query = `
                INSERT INTO payments (
                    id, user_id, method, amount, currency, description, 
                    booking_id, customer_info, status, processing_fee, 
                    total_amount, payment_gateway_response, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            await sequelize.query(query, {
                replacements: [
                    payment.id,
                    payment.user_id,
                    payment.method,
                    payment.amount,
                    payment.currency,
                    payment.description,
                    payment.booking_id,
                    payment.customer_info,
                    payment.status,
                    payment.processing_fee,
                    payment.total_amount,
                    payment.payment_gateway_response,
                    payment.created_at,
                    payment.updated_at
                ],
                type: sequelize.QueryTypes.INSERT
            });
        } catch (error) {
            console.error('Error creating payment record:', error);
            // Continue even if database fails - payment can still be processed
        }
    }

    static async updatePaymentWithMidtransResponse(paymentId, response) {
        try {
            const query = `
                UPDATE payments 
                SET transaction_id = ?, order_id = ?, payment_gateway_response = ?, updated_at = ?
                WHERE id = ?
            `;
            
            await sequelize.query(query, {
                replacements: [
                    response.transaction_id,
                    response.order_id,
                    JSON.stringify(response),
                    new Date(),
                    paymentId
                ],
                type: sequelize.QueryTypes.UPDATE
            });
        } catch (error) {
            console.error('Error updating payment with Midtrans response:', error);
        }
    }

    static async updatePaymentStatus(orderId, status) {
        try {
            const query = `
                UPDATE payments 
                SET status = ?, updated_at = ?
                WHERE order_id = ?
            `;
            
            await sequelize.query(query, {
                replacements: [status, new Date(), orderId],
                type: sequelize.QueryTypes.UPDATE
            });
        } catch (error) {
            console.error('Error updating payment status:', error);
        }
    }

    static async getPaymentRecord(paymentId) {
        try {
            const query = 'SELECT * FROM payments WHERE id = ?';
            const results = await sequelize.query(query, {
                replacements: [paymentId],
                type: sequelize.QueryTypes.SELECT
            });
            return results[0] || null;
        } catch (error) {
            console.error('Error getting payment record:', error);
            return null;
        }
    }

    // Get payment history for user
    static async getPaymentHistory(userId, limit = 10) {
        try {
            const query = `
                SELECT * FROM payments 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            `;
            
            const results = await sequelize.query(query, {
                replacements: [userId, limit],
                type: sequelize.QueryTypes.SELECT
            });
            return results;
        } catch (error) {
            console.error('Error getting payment history:', error);
            return [];
        }
    }

    // Get payment details
    static async getPaymentDetails(paymentId) {
        try {
            const query = 'SELECT * FROM payments WHERE id = ?';
            const results = await sequelize.query(query, {
                replacements: [paymentId],
                type: sequelize.QueryTypes.SELECT
            });
            return results[0] || null;
        } catch (error) {
            console.error('Error getting payment details:', error);
            return null;
        }
    }

    // Execute custom query for admin operations
    static async executeQuery(query, replacements = []) {
        try {
            const results = await sequelize.query(query, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });
            return results;
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }
}

module.exports = MidtransPaymentService;
