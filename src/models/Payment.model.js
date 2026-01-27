import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.config.js';

class PaymentModel {
    // Create new payment
    static async create(paymentData) {
        const payment = {
            id: uuidv4(),
            ...paymentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await db.prepare(`
            INSERT INTO payments (
                id, user_id, method, amount, currency, description, 
                booking_id, customer_info, status, payment_gateway_response,
                refund_reason, refund_processed_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            payment.id,
            payment.user_id,
            payment.method,
            payment.amount,
            payment.currency,
            payment.description,
            payment.booking_id,
            payment.customer_info,
            payment.status,
            payment.payment_gateway_response,
            payment.refund_reason,
            payment.refund_processed_at,
            payment.created_at,
            payment.updated_at
        );

        return payment;
    }

    // Find payment by ID and user ID
    static async findByIdAndUserId(paymentId, userId) {
        return await db.prepare('SELECT * FROM payments WHERE id = ? AND user_id = ?').get(paymentId, userId);
    }

    // Find all payments by user ID with pagination
    static async findByUserId(userId, options = {}) {
        const { page = 1, limit = 10, status } = options;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM payments WHERE user_id = ?';
        let params = [userId];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return await db.prepare(query).all(...params);
    }

    // Count payments by user ID
    static async countByUserId(userId, status = null) {
        let query = 'SELECT COUNT(*) as total FROM payments WHERE user_id = ?';
        let params = [userId];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        const result = await db.prepare(query).get(...params);
        return result.total;
    }

    // Update payment status
    static async updateStatus(paymentId, status, additionalData = {}) {
        const updateData = {
            status,
            updated_at: new Date().toISOString(),
            ...additionalData
        };

        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        values.push(paymentId);

        await db.prepare(`
            UPDATE payments 
            SET ${fields.map(field => `${field} = ?`).join(', ')}
            WHERE id = ?
        `).run(...values);

        return await this.findById(paymentId);
    }

    // Find payment by ID
    static async findById(paymentId) {
        return await db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
    }

    // Get payment statistics
    static async getPaymentStats(userId) {
        const stats = await db.prepare(`
            SELECT 
                COUNT(*) as total_payments,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
                COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded_payments,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
                AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as average_amount
            FROM payments 
            WHERE user_id = ?
        `).get(userId);

        return stats;
    }

    // Get monthly payment statistics
    static async getMonthlyStats(userId, months = 12) {
        return await db.prepare(`
            SELECT 
                strftime('%Y-%m', created_at) as month,
                COUNT(*) as payment_count,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount
            FROM payments 
            WHERE user_id = ? 
            AND created_at >= date('now', '-${months} months')
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month DESC
        `).all(userId);
    }

    // Get payment method statistics
    static async getMethodStats(userId) {
        return await db.prepare(`
            SELECT 
                method,
                COUNT(*) as payment_count,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_payments
            FROM payments 
            WHERE user_id = ?
            GROUP BY method
            ORDER BY total_amount DESC
        `).all(userId);
    }

    // Search payments
    static async searchPayments(userId, searchTerm, options = {}) {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        const query = `
            SELECT * FROM payments 
            WHERE user_id = ? 
            AND (description LIKE ? OR id LIKE ?)
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        const searchPattern = `%${searchTerm}%`;
        return await db.prepare(query).all(userId, searchPattern, searchPattern, limit, offset);
    }

    // Get recent payments
    static async getRecentPayments(userId, limit = 5) {
        return await db.prepare(`
            SELECT * FROM payments 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `).all(userId, limit);
    }

    // Delete payment (soft delete by updating status)
    static async softDelete(paymentId, userId) {
        await db.prepare(`
            UPDATE payments 
            SET status = 'deleted', updated_at = ?
            WHERE id = ? AND user_id = ?
        `).run(new Date().toISOString(), paymentId, userId);

        return await this.findByIdAndUserId(paymentId, userId);
    }
}

export default PaymentModel;
