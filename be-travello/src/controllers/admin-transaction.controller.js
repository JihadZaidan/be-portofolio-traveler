const { db } = require('../config/database.config.js');

class AdminTransactionController {
    // Get all transactions with pagination and filtering
    static async getAllTransactions(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                status = null, 
                search = '',
                dateRange = 'all' 
            } = req.query;

            const parsedPage = parseInt(page);
            const parsedLimit = parseInt(limit);
            const offset = (parsedPage - 1) * parsedLimit;

            let query = `
                SELECT 
                    id,
                    trxCode,
                    orderCode,
                    buyerName,
                    buyerEmail,
                    sellerName,
                    sellerService,
                    grossAmount,
                    adminFee,
                    netAmount,
                    status,
                    paymentMethod,
                    paidStatus,
                    date,
                    created_at,
                    updated_at
                FROM admin_transactions
                WHERE 1=1
            `;

            let params = [];

            // Add status filter
            if (status && status !== 'all') {
                query += ` AND status = ?`;
                params.push(status);
            }

            // Add search filter
            if (search && search.trim()) {
                query += ` AND (
                    trxCode LIKE ? OR 
                    orderCode LIKE ? OR 
                    buyerName LIKE ? OR 
                    buyerEmail LIKE ? OR 
                    sellerName LIKE ? OR 
                    sellerService LIKE ?
                )`;
                const searchPattern = `%${search.trim()}%`;
                params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
            }

            // Add date range filter
            if (dateRange !== 'all') {
                const now = new Date();
                let startDate;

                switch (dateRange) {
                    case '7d':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case '30d':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case 'this_month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    default:
                        startDate = null;
                }

                if (startDate) {
                    query += ` AND created_at >= ?`;
                    params.push(startDate.toISOString());
                }
            }

            // Get total count
            const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
            const countResult = await db.prepare(countQuery).get(...params);
            const total = countResult.total;

            // Add ordering and pagination
            query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
            params.push(parsedLimit, offset);

            // Get transactions
            const transactions = await db.prepare(query).all(...params);

            res.json({
                success: true,
                data: {
                    transactions,
                    pagination: {
                        page: parsedPage,
                        limit: parsedLimit,
                        total,
                        totalPages: Math.ceil(total / parsedLimit),
                        hasNext: parsedPage < Math.ceil(total / parsedLimit),
                        hasPrev: parsedPage > 1
                    }
                }
            });

        } catch (error) {
            console.error('Get all transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve transactions',
                error: error.message
            });
        }
    }

    // Get transaction by ID
    static async getTransactionById(req, res) {
        try {
            const { id } = req.params;

            const transaction = await db.prepare(`
                SELECT * FROM admin_transactions WHERE id = ?
            `).get(id);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            // Get payment details
            const paymentDetails = await db.prepare(`
                SELECT * FROM payments WHERE id = ?
            `).get(id);

            // Get transaction history
            const transactionHistory = await db.prepare(`
                SELECT * FROM payment_transactions 
                WHERE payment_id = ? 
                ORDER BY created_at DESC
            `).all(id);

            res.json({
                success: true,
                data: {
                    transaction,
                    paymentDetails,
                    transactionHistory
                }
            });

        } catch (error) {
            console.error('Get transaction by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve transaction',
                error: error.message
            });
        }
    }

    // Update transaction status
    static async updateTransactionStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const adminUserId = req.user?.id || 'admin';

            // Validate status
            const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                });
            }

            // Get current transaction
            const currentTransaction = await db.prepare(`
                SELECT * FROM payments WHERE id = ?
            `).get(id);

            if (!currentTransaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            // Update payment status
            await db.prepare(`
                UPDATE payments 
                SET status = ?, updated_at = datetime('now')
                WHERE id = ?
            `).run(status, id);

            // Log the status change
            await db.prepare(`
                INSERT INTO payment_transactions (
                    id, payment_id, type, amount, currency, description, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `).run(
                `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                id,
                'adjustment',
                0,
                'IDR',
                `Status changed from ${currentTransaction.status} to ${status} by admin ${adminUserId}`,
                'completed'
            );

            // Get updated transaction
            const updatedTransaction = await db.prepare(`
                SELECT * FROM admin_transactions WHERE id = ?
            `).get(id);

            res.json({
                success: true,
                message: 'Transaction status updated successfully',
                data: updatedTransaction
            });

        } catch (error) {
            console.error('Update transaction status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update transaction status',
                error: error.message
            });
        }
    }

    // Get payment statistics
    static async getPaymentStats(req, res) {
        try {
            const { dateRange = 'all' } = req.query;

            let dateFilter = '';
            if (dateRange !== 'all') {
                switch (dateRange) {
                    case '7d':
                        dateFilter = "AND created_at >= datetime('now', '-7 days')";
                        break;
                    case '30d':
                        dateFilter = "AND created_at >= datetime('now', '-30 days')";
                        break;
                    case 'this_month':
                        dateFilter = "AND created_at >= date('now', 'start of month')";
                        break;
                }
            }

            const stats = await db.prepare(`
                SELECT 
                    COUNT(*) as total_transactions,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
                    COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded_transactions,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_transactions,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
                    SUM(amount) as total_amount,
                    AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as average_transaction,
                    MAX(amount) as largest_transaction,
                    MIN(amount) as smallest_transaction
                FROM payments
                WHERE 1=1 ${dateFilter}
            `).get();

            // Get payment method stats
            const methodStats = await db.prepare(`
                SELECT 
                    method,
                    COUNT(*) as count,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as revenue,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_count
                FROM payments
                WHERE 1=1 ${dateFilter}
                GROUP BY method
                ORDER BY revenue DESC
            `).all();

            res.json({
                success: true,
                data: {
                    statistics: stats,
                    methodBreakdown: methodStats
                }
            });

        } catch (error) {
            console.error('Get payment stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve payment statistics',
                error: error.message
            });
        }
    }

    // Export transactions to CSV
    static async exportTransactions(req, res) {
        try {
            const { status = null, dateRange = 'all' } = req.query;

            let query = `
                SELECT 
                    trxCode as "Transaction ID",
                    orderCode as "Order Code",
                    buyerName as "Buyer Name",
                    buyerEmail as "Buyer Email",
                    sellerName as "Seller Name",
                    sellerService as "Service",
                    grossAmount as "Gross Amount",
                    adminFee as "Admin Fee",
                    netAmount as "Net Amount",
                    status as "Status",
                    paymentMethod as "Payment Method",
                    paidStatus as "Payment Status",
                    date as "Date",
                    created_at as "Created At"
                FROM admin_transactions
                WHERE 1=1
            `;

            let params = [];

            // Add filters
            if (status && status !== 'all') {
                query += ` AND status = ?`;
                params.push(status);
            }

            if (dateRange !== 'all') {
                const now = new Date();
                let startDate;

                switch (dateRange) {
                    case '7d':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case '30d':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case 'this_month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                }

                if (startDate) {
                    query += ` AND created_at >= ?`;
                    params.push(startDate.toISOString());
                }
            }

            query += ` ORDER BY created_at DESC`;

            const transactions = await db.prepare(query).all(...params);

            // Convert to CSV
            const csv = [
                Object.keys(transactions[0] || {}).join(','),
                ...transactions.map(row => Object.values(row).map(val => `"${val}"`).join(','))
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`);
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
}

module.exports = AdminTransactionController;
