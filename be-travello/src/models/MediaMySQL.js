const mysql = require('mysql2/promise');
const crypto = require('crypto');

const { MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;

// Dedicated pool for media operations
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

class MediaMySQL {
    static generateId() {
        return crypto.randomBytes(24).toString('hex');
    }

    static async create({ fileName = null, mimeType, buffer }) {
        if (!mimeType) throw new Error('mimeType is required');
        if (!buffer || !Buffer.isBuffer(buffer)) throw new Error('buffer is required');

        const id = MediaMySQL.generateId();
        const sizeBytes = buffer.length;

        await pool.execute(
            'INSERT INTO media (id, fileName, mimeType, sizeBytes, data) VALUES (?, ?, ?, ?, ?)',
            [id, fileName, mimeType, sizeBytes, buffer]
        );

        return {
            id,
            fileName,
            mimeType,
            sizeBytes
        };
    }

    static async getMetaById(id) {
        const [rows] = await pool.execute(
            'SELECT id, fileName, mimeType, sizeBytes, createdAt FROM media WHERE id = ? LIMIT 1',
            [id]
        );
        return rows && rows.length ? rows[0] : null;
    }

    static async getDataById(id) {
        const [rows] = await pool.execute(
            'SELECT id, fileName, mimeType, sizeBytes, data FROM media WHERE id = ? LIMIT 1',
            [id]
        );
        return rows && rows.length ? rows[0] : null;
    }
}

module.exports = MediaMySQL;
