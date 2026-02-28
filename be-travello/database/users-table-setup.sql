-- ========================================
-- USERS TABLE SETUP for travello_db
-- Fix user login data issue
-- ========================================

-- Use travello_db database
USE travello_db;

-- ========================================
-- USERS TABLE - Main user accounts
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    profile_picture TEXT,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_email_verified BOOLEAN DEFAULT FALSE,
    last_login DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_google_id (google_id),
    INDEX idx_users_role (role),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- LOGIN HISTORY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    failure_reason VARCHAR(255),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_login_history_user_id (user_id),
    INDEX idx_login_history_login_time (login_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SAMPLE USERS DATA
-- ========================================

-- Insert sample users
INSERT IGNORE INTO users (id, username, email, password, display_name, role, is_email_verified, created_at) VALUES
('user_demo001', 'demo', 'demo@travello.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'Demo User', 'user', TRUE, NOW()),
('user_admin001', 'admin', 'admin@travello.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'Admin User', 'admin', TRUE, NOW()),
('user_test001', 'testuser', 'test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'Test User', 'user', TRUE, NOW());

-- Insert login history
INSERT IGNORE INTO login_history (user_id, login_time, ip_address, success) VALUES
('user_demo001', NOW(), '127.0.0.1', TRUE),
('user_admin001', NOW(), '127.0.0.1', TRUE);

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

SELECT 'USERS TABLE SETUP COMPLETED' as status,
       'users and login_history tables created' as description,
       'Ready for user authentication and admin panel' as next_step,
       NOW() as completion_time;
