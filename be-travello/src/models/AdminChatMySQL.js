const mysql = require('mysql2/promise');

class AdminChatMySQL {
    constructor() {
        this.tableName = 'admin_chats';
        this.messagesTable = 'admin_chat_messages';
    }

    async initializeTable() {
        try {
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || 'localhost',
                port: process.env.MYSQL_PORT || 3306,
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'travello_db'
            });

            // Create admin_chats table
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS ${this.tableName} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sessionId VARCHAR(255) UNIQUE NOT NULL,
                    userId VARCHAR(255),
                    userName VARCHAR(255) NOT NULL,
                    userEmail VARCHAR(255) NOT NULL,
                    userPhone VARCHAR(50),
                    isGuest BOOLEAN DEFAULT TRUE,
                    status ENUM('active', 'waiting', 'closed', 'archived') DEFAULT 'waiting',
                    assignedAdmin VARCHAR(255),
                    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
                    category ENUM('general', 'support', 'sales', 'complaint', 'technical') DEFAULT 'general',
                    tags JSON,
                    unreadCount_user INT DEFAULT 0,
                    unreadCount_admin INT DEFAULT 0,
                    lastMessage TEXT,
                    lastMessageSender VARCHAR(50),
                    resolvedAt TIMESTAMP NULL,
                    resolutionNotes TEXT,
                    satisfactionRating INT,
                    satisfactionFeedback TEXT,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    lastActivityAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // Create admin_chat_messages table
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS ${this.messagesTable} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sessionId VARCHAR(255) NOT NULL,
                    sender ENUM('user', 'admin') NOT NULL,
                    senderId VARCHAR(255),
                    senderName VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    messageType ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
                    fileUrl VARCHAR(500),
                    isRead BOOLEAN DEFAULT FALSE,
                    readAt TIMESTAMP NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    edited BOOLEAN DEFAULT FALSE,
                    editedAt TIMESTAMP NULL,
                    FOREIGN KEY (sessionId) REFERENCES ${this.tableName}(sessionId) ON DELETE CASCADE
                )
            `);

            await connection.end();
            console.log('✅ AdminChat MySQL tables initialized');
        } catch (error) {
            console.error('❌ Error initializing AdminChat MySQL tables:', error);
        }
    }

    async findOrCreateChat(userInfo, userId = null) {
        try {
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || 'localhost',
                port: process.env.MYSQL_PORT || 3306,
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'travello_db'
            });

            // Find existing chat
            const [existing] = await connection.execute(
                `SELECT * FROM ${this.tableName} WHERE (userId = ? OR userEmail = ?) AND status IN ('active', 'waiting')`,
                [userId, userInfo.email]
            );

            if (existing.length > 0) {
                await connection.end();
                return existing[0];
            }

            // Create new chat session
            const sessionId = 'CHAT' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
            await connection.execute(
                `INSERT INTO ${this.tableName} (sessionId, userId, userName, userEmail, userPhone, isGuest) VALUES (?, ?, ?, ?, ?, ?)`,
                [sessionId, userId, userInfo.name, userInfo.email, userInfo.phone, !userId]
            );

            const [newChat] = await connection.execute(
                `SELECT * FROM ${this.tableName} WHERE sessionId = ?`,
                [sessionId]
            );

            await connection.end();
            return newChat[0];
        } catch (error) {
            console.error('❌ Error in findOrCreateChat:', error);
            throw error;
        }
    }

    async getActiveChats(adminId = null) {
        try {
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || 'localhost',
                port: process.env.MYSQL_PORT || 3306,
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'travello_db'
            });

            let query = `SELECT * FROM ${this.tableName} WHERE status IN ('active', 'waiting')`;
            let params = [];

            if (adminId) {
                query += ` AND assignedAdmin = ?`;
                params.push(adminId);
            }

            query += ` ORDER BY FIELD(priority, 'urgent', 'high', 'medium', 'low'), lastActivityAt DESC`;

            const [chats] = await connection.execute(query, params);
            await connection.end();
            return chats;
        } catch (error) {
            console.error('❌ Error in getActiveChats:', error);
            return [];
        }
    }

    async addMessage(sessionId, sender, message, senderName, senderId = null, messageType = 'text') {
        try {
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || 'localhost',
                port: process.env.MYSQL_PORT || 3306,
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'travello_db'
            });

            // Add message
            await connection.execute(
                `INSERT INTO ${this.messagesTable} (sessionId, sender, senderId, senderName, message, messageType) VALUES (?, ?, ?, ?, ?, ?)`,
                [sessionId, sender, senderId, senderName, message, messageType]
            );

            // Update chat session
            const unreadField = sender === 'admin' ? 'unreadCount_user' : 'unreadCount_admin';
            await connection.execute(
                `UPDATE ${this.tableName} SET lastMessage = ?, lastMessageSender = ?, lastActivityAt = CURRENT_TIMESTAMP, ${unreadField} = ${unreadField} + 1 WHERE sessionId = ?`,
                [message, sender, sessionId]
            );

            await connection.end();
        } catch (error) {
            console.error('❌ Error in addMessage:', error);
            throw error;
        }
    }

    async findChatBySessionId(sessionId) {
        try {
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || 'localhost',
                port: process.env.MYSQL_PORT || 3306,
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'travello_db'
            });

            const [chats] = await connection.execute(
                `SELECT * FROM ${this.tableName} WHERE sessionId = ?`,
                [sessionId]
            );

            await connection.end();
            return chats.length > 0 ? chats[0] : null;
        } catch (error) {
            console.error('❌ Error in findChatBySessionId:', error);
            return null;
        }
    }

    async getMessages(sessionId) {
        try {
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || 'localhost',
                port: process.env.MYSQL_PORT || 3306,
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'travello_db'
            });

            const [messages] = await connection.execute(
                `SELECT * FROM ${this.messagesTable} WHERE sessionId = ? ORDER BY timestamp ASC`,
                [sessionId]
            );

            await connection.end();
            return messages;
        } catch (error) {
            console.error('❌ Error in getMessages:', error);
            return [];
        }
    }
}

module.exports = new AdminChatMySQL();
