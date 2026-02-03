-- ========================================
-- AUTH FORMS INTEGRATION SQL
-- For AI Chatbot and Shop Authentication
-- Compatible with MySQL Database
-- ========================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS travello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE travello_db;

-- ========================================
-- USERS TABLE - Core authentication data
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    profile_picture TEXT,
    provider ENUM('manual', 'google', 'github') NOT NULL DEFAULT 'manual',
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_users_email (email),
    INDEX idx_users_google_id (google_id),
    INDEX idx_users_provider (provider),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- LOGIN HISTORY TABLE - Track all authentication attempts
-- ========================================
CREATE TABLE IF NOT EXISTS login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_method ENUM('local', 'google', 'github') NOT NULL DEFAULT 'local',
    login_page ENUM('aichatbot', 'shop', 'admin', 'default') NOT NULL DEFAULT 'default',
    action ENUM('login', 'signup') NOT NULL DEFAULT 'login',
    success BOOLEAN NOT NULL DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_login_history_user_id (user_id),
    INDEX idx_login_history_login_time (login_time),
    INDEX idx_login_history_method (login_method),
    INDEX idx_login_history_page (login_page)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- USER SESSIONS TABLE - Active session management
-- ========================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    page_context ENUM('aichatbot', 'shop', 'admin', 'default') NOT NULL DEFAULT 'default',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sessions_user_id (user_id),
    INDEX idx_user_sessions_token (token(255)),
    INDEX idx_user_sessions_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- AI CHATBOT SPECIFIC TABLES
-- ========================================

-- Chat messages table for AI Chatbot
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    message TEXT,
    response TEXT,
    role ENUM('user', 'ai') NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    page_context ENUM('aichatbot', 'shop', 'admin') NOT NULL DEFAULT 'aichatbot',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_chat_messages_session_id (session_id),
    INDEX idx_chat_messages_user_id (user_id),
    INDEX idx_chat_messages_timestamp (timestamp),
    INDEX idx_chat_messages_page_context (page_context)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Chatbot sessions
CREATE TABLE IF NOT EXISTS ai_chatbot_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_name VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ai_sessions_user_id (user_id),
    INDEX idx_ai_sessions_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SHOP SPECIFIC TABLES
-- ========================================

-- Shops table for shop management
CREATE TABLE IF NOT EXISTS shops (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2),
    image_url TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    location VARCHAR(255),
    contact VARCHAR(255),
    website VARCHAR(255),
    status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active',
    created_by VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_shops_category (category),
    INDEX idx_shops_status (status),
    INDEX idx_shops_created_by (created_by),
    INDEX idx_shops_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shop user interactions
CREATE TABLE IF NOT EXISTS shop_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    shop_id VARCHAR(255) NOT NULL,
    interaction_type ENUM('view', 'contact', 'bookmark', 'purchase') NOT NULL DEFAULT 'view',
    interaction_data TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_shop_interactions_user_id (user_id),
    INDEX idx_shop_interactions_shop_id (shop_id),
    INDEX idx_shop_interactions_type (interaction_type),
    INDEX idx_shop_interactions_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- USER PREFERENCES AND SETTINGS
-- ========================================

-- User preferences for different pages
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    page_context ENUM('aichatbot', 'shop', 'admin', 'global') NOT NULL,
    preference_key VARCHAR(255) NOT NULL,
    preference_value TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_page_preference (user_id, page_context, preference_key),
    INDEX idx_user_preferences_user_id (user_id),
    INDEX idx_user_preferences_page_context (page_context)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- VIEWS FOR ANALYTICS AND REPORTING
-- ========================================

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.created_at,
    u.last_login,
    COUNT(DISTINCT cm.id) as total_chat_messages,
    COUNT(DISTINCT cm.session_id) as total_chat_sessions,
    COUNT(DISTINCT si.id) as total_shop_interactions,
    MAX(cm.timestamp) as last_chat_activity,
    MAX(si.created_at) as last_shop_activity,
    COUNT(DISTINCT lh.id) as total_logins
FROM users u
LEFT JOIN chat_messages cm ON u.id = cm.user_id
LEFT JOIN shop_interactions si ON u.id = si.user_id
LEFT JOIN login_history lh ON u.id = lh.user_id
GROUP BY u.id, u.username, u.email, u.role, u.created_at, u.last_login;

-- Login analytics view
CREATE OR REPLACE VIEW login_analytics AS
SELECT 
    DATE(lh.login_time) as login_date,
    lh.login_method,
    COUNT(*) as login_count,
    COUNT(DISTINCT lh.user_id) as unique_users
FROM login_history lh
GROUP BY DATE(lh.login_time), lh.login_method
ORDER BY login_date DESC;

-- ========================================
-- SAMPLE DATA FOR TESTING
-- ========================================

-- Sample admin user (password: admin123)
INSERT IGNORE INTO users (
    id, 
    username, 
    email, 
    password, 
    role, 
    is_email_verified, 
    created_at, 
    updated_at
) VALUES (
    'admin-001',
    'admin',
    'admin@travello.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LfC', -- admin123
    'admin',
    TRUE,
    NOW(),
    NOW()
);

-- Sample AI Chatbot user (password: chatbot123)
INSERT IGNORE INTO users (
    id, 
    username, 
    email, 
    password, 
    display_name,
    role, 
    is_email_verified, 
    created_at, 
    updated_at
) VALUES (
    'chatbot-user-001',
    'chatbot_user',
    'chatbot@travello.com',
    '$2a$12$9XqYcWQnWqKqBqBqBqBqOYz6TtxMQJqhN8/LewdBPj6ukx.LfC', -- chatbot123
    'AI Chatbot User',
    'user',
    TRUE,
    NOW(),
    NOW()
);

-- Sample Shop user (password: shop123)
INSERT IGNORE INTO users (
    id, 
    username, 
    email, 
    password, 
    display_name,
    role, 
    is_email_verified, 
    created_at, 
    updated_at
) VALUES (
    'shop-user-001',
    'shop_user',
    'shop@travello.com',
    '$2a$12$9XqYcWQnWqKqBqBqBqBqOYz6TtxMQJqhN8/LewdBPj6ukx.LfC', -- shop123
    'Shop User',
    'user',
    TRUE,
    NOW(),
    NOW()
);

-- Sample Google OAuth user
INSERT IGNORE INTO users (
    id,
    username,
    email,
    google_id,
    display_name,
    profile_picture,
    role,
    is_email_verified,
    created_at,
    updated_at
) VALUES (
    'google-user-001',
    'google_user_12345',
    'user@gmail.com',
    '123456789012345678901',
    'Google User',
    'https://lh3.googleusercontent.com/photo.jpg',
    'user',
    TRUE,
    NOW(),
    NOW()
);

-- Sample login history entries
INSERT IGNORE INTO login_history (user_id, login_method, ip_address, user_agent) VALUES
('admin-001', 'local', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('chatbot-user-001', 'local', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('shop-user-001', 'local', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('google-user-001', 'google', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- Sample AI Chatbot session
INSERT IGNORE INTO ai_chatbot_sessions (id, user_id, session_name, message_count) VALUES
('session-001', 'chatbot-user-001', 'Travel Planning Session', 5),
('session-002', 'google-user-001', 'Hotel Recommendations', 3);

-- Sample chat messages
INSERT IGNORE INTO chat_messages (id, session_id, user_id, message, response, role) VALUES
('msg-001', 'session-001', 'chatbot-user-001', 'What are the best places to visit in Bali?', 'Bali offers amazing destinations like Kuta Beach, Ubud, Seminyak, and Nusa Dua. Each has unique attractions!', 'user'),
('msg-002', 'session-001', 'chatbot-user-001', 'What are the best places to visit in Bali?', 'Bali offers amazing destinations like Kuta Beach, Ubud, Seminyak, and Nusa Dua. Each has unique attractions!', 'ai');

-- Sample shops
INSERT IGNORE INTO shops (id, name, description, category, price, location, contact, created_by) VALUES
('shop-001', 'Bali Tour Guide Service', 'Professional tour guide services for Bali destinations with local expertise and cultural insights.', 'Tour Guide', '500000', 'Bali, Indonesia', '+62 812-3456-7890', 'shop-user-001'),
('shop-002', 'Travel Photography Package', 'Professional photography services for your travel moments in Indonesia.', 'Photography', '1500000', 'Jakarta, Indonesia', '+62 813-4567-8901', 'shop-user-001');

-- Sample user preferences
INSERT IGNORE INTO user_preferences (user_id, page_context, preference_key, preference_value) VALUES
('chatbot-user-001', 'aichatbot', 'theme', 'dark'),
('chatbot-user-001', 'aichatbot', 'language', 'en'),
('shop-user-001', 'shop', 'preferred_category', 'Tour Guide'),
('shop-user-001', 'global', 'notifications', 'enabled');

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Trigger to update last_login on successful login
DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_last_login_on_login
AFTER INSERT ON login_history
FOR EACH ROW
BEGIN
    UPDATE users 
    SET last_login = NEW.login_time 
    WHERE id = NEW.user_id;
END//
DELIMITER ;

-- Trigger to update message count in AI sessions
DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_ai_session_message_count
AFTER INSERT ON chat_messages
FOR EACH ROW
BEGIN
    UPDATE ai_chatbot_sessions 
    SET message_count = message_count + 1,
        last_activity = NEW.timestamp
    WHERE id = NEW.session_id;
END//
DELIMITER ;

-- ========================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ========================================

-- Procedure to get user login history
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetUserLoginHistory(
    IN user_id_param VARCHAR(255),
    IN limit_param INT DEFAULT 10
)
BEGIN
    SELECT 
        lh.*,
        u.username,
        u.email
    FROM login_history lh
    JOIN users u ON lh.user_id = u.id
    WHERE lh.user_id = user_id_param
    ORDER BY lh.login_time DESC
    LIMIT limit_param;
END//
DELIMITER ;

-- Procedure to get user statistics
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetUserStats(
    IN user_id_param VARCHAR(255)
)
BEGIN
    SELECT 
        u.*,
        COALESCE(chat_stats.message_count, 0) as total_messages,
        COALESCE(chat_stats.session_count, 0) as total_sessions,
        COALESCE(shop_stats.interaction_count, 0) as total_shop_interactions,
        COALESCE(login_stats.login_count, 0) as total_logins
    FROM users u
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as message_count,
            COUNT(DISTINCT session_id) as session_count
        FROM chat_messages 
        WHERE user_id = user_id_param
    ) chat_stats ON u.id = chat_stats.user_id
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as interaction_count
        FROM shop_interactions 
        WHERE user_id = user_id_param
    ) shop_stats ON u.id = shop_stats.user_id
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as login_count
        FROM login_history 
        WHERE user_id = user_id_param AND success = TRUE
    ) login_stats ON u.id = login_stats.user_id
    WHERE u.id = user_id_param;
END//
DELIMITER ;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

SELECT 'AUTH FORMS INTEGRATION SQL COMPLETED' as status,
       'Database schema created for AI Chatbot and Shop authentication' as description,
       NOW() as completion_time;
