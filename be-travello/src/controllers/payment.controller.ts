import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { db } from '../config/database.config.js';

interface PaymentRequest {
    method: string;
    amount: number;
    currency?: string;
    description: string;
    bookingId?: string;
    customerInfo?: any;
}

interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon: string;
    fees: number;
    available: boolean;
}

interface Payment {
    id: string;
    user_id: string;
    method: string;
    amount: number;
    currency: string;
    description: string;
    booking_id?: string;
    customer_info: string;
    status: string;
    created_at: string;
    updated_at: string;
}

interface PaymentGatewayResponse {
    transactionId?: string;
    approvalCode?: string;
    maskedCard?: string;
    virtualAccount?: string;
    bankName?: string;
    accountNumber?: string;
    referenceId?: string;
    phoneNumber?: string;
    vaNumber?: string;
    expiryDate?: string;
}

interface PaymentResult {
    status: string;
    gatewayResponse: PaymentGatewayResponse;
    processedAt: string;
}

interface RefundResult {
    refundId: string;
    originalPaymentId: string;
    amount: number;
    reason: string;
    processedAt: string;
    estimatedSettlement: string;
}

class PaymentController {
    // Process payment
    static async processPayment(req: Request & { user: { id: string } }, res: Response): Promise<void> {
        try {
            const { 
                method, 
                amount, 
                currency = 'IDR', 
                description, 
                bookingId,
                customerInfo 
            }: PaymentRequest = req.body;

            // Validate required fields
            if (!method || !amount || !description) {
                res.status(400).json({
                    success: false,
                    message: 'Method, amount, and description are required'
                });
                return;
            }

            // Validate payment method
            const validMethods = ['credit_card', 'bank_transfer', 'ewallet', 'virtual_account'];
            if (!validMethods.includes(method)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid payment method'
                });
                return;
            }

            // Generate payment ID
            const paymentId = uuidv4();

            // Create payment record
            const payment: Payment = {
                id: paymentId,
                user_id: req.user.id,
                method,
                amount: parseFloat(amount.toString()),
                currency,
                description,
                booking_id: bookingId || null,
                customer_info: JSON.stringify(customerInfo || {}),
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Save to database
            const stmt = db.prepare('INSERT INTO payments (id, user_id, method, amount, currency, description, booking_id, customer_info, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            const result = await stmt.run(
                payment.id,
                payment.user_id,
                payment.method,
                payment.amount,
                payment.currency,
                payment.description,
                payment.booking_id,
                payment.customer_info,
                payment.status,
                payment.created_at,
                payment.updated_at
            );

            // Simulate payment processing (in real app, integrate with payment gateway)
            const paymentResult = await this.simulatePaymentGateway(payment);

            // Update payment status
            const updateStmt = db.prepare('UPDATE payments SET status = ?, updated_at = ?, payment_gateway_response = ? WHERE id = ?');
            await updateStmt.run(
                paymentResult.status,
                new Date().toISOString(),
                JSON.stringify(paymentResult.gatewayResponse),
                paymentId
            );

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

        } catch (error: any) {
            console.error('Payment processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process payment',
                error: error.message
            });
        }
    }

    // Get available payment methods
    static async getPaymentMethods(req: Request, res: Response): Promise<void> {
        try {
            const methods: PaymentMethod[] = [
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

        } catch (error: any) {
            console.error('Get payment methods error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment methods',
                error: error.message
            });
        }
    }

    // Get payment history
    static async getPaymentHistory(req: Request & { user: { id: string } }, res: Response): Promise<void> {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const offset = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

            let query = 'SELECT * FROM payments WHERE user_id = ?';
            let params: any[] = [req.user.id];

            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit.toString()), offset);

            const payments = await db.prepare(query).all(...params);

            // Format payments
            const formattedPayments = payments.map((payment: any) => ({
                id: payment.id,
                method: payment.method,
                amount: payment.amount,
                currency: payment.currency,
                description: payment.description,
                status: payment.status,
                bookingId: payment.booking_id,
                createdAt: payment.created_at,
                updatedAt: payment.updated_at
            }));

            // Get total count
            const countQuery = status 
                ? 'SELECT COUNT(*) as total FROM payments WHERE user_id = ? AND status = ?'
                : 'SELECT COUNT(*) as total FROM payments WHERE user_id = ?';
            
            const countParams = status ? [req.user.id, status] : [req.user.id];
            const countResult = await db.prepare(countQuery).get(...countParams);

            res.json({
                success: true,
                data: {
                    payments: formattedPayments,
                    pagination: {
                        page: parseInt(page.toString()),
                        limit: parseInt(limit.toString()),
                        total: countResult.total,
                        totalPages: Math.ceil(countResult.total / parseInt(limit.toString()))
                    }
                }
            });

        } catch (error: any) {
            console.error('Get payment history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment history',
                error: error.message
            });
        }
    }

    // Get payment details
    static async getPaymentDetails(req: Request & { user: { id: string } }, res: Response): Promise<void> {
        try {
            const { paymentId } = req.params;

            const payment = await db.prepare('SELECT * FROM payments WHERE id = ? AND user_id = ?').get(paymentId, req.user.id);

            if (!payment) {
                res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
                return;
            }

            // Format payment details
            const paymentDetails = {
                id: payment.id,
                method: payment.method,
                amount: payment.amount,
                currency: payment.currency,
                description: payment.description,
                status: payment.status,
                bookingId: payment.booking_id,
                customerInfo: JSON.parse(payment.customer_info || '{}'),
                gatewayResponse: JSON.parse(payment.payment_gateway_response || '{}'),
                createdAt: payment.created_at,
                updatedAt: payment.updated_at
            };

            res.json({
                success: true,
                data: paymentDetails
            });

        } catch (error: any) {
            console.error('Get payment details error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment details',
                error: error.message
            });
        }
    }

    // Refund payment
    static async refundPayment(req: Request & { user: { id: string } }, res: Response): Promise<void> {
        try {
            const { paymentId } = req.params;
            const { reason } = req.body;

            const payment = await db.prepare('SELECT * FROM payments WHERE id = ? AND user_id = ?').get(paymentId, req.user.id);

            if (!payment) {
                res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
                return;
            }

            if (payment.status !== 'completed') {
                res.status(400).json({
                    success: false,
                    message: 'Only completed payments can be refunded'
                });
                return;
            }

            // Simulate refund process
            const refundResult = await this.simulateRefund(payment, reason);

            // Update payment status
            await db.prepare('UPDATE payments SET status = ?, updated_at = ?, refund_reason = ?, refund_processed_at = ? WHERE id = ?').run(
                'refunded',
                new Date().toISOString(),
                reason || 'User requested refund',
                new Date().toISOString(),
                paymentId
            );

            res.json({
                success: true,
                message: 'Payment refunded successfully',
                data: {
                    paymentId,
                    refundId: refundResult.refundId,
                    amount: payment.amount,
                    refundReason: reason,
                    processedAt: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('Refund payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to refund payment',
                error: error.message
            });
        }
    }

    // Verify payment status
    static async verifyPayment(req: Request & { user: { id: string } }, res: Response): Promise<void> {
        try {
            const { paymentId } = req.params;

            const payment = await db.prepare('SELECT * FROM payments WHERE id = ? AND user_id = ?').get(paymentId, req.user.id);

            if (!payment) {
                res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
                return;
            }

            res.json({
                success: true,
                data: {
                    paymentId: payment.id,
                    status: payment.status,
                    verified: payment.status === 'completed',
                    amount: payment.amount,
                    currency: payment.currency,
                    method: payment.method,
                    createdAt: payment.created_at,
                    updatedAt: payment.updated_at
                }
            });

        } catch (error: any) {
            console.error('Verify payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify payment',
                error: error.message
            });
        }
    }

    // Simulate payment gateway (in real app, integrate with actual payment gateway)
    static async simulatePaymentGateway(payment: Payment): Promise<PaymentResult> {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate different payment methods
        const gatewayResponses: Record<string, PaymentGatewayResponse> = {
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

    // Simulate refund process
    static async simulateRefund(payment: Payment, reason?: string): Promise<RefundResult> {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            refundId: `REF_${Date.now()}`,
            originalPaymentId: payment.id,
            amount: payment.amount,
            reason: reason || 'User requested refund',
            processedAt: new Date().toISOString(),
            estimatedSettlement: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
    }
}

export default PaymentController;
