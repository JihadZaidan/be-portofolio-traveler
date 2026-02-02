import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.config.js';

class PaymentController {
    // Process payment
    static async processPayment(req, res) {
        try {
            const { 
                method, 
                amount, 
                currency = 'IDR', 
                description, 
                bookingId,
                customerInfo 
            } = req.body;

            // Validate required fields
            if (!method || !amount || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'Method, amount, and description are required'
                });
            }

            // Validate payment method
            const validMethods = ['credit_card', 'bank_transfer', 'ewallet', 'virtual_account'];
            if (!validMethods.includes(method)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment method'
                });
            }

            // Generate payment ID
            const paymentId = uuidv4();

            // Create payment record
            const payment = {
                id: paymentId,
                user_id: req.user.id,
                method,
                amount: parseFloat(amount),
                currency,
                description,
                booking_id: bookingId || null,
                customer_info: JSON.stringify(customerInfo || {}),
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Simulate payment processing (in real app, integrate with payment gateway)
            const paymentResult = await this.simulatePaymentGateway(payment);

            // Update payment status
            payment.status = paymentResult.status;
            payment.payment_gateway_response = JSON.stringify(paymentResult.gatewayResponse);

            res.json({
                success: true,
                message: 'Payment processed successfully',
                data: {
                    paymentId,
                    status: paymentResult.status,
                    amount: payment.amount,
                    currency: payment.currency,
                    method: payment.method,
                    gatewayResponse: paymentResult.gatewayResponse,
                    createdAt: payment.created_at
                }
            });

        } catch (error) {
            console.error('Payment processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process payment',
                error: error.message
            });
        }
    }

    // Get available payment methods
    static async getPaymentMethods(req, res) {
        try {
            const methods = [
                {
                    id: 'credit_card',
                    name: 'Credit Card',
                    description: 'Visa, Mastercard, JCB',
                    icon: '💳',
                    fees: 2.9, // percentage
                    available: true
                },
                {
                    id: 'bank_transfer',
                    name: 'Bank Transfer',
                    description: 'Transfer to virtual account',
                    icon: '🏦',
                    fees: 0,
                    available: true
                },
                {
                    id: 'ewallet',
                    name: 'E-Wallet',
                    description: 'GoPay, OVO, Dana, ShopeePay',
                    icon: '📱',
                    fees: 1.5,
                    available: true
                },
                {
                    id: 'virtual_account',
                    name: 'Virtual Account',
                    description: 'BCA, BNI, BRI, Mandiri VA',
                    icon: '🔢',
                    fees: 0,
                    available: true
                }
            ];

            res.json({
                success: true,
                data: methods
            });

        } catch (error) {
            console.error('Get payment methods error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment methods',
                error: error.message
            });
        }
    }

    // Get payment history
    static async getPaymentHistory(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const offset = (page - 1) * limit;

            // Mock payments data
            const mockPayments = [
                {
                    id: 'pay_001',
                    method: 'credit_card',
                    amount: 150000,
                    currency: 'IDR',
                    description: 'Hotel booking',
                    status: 'completed',
                    bookingId: 'booking_001',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'pay_002',
                    method: 'ewallet',
                    amount: 75000,
                    currency: 'IDR',
                    description: 'Transport booking',
                    status: 'completed',
                    bookingId: 'booking_002',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            // Filter by status if provided
            let filteredPayments = mockPayments;
            if (status) {
                filteredPayments = mockPayments.filter(p => p.status === status);
            }

            // Pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

            res.json({
                success: true,
                data: {
                    payments: paginatedPayments,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: filteredPayments.length,
                        totalPages: Math.ceil(filteredPayments.length / limit)
                    }
                }
            });

        } catch (error) {
            console.error('Get payment history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment history',
                error: error.message
            });
        }
    }

    // Get payment details
    static async getPaymentDetails(req, res) {
        try {
            const { paymentId } = req.params;

            // Mock payment data
            const mockPayment = {
                id: paymentId,
                method: 'credit_card',
                amount: 150000,
                currency: 'IDR',
                description: 'Hotel booking',
                status: 'completed',
                bookingId: 'booking_001',
                customerInfo: {
                    email: 'customer@example.com',
                    phone: '+62 81234567890'
                },
                gatewayResponse: {
                    transactionId: 'CC_' + Date.now(),
                    approvalCode: 'APPROV_123456',
                    maskedCard: '****-****-****-1234'
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            res.json({
                success: true,
                data: mockPayment
            });

        } catch (error) {
            console.error('Get payment details error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment details',
                error: error.message
            });
        }
    }

    // Refund payment
    static async refundPayment(req, res) {
        try {
            const { paymentId } = req.params;
            const { reason } = req.body;

            // Mock refund processing
            const refundResult = {
                refundId: 'REF_' + Date.now(),
                originalPaymentId: paymentId,
                amount: 150000,
                reason: reason || 'User requested refund',
                status: 'processed',
                processedAt: new Date().toISOString(),
                estimatedSettlement: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            };

            res.json({
                success: true,
                message: 'Payment refunded successfully',
                data: refundResult
            });

        } catch (error) {
            console.error('Refund payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to refund payment',
                error: error.message
            });
        }
    }

    // Verify payment status
    static async verifyPayment(req, res) {
        try {
            const { paymentId } = req.params;

            // Mock payment verification
            const mockPayment = {
                paymentId: paymentId,
                status: 'completed',
                verified: true,
                amount: 150000,
                currency: 'IDR',
                method: 'credit_card',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            res.json({
                success: true,
                data: mockPayment
            });

        } catch (error) {
            console.error('Verify payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify payment',
                error: error.message
            });
        }
    }

    // Simulate payment gateway (in real app, integrate with actual payment gateway)
    static async simulatePaymentGateway(payment) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate different payment methods
        const gatewayResponses = {
            credit_card: {
                transactionId: `CC_${Date.now()}`,
                approvalCode: `APPROV_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                maskedCard: '****-****-****-1234'
            },
            bank_transfer: {
                virtualAccount: `${Math.random().toString(36).substr(2, 8).toUpperCase()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                bankName: 'BCA Virtual Account',
                accountNumber: `1234567890${Math.floor(Math.random() * 1000)}`
            },
            ewallet: {
                transactionId: `EW_${Date.now()}`,
                referenceId: `REF_${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
                phoneNumber: '****-****-1234'
            },
            virtual_account: {
                vaNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                bankName: 'BCA Virtual Account',
                expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
        };

        // Simulate success/failure (90% success rate)
        const isSuccess = Math.random() > 0.1;

        return {
            status: isSuccess ? 'completed' : 'failed',
            gatewayResponse: gatewayResponses[payment.method] || {},
            processedAt: new Date().toISOString()
        };
    }
}

export default PaymentController;
