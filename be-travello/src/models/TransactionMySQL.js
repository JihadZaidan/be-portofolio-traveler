const mysql = require('mysql2/promise');
const { MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;

// MySQL connection pool
const pool = mysql.createPool({
    host: MYSQL_HOST || 'localhost',
    port: MYSQL_PORT || 3306,
    database: MYSQL_DATABASE || 'travello_db',
    user: MYSQL_USER || 'root',
    password: MYSQL_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

class TransactionMySQL {
    // Get all transactions with pagination and filtering
    static async getAll(filters = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                status,
                search,
                startDate,
                endDate
            } = filters;

            const offset = (page - 1) * limit;
            
            let whereClause = '1=1';
            const params = [];

            // Status filter
            if (status && status !== 'all') {
                whereClause += ' AND status = ?';
                params.push(status);
            }

            // Search filter
            if (search) {
                whereClause += ' AND (serviceName LIKE ? OR transactionId LIKE ? OR JSON_EXTRACT(serviceDetails, "$.customFields.customerName") LIKE ? OR JSON_EXTRACT(serviceDetails, "$.customFields.customerEmail") LIKE ?)';
                const searchPattern = `%${search}%`;
                params.push(searchPattern, searchPattern, searchPattern, searchPattern);
            }

            // Date range filter
            if (startDate) {
                whereClause += ' AND createdAt >= ?';
                params.push(startDate);
            }
            if (endDate) {
                whereClause += ' AND createdAt <= ?';
                params.push(endDate);
            }

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM transactions 
                WHERE ${whereClause}
            `;
            const [countResult] = await pool.execute(countQuery, params);
            const total = countResult[0].total;

            // Get transactions
            const query = `
                SELECT * FROM transactions 
                WHERE ${whereClause}
                ORDER BY createdAt DESC 
                LIMIT ? OFFSET ?
            `;
            params.push(parseInt(limit), parseInt(offset));

            const [transactions] = await pool.execute(query, params);

            // Get statistics
            const statsQuery = `
                SELECT 
                    COUNT(*) as totalTransactions,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTransactions,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingTransactions,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledTransactions,
                    SUM(finalAmount) as totalRevenue
                FROM transactions
                WHERE ${whereClause}
            `;
            const [statsResult] = await pool.execute(statsQuery, params.slice(0, -2)); // Remove limit and offset

            return {
                success: true,
                data: {
                    transactions: transactions,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / limit),
                        totalTransactions: total,
                        limit: parseInt(limit)
                    },
                    stats: {
                        totalTransactions: statsResult[0].totalTransactions || 0,
                        completedTransactions: statsResult[0].completedTransactions || 0,
                        pendingTransactions: statsResult[0].pendingTransactions || 0,
                        cancelledTransactions: statsResult[0].cancelledTransactions || 0,
                        totalRevenue: statsResult[0].totalRevenue || 0
                    }
                }
            };
        } catch (error) {
            console.error('Error getting transactions:', error);
            return {
                success: false,
                message: 'Failed to retrieve transactions',
                error: error.message
            };
        }
    }

    // Get transaction by ID
    static async getById(transactionId) {
        try {
            const query = 'SELECT * FROM transactions WHERE transactionId = ?';
            const [transactions] = await pool.execute(query, [transactionId]);
            
            if (transactions.length === 0) {
                return {
                    success: false,
                    message: 'Transaction not found'
                };
            }

            return {
                success: true,
                data: {
                    transaction: transactions[0]
                }
            };
        } catch (error) {
            console.error('Error getting transaction by ID:', error);
            return {
                success: false,
                message: 'Failed to retrieve transaction',
                error: error.message
            };
        }
    }

    // Get transactions by user email
    static async getByUserEmail(userEmail) {
        try {
            const query = `
                SELECT * FROM transactions 
                WHERE JSON_EXTRACT(serviceDetails, "$.customFields.customerEmail") = ? 
                   OR userId = ?
                ORDER BY createdAt DESC
            `;
            const [transactions] = await pool.execute(query, [userEmail, userEmail]);

            return {
                success: true,
                data: {
                    transactions: transactions
                }
            };
        } catch (error) {
            console.error('Error getting transactions by email:', error);
            return {
                success: false,
                message: 'Failed to retrieve user transactions',
                error: error.message
            };
        }
    }

    // Create new transaction
    static async create(transactionData) {
        try {
            const {
                transactionId,
                userId,
                type,
                serviceName,
                description,
                amount,
                currency = 'IDR',
                discount = 0,
                tax = 0,
                finalAmount,
                paymentMethod,
                paymentStatus = 'pending',
                status = 'pending',
                notes,
                serviceDetails
            } = transactionData;

            const query = `
                INSERT INTO transactions (
                    transactionId, userId, type, serviceName, description, 
                    amount, currency, discount, tax, finalAmount,
                    paymentMethod, paymentStatus, status, notes, serviceDetails
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await pool.execute(query, [
                transactionId,
                userId,
                type,
                serviceName,
                description,
                amount,
                currency,
                discount,
                tax,
                finalAmount,
                paymentMethod,
                paymentStatus,
                status,
                notes,
                JSON.stringify(serviceDetails)
            ]);

            return {
                success: true,
                data: {
                    transactionId: transactionId,
                    insertId: result.insertId
                }
            };
        } catch (error) {
            console.error('Error creating transaction:', error);
            return {
                success: false,
                message: 'Failed to create transaction',
                error: error.message
            };
        }
    }

    // Update transaction status
    static async updateStatus(transactionId, status, adminNotes = null) {
        try {
            let query = 'UPDATE transactions SET status = ?';
            let params = [status];

            // Add timestamps based on status
            switch (status) {
                case 'confirmed':
                    query += ', confirmedAt = NOW()';
                    break;
                case 'in_progress':
                    query += ', startedAt = NOW()';
                    break;
                case 'completed':
                    query += ', completedAt = NOW()';
                    break;
                case 'cancelled':
                    query += ', cancelledAt = NOW()';
                    break;
            }

            if (adminNotes) {
                query += ', adminNotes = ?';
                params.push(adminNotes);
            }

            query += ' WHERE transactionId = ?';
            params.push(transactionId);

            await pool.execute(query, params);

            return {
                success: true,
                message: 'Transaction status updated successfully'
            };
        } catch (error) {
            console.error('Error updating transaction status:', error);
            return {
                success: false,
                message: 'Failed to update transaction status',
                error: error.message
            };
        }
    }

    // Delete transaction
    static async delete(transactionId) {
        try {
            const query = 'DELETE FROM transactions WHERE transactionId = ?';
            await pool.execute(query, [transactionId]);

            return {
                success: true,
                message: 'Transaction deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting transaction:', error);
            return {
                success: false,
                message: 'Failed to delete transaction',
                error: error.message
            };
        }
    }

    // Test database connection
    static async testConnection() {
        try {
            const [result] = await pool.execute('SELECT 1 as test');
            return {
                success: true,
                message: 'Database connection successful',
                data: result[0]
            };
        } catch (error) {
            console.error('Database connection error:', error);
            return {
                success: false,
                message: 'Database connection failed',
                error: error.message
            };
        }
    }

    // Close connection pool
    static async close() {
        try {
            await pool.end();
            return {
                success: true,
                message: 'Database connection closed'
            };
        } catch (error) {
            console.error('Error closing database:', error);
            return {
                success: false,
                message: 'Failed to close database connection',
                error: error.message
            };
        }
    }
}

module.exports = TransactionMySQL;
