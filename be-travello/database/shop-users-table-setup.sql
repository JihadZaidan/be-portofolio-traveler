-- ========================================
-- SHOP USERS TABLE SETUP
-- Add shop_users table to travello_db
-- ========================================

-- Use travello_db database
USE travello_db;

-- ========================================
-- SHOP USERS TABLE - Shop user accounts
-- ========================================
CREATE TABLE IF NOT EXISTS shop_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255),
    display_name VARCHAR(255),
    avatar VARCHAR(500),
    provider ENUM('local', 'google') DEFAULT 'local',
    is_email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(50),
    address TEXT,
    company VARCHAR(255),
    bio TEXT,
    website VARCHAR(500),
    social_links JSON,
    preferences JSON,
    last_login DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_shop_users_email (email),
    INDEX idx_shop_users_google_id (google_id),
    INDEX idx_shop_users_provider (provider),
    INDEX idx_shop_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SHOP USER LOGIN HISTORY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS shop_user_login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    failure_reason VARCHAR(255),
    
    FOREIGN KEY (user_id) REFERENCES shop_users(id) ON DELETE CASCADE,
    INDEX idx_shop_login_history_user_id (user_id),
    INDEX idx_shop_login_history_login_time (login_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SAMPLE SHOP USERS DATA
-- ========================================

-- Insert sample shop users
INSERT IGNORE INTO shop_users (id, email, username, display_name, provider, is_email_verified, created_at) VALUES
(1, 'shopuser1@example.com', 'shopuser1', 'Shop User One', 'local', TRUE, NOW()),
(2, 'shopuser2@example.com', 'shopuser2', 'Shop User Two', 'google', TRUE, NOW()),
(3, 'vendor1@example.com', 'vendor1', 'Vendor Account', 'local', TRUE, NOW());

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

SELECT 'SHOP USERS TABLE SETUP COMPLETED' as status,
       'shop_users and shop_user_login_history tables created' as description,
       'Ready for admin user management' as next_step,
       NOW() as completion_time;
