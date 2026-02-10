-- ========================================
-- USER-ADMIN CHAT DATABASE SCHEMA
-- For 2-way communication between Users and Admins
-- ========================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS travello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE travello_db;

-- ========================================
-- USER-ADMIN CHAT MESSAGES TABLE
-- Enhanced version for 2-way communication
-- ========================================
CREATE TABLE IF NOT EXISTS user_admin_chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    sender_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    receiver_id VARCHAR(255),
    receiver_name VARCHAR(255),
    message TEXT NOT NULL,
    message_type ENUM('user_to_admin', 'admin_to_user', 'system') NOT NULL DEFAULT 'user_to_admin',
    room_id VARCHAR(255) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    attachment_url VARCHAR(500),
    attachment_type ENUM('image', 'file', 'video'),
    status ENUM('sent', 'delivered', 'read', 'failed') NOT NULL DEFAULT 'sent',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key to users table
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_chat_sender_id (sender_id),
    INDEX idx_chat_receiver_id (receiver_id),
    INDEX idx_chat_room_id (room_id),
    INDEX idx_chat_message_type (message_type),
    INDEX idx_chat_is_read (is_read),
    INDEX idx_chat_created_at (created_at),
    INDEX idx_chat_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ONLINE USERS STATUS TABLE
-- Track real-time user presence
-- ========================================
CREATE TABLE IF NOT EXISTS user_online_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    socket_id VARCHAR(255),
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    last_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('online', 'away', 'busy', 'offline') NOT NULL DEFAULT 'offline',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_online_user_id (user_id),
    INDEX idx_online_socket_id (socket_id),
    INDEX idx_online_is_online (is_online),
    INDEX idx_online_last_seen (last_seen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TYPING INDICATORS TABLE
-- Track who is typing in which conversation
-- ========================================
CREATE TABLE IF NOT EXISTS typing_indicators (
    id VARCHAR(255) PRIMARY KEY, -- Composite key: user_id-room_id
    conversation_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    is_typing BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_typing_conversation (conversation_id),
    INDEX idx_typing_user_id (user_id),
    INDEX idx_typing_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- CONVERSATION ROOMS TABLE
-- Track conversation metadata
-- ========================================
CREATE TABLE IF NOT EXISTS conversation_rooms (
    id VARCHAR(255) PRIMARY KEY, -- Format: user_{userId}_admin
    user_id VARCHAR(255) NOT NULL,
    admin_id VARCHAR(255),
    last_message_at DATETIME,
    last_message_preview TEXT,
    unread_count_for_admin INT NOT NULL DEFAULT 0,
    unread_count_for_user INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_room_user_id (user_id),
    INDEX idx_room_admin_id (admin_id),
    INDEX idx_room_last_message (last_message_at),
    INDEX idx_room_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Update conversation room when new message is sent
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_message_insert
AFTER INSERT ON user_admin_chat_messages
FOR EACH ROW
BEGIN
    INSERT INTO conversation_rooms (
        id, user_id, admin_id, last_message_at, 
        last_message_preview, unread_count_for_admin, unread_count_for_user
    ) VALUES (
        NEW.room_id,
        CASE WHEN NEW.message_type = 'user_to_admin' THEN NEW.sender_id ELSE NEW.receiver_id END,
        CASE WHEN NEW.message_type = 'admin_to_user' THEN NEW.sender_id ELSE NEW.receiver_id END,
        NEW.created_at,
        LEFT(NEW.message, 100),
        CASE WHEN NEW.message_type = 'user_to_admin' AND NEW.is_read = FALSE THEN 1 ELSE 0 END,
        CASE WHEN NEW.message_type = 'admin_to_user' AND NEW.is_read = FALSE THEN 1 ELSE 0 END
    )
    ON DUPLICATE KEY UPDATE
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.message, 100),
        unread_count_for_admin = unread_count_for_admin + 
            CASE WHEN NEW.message_type = 'user_to_admin' AND NEW.is_read = FALSE THEN 1 ELSE 0 END,
        unread_count_for_user = unread_count_for_user + 
            CASE WHEN NEW.message_type = 'admin_to_user' AND NEW.is_read = FALSE THEN 1 ELSE 0 END,
        updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Update unread counts when messages are marked as read
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_message_read_update
AFTER UPDATE ON user_admin_chat_messages
FOR EACH ROW
BEGIN
    IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        UPDATE conversation_rooms 
        SET 
            unread_count_for_admin = CASE 
                WHEN NEW.message_type = 'user_to_admin' 
                THEN GREATEST(unread_count_for_admin - 1, 0) 
                ELSE unread_count_for_admin 
            END,
            unread_count_for_user = CASE 
                WHEN NEW.message_type = 'admin_to_user' 
                THEN GREATEST(unread_count_for_user - 1, 0) 
                ELSE unread_count_for_user 
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.room_id;
    END IF;
END//
DELIMITER ;

-- ========================================
-- SAMPLE DATA FOR TESTING
-- ========================================

-- Insert sample admin user if not exists
INSERT IGNORE INTO users (
    id, username, email, password, role, provider, is_email_verified, created_at
) VALUES (
    'admin-001', 
    'admin', 
    'admin@travello.com', 
    '$2b$10$rQZ8kHKCYKjYHNqGYQkO.uYKhQr4wWvW5K.X.JmVqE.iO.5pKqZ9G', -- password: admin123
    'admin', 
    'manual', 
    TRUE, 
    NOW()
);

-- Insert sample regular user if not exists
INSERT IGNORE INTO users (
    id, username, email, password, role, provider, is_email_verified, created_at
) VALUES (
    'user-001', 
    'john_doe', 
    'john@example.com', 
    '$2b$10$rQZ8kHKCYKjYHNqGYQkO.uYKhQr4wWvW5K.X.JmVqE.iO.5pKqZ9G', -- password: user123
    'user', 
    'manual', 
    TRUE, 
    NOW()
);

-- ========================================
-- VIEWS FOR EASY DATA ACCESS
-- ========================================

-- View for chat conversations with latest message info
CREATE OR REPLACE VIEW chat_conversations AS
SELECT 
    cr.id as room_id,
    cr.user_id,
    cr.admin_id,
    u1.username as user_name,
    u1.email as user_email,
    COALESCE(u2.username, 'System') as admin_name,
    cr.last_message_at,
    cr.last_message_preview,
    cr.unread_count_for_admin,
    cr.unread_count_for_user,
    cr.is_active,
    cr.created_at,
    CASE 
        WHEN uos.is_online = TRUE THEN 'online'
        ELSE 'offline'
    END as user_status
FROM conversation_rooms cr
LEFT JOIN users u1 ON cr.user_id = u1.id
LEFT JOIN users u2 ON cr.admin_id = u2.id
LEFT JOIN user_online_status uos ON cr.user_id = uos.user_id
WHERE cr.is_active = TRUE
ORDER BY cr.last_message_at DESC;

-- View for unread messages count per admin
CREATE OR REPLACE VIEW admin_unread_summary AS
SELECT 
    COUNT(*) as total_unread_messages,
    COUNT(DISTINCT room_id) as conversations_with_unread,
    MIN(created_at) as oldest_unread_time
FROM user_admin_chat_messages 
WHERE message_type = 'user_to_admin' 
  AND is_read = FALSE;

-- ========================================
-- INDEX OPTIMIZATION
-- ========================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_chat_room_unread ON user_admin_chat_messages(room_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sender_type ON user_admin_chat_messages(sender_id, message_type, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_receiver_unread ON user_admin_chat_messages(receiver_id, is_read, message_type);

-- ========================================
-- CLEANUP PROCEDURES
-- ========================================

-- Procedure to clean old typing indicators (older than 5 minutes)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS CleanupOldTypingIndicators()
BEGIN
    DELETE FROM typing_indicators 
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL 5 MINUTE);
END//
DELIMITER ;

-- Procedure to mark inactive users as offline (older than 30 minutes)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS CleanupInactiveUsers()
BEGIN
    UPDATE user_online_status 
    SET is_online = FALSE, 
        status = 'offline', 
        last_seen = DATE_SUB(NOW(), INTERVAL 30 MINUTE)
    WHERE is_online = TRUE 
      AND last_seen < DATE_SUB(NOW(), INTERVAL 30 MINUTE);
END//
DELIMITER ;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================
SELECT 'User-Admin Chat Database Schema created successfully!' as status;
