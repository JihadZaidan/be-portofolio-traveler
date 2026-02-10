const MidtransPaymentService = require('../services/payment.service.js');

// Helper function to map Midtrans status to frontend status
const mapMidtransStatus = (midtransStatus) => {
    const statusMap = {
        'settlement': 'paid',
        'pending': 'processing',
        'authorize': 'processing',
        'deny': 'cancelled',
        'expire': 'cancelled',
        'cancel': 'cancelled',
        'refund': 'refunded'
    };
    return statusMap[midtransStatus] || 'processing';
};

class MidtransPaymentController {
    // Create Midtrans payment
    static async createPayment(req, res) {
        try {
            const { 
                amount, 
                customerDetails, 
                itemDetails, 
                orderId,
                callbacks 
            } = req.body;

            // Validate required fields
            if (!amount || !customerDetails || !itemDetails || !orderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount, customer details, item details, and order ID are required'
                });
            }

            // Validate customer details
            if (!customerDetails.firstName || !customerDetails.lastName || !customerDetails.email) {
                return res.status(400).json({
                    success: false,
                    message: 'Customer first name, last name, and email are required'
                });
            }

            // Validate item details
            if (!Array.isArray(itemDetails) || itemDetails.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Item details must be a non-empty array'
                });
            }

            // Create payment with Midtrans
            const paymentResult = await MidtransPaymentService.createPayment({
                amount: parseFloat(amount),
                customerDetails,
                itemDetails,
                orderId,
                callbacks: callbacks || {
                    finish: `${req.protocol}://${req.get('host')}/shop/payment/payment-success`,
                    error: `${req.protocol}://${req.get('host')}/shop/payment/error`,
                    pending: `${req.protocol}://${req.get('host')}/shop/payment/pending`
                }
            });

            res.json({
                success: true,
                message: 'Payment created successfully',
                data: paymentResult
            });

        } catch (error) {
            console.error('Midtrans payment creation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create payment',
                error: error.message
            });
        }
    }

    // Get available payment methods (Midtrans supported)
    static async getPaymentMethods(req, res) {
        try {
            const methods = await MidtransPaymentService.getPaymentMethods();

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

    // Get payment status
    static async getPaymentStatus(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            const paymentStatus = await MidtransPaymentService.getPaymentStatus(orderId);

            res.json({
                success: true,
                data: paymentStatus
            });

        } catch (error) {
            console.error('Get payment status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment status',
                error: error.message
            });
        }
    }

    // Get payment history for user
    static async getPaymentHistory(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const userId = req.user?.id || 'current_user'; // Should come from auth middleware

            const payments = await MidtransPaymentService.getPaymentHistory(
                userId, 
                parseInt(limit)
            );

            res.json({
                success: true,
                data: {
                    payments,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: payments.length,
                        totalPages: Math.ceil(payments.length / limit)
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

            if (!paymentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment ID is required'
                });
            }

            const payment = await MidtransPaymentService.getPaymentDetails(paymentId);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            res.json({
                success: true,
                data: payment
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

    // Process refund
    static async refundPayment(req, res) {
        try {
            const { paymentId } = req.params;
            const { reason } = req.body;

            if (!paymentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment ID is required'
                });
            }

            const refundResult = await MidtransPaymentService.processRefund(paymentId, reason);

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

    // Webhook handler for Midtrans notifications
    static async handleWebhook(req, res) {
        try {
            const notification = req.body;

            // Verify webhook signature (in production)
            const signature = req.headers['x-callback-signature'];
            if (signature && !this.verifyWebhookSignature(notification, signature)) {
                return res.status(401).json({ message: 'Invalid signature' });
            }

            // Process different notification types
            if (notification.transaction_status) {
                const { order_id, transaction_status, gross_amount, payment_type } = notification;

                // Update payment status in database
                await MidtransPaymentService.getPaymentStatus(order_id);

                console.log(`Payment notification: Order ${order_id} - Status ${transaction_status} - Amount ${gross_amount} - Type ${payment_type}`);
            }

            res.status(200).json({ message: 'Webhook received' });

        } catch (error) {
            console.error('Webhook handling error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process webhook',
                error: error.message
            });
        }
    }

    // Helper method to map Midtrans status to frontend status
    static mapMidtransStatus(midtransStatus) {
        const statusMap = {
            'settlement': 'paid',
            'pending': 'processing',
            'authorize': 'processing',
            'deny': 'cancelled',
            'expire': 'cancelled',
            'cancel': 'cancelled',
            'refund': 'refunded'
        };
        return statusMap[midtransStatus] || 'processing';
    }

    // Get all transactions for admin (with pagination and filtering)
    static async getAllTransactionsForAdmin(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                status, 
                paymentMethod, 
                dateFrom, 
                dateTo,
                search 
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Build WHERE conditions
            let whereConditions = [];
            let replacements = [];

            if (status && status !== 'all') {
                whereConditions.push('status = ?');
                replacements.push(status);
            }

            if (paymentMethod && paymentMethod !== 'all') {
                whereConditions.push('method = ?');
                replacements.push(paymentMethod);
            }

            if (dateFrom) {
                whereConditions.push('DATE(created_at) >= ?');
                replacements.push(dateFrom);
            }

            if (dateTo) {
                whereConditions.push('DATE(created_at) <= ?');
                replacements.push(dateTo);
            }

            if (search) {
                whereConditions.push('(order_id LIKE ? OR description LIKE ? OR customer_info LIKE ?)');
                const searchPattern = `%${search}%`;
                replacements.push(searchPattern, searchPattern, searchPattern);
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM payments ${whereClause}`;
            const countResult = await MidtransPaymentService.executeQuery(countQuery, replacements);
            const total = countResult[0]?.total || 0;

            // Get transactions
            const query = `
                SELECT * FROM payments 
                ${whereClause}
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            `;
            
            const transactions = await MidtransPaymentService.executeQuery(query, [
                ...replacements,
                parseInt(limit),
                offset
            ]);

            // Format transactions for frontend
            const formattedTransactions = transactions.map(payment => {
                const customerInfo = JSON.parse(payment.customer_info || '{}');
                return {
                    id: payment.id,
                    trxCode: `TRX-${payment.id.slice(-8)}`,
                    orderCode: payment.order_id,
                    buyerName: `${customerInfo.firstName || 'Customer'} ${customerInfo.lastName || ''}`,
                    buyerEmail: customerInfo.email || 'customer@example.com',
                    sellerName: 'TRAVELLO',
                    sellerService: payment.description,
                    grossAmount: payment.amount,
                    adminFee: payment.processing_fee,
                    netAmount: payment.total_amount,
                    status: mapMidtransStatus(payment.status),
                    paymentMethod: payment.method,
                    paidStatus: payment.status === 'settlement' ? 'paid' : 'unpaid',
                    date: new Date(payment.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    }),
                    transactionId: payment.transaction_id,
                    paymentGatewayResponse: payment.payment_gateway_response
                };
            });

            res.json({
                success: true,
                data: {
                    transactions: formattedTransactions,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages: Math.ceil(total / parseInt(limit))
                    }
                }
            });

        } catch (error) {
            console.error('Get all transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get transactions',
                error: error.message
            });
        }
    }

    // Get transaction statistics for admin dashboard
    static async getTransactionStats(req, res) {
        try {
            const { period = '30d' } = req.query;

            let dateCondition = '';
            if (period === '7d') {
                dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
            } else if (period === '30d') {
                dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
            } else if (period === 'this_month') {
                dateCondition = 'AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())';
            }

            const statsQuery = `
                SELECT 
                    COUNT(*) as total_transactions,
                    SUM(CASE WHEN status = 'settlement' THEN amount ELSE 0 END) as total_revenue,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                    SUM(CASE WHEN status = 'settlement' THEN 1 ELSE 0 END) as completed_count,
                    SUM(CASE WHEN status = 'deny' OR status = 'expire' OR status = 'cancel' THEN 1 ELSE 0 END) as failed_count,
                    AVG(CASE WHEN status = 'settlement' THEN amount END) as avg_transaction_value
                FROM payments 
                WHERE 1=1 ${dateCondition}
            `;

            const stats = await MidtransPaymentService.executeQuery(statsQuery);
            const statsData = stats[0] || {};

            // Get daily revenue for the period
            const revenueQuery = `
                SELECT 
                    DATE(created_at) as date,
                    SUM(CASE WHEN status = 'settlement' THEN amount ELSE 0 END) as revenue,
                    COUNT(*) as transactions
                FROM payments 
                WHERE 1=1 ${dateCondition}
                GROUP BY DATE(created_at)
                ORDER BY date DESC
                LIMIT 30
            `;

            const dailyRevenue = await MidtransPaymentService.executeQuery(revenueQuery);

            res.json({
                success: true,
                data: {
                    totalTransactions: statsData.total_transactions || 0,
                    totalRevenue: statsData.total_revenue || 0,
                    pendingCount: statsData.pending_count || 0,
                    completedCount: statsData.completed_count || 0,
                    failedCount: statsData.failed_count || 0,
                    avgTransactionValue: statsData.avg_transaction_value || 0,
                    dailyRevenue
                }
            });

        } catch (error) {
            console.error('Get transaction stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get transaction statistics',
                error: error.message
            });
        }
    }

    // Sync payment status with Midtrans
    static async syncPaymentStatus(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            // Get current status from Midtrans
            const paymentStatus = await MidtransPaymentService.getPaymentStatus(orderId);

            res.json({
                success: true,
                message: 'Payment status synced successfully',
                data: paymentStatus
            });

        } catch (error) {
            console.error('Sync payment status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to sync payment status',
                error: error.message
            });
        }
    }

    // Export transactions to CSV
    static async exportTransactions(req, res) {
        try {
            const { status, paymentMethod, dateFrom, dateTo } = req.query;

            // Build WHERE conditions
            let whereConditions = [];
            let replacements = [];

            if (status && status !== 'all') {
                whereConditions.push('status = ?');
                replacements.push(status);
            }

            if (paymentMethod && paymentMethod !== 'all') {
                whereConditions.push('method = ?');
                replacements.push(paymentMethod);
            }

            if (dateFrom) {
                whereConditions.push('DATE(created_at) >= ?');
                replacements.push(dateFrom);
            }

            if (dateTo) {
                whereConditions.push('DATE(created_at) <= ?');
                replacements.push(dateTo);
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            const query = `
                SELECT * FROM payments 
                ${whereClause}
                ORDER BY created_at DESC
            `;
            
            const transactions = await MidtransPaymentService.executeQuery(query, replacements);

            // Format for CSV
            const csvData = transactions.map(payment => {
                const customerInfo = JSON.parse(payment.customer_info || '{}');
                return {
                    'Transaction ID': payment.id,
                    'Order ID': payment.order_id,
                    'Customer Name': `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`,
                    'Customer Email': customerInfo.email || '',
                    'Amount': payment.amount,
                    'Status': payment.status,
                    'Payment Method': payment.method,
                    'Created At': new Date(payment.created_at).toISOString()
                };
            });

            // Convert to CSV
            const csv = this.convertToCSV(csvData);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csv);

        } catch (error) {
            console.error('Export transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to export transactions',
                error: error.message
            });
        }
    }

    // Helper method to convert array of objects to CSV
    static convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',');
        });

        return [csvHeaders, ...csvRows].join('\n');
    }

    // Verify webhook signature (for production)
    static verifyWebhookSignature(notification, signature) {
        try {
            const crypto = require('crypto');
            
            // Create SHA512 hash of the notification body
            const hash = crypto.createHash('sha512')
                .update(JSON.stringify(notification))
                .digest('hex');
            
            // Compare with provided signature
            const expectedSignature = hash;
            
            return signature === expectedSignature;
        } catch (error) {
            console.error('Webhook signature verification error:', error);
            return false;
        }
    }
}

module.exports = MidtransPaymentController;
