-- TRAVELLO Database Setup Script
-- This script creates the database structure for TRAVELLO application
-- Compatible with MySQL/MariaDB

-- Create database
CREATE DATABASE IF NOT EXISTS travello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travello_db;

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    googleId VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    displayName VARCHAR(255),
    password VARCHAR(255),
    profilePicture TEXT,
    avatar TEXT,
    provider ENUM('local', 'google', 'facebook') DEFAULT 'local',
    loginPage VARCHAR(50) DEFAULT 'default',
    phone VARCHAR(20),
    dateOfBirth DATE,
    gender ENUM('male', 'female', 'other') DEFAULT 'other',
    
    -- Address fields
    address_street TEXT,
    address_city VARCHAR(100),
    address_province VARCHAR(100),
    address_postalCode VARCHAR(10),
    address_country VARCHAR(100) DEFAULT 'Indonesia',
    
    -- Travel preferences
    travelPreferences_favoriteDestinations JSON,
    travelPreferences_travelStyle VARCHAR(50) DEFAULT 'budget',
    travelPreferences_interests JSON,
    
    -- Account status
    isVerified BOOLEAN DEFAULT false,
    isActive BOOLEAN DEFAULT true,
    lastLogin TIMESTAMP NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    
    -- Statistics
    totalTransactions INT DEFAULT 0,
    totalSpent DECIMAL(12,2) DEFAULT 0.00,
    
    -- Timestamps
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_googleId (googleId),
    INDEX idx_username (username),
    INDEX idx_active_verified (isActive, isVerified),
    INDEX idx_createdAt (createdAt),
    INDEX idx_role (role)
);

CREATE TABLE IF NOT EXISTS media (
    id VARCHAR(64) PRIMARY KEY,
    fileName VARCHAR(255),
    mimeType VARCHAR(100) NOT NULL,
    sizeBytes INT NOT NULL,
    data LONGBLOB NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_createdAt (createdAt),
    INDEX idx_mimeType (mimeType)
);

CREATE TABLE IF NOT EXISTS landing_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    content TEXT,
    imageUrl TEXT,
    buttonText VARCHAR(100),
    buttonLink TEXT,
    orderIndex INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdBy VARCHAR(255) DEFAULT 'admin',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_section (section),
    INDEX idx_isActive (isActive),
    INDEX idx_orderIndex (orderIndex)
);

CREATE TABLE IF NOT EXISTS home_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    heroBadge VARCHAR(255),
    heroDescription TEXT,
    heroBrands JSON,
    storiesDescription TEXT,
    aboutDescription TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_isActive (isActive),
    INDEX idx_createdAt (createdAt)
);

CREATE TABLE IF NOT EXISTS hero_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imageUrl TEXT NOT NULL,
    orderIndex INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orderIndex (orderIndex),
    INDEX idx_isActive (isActive)
);

CREATE TABLE IF NOT EXISTS landing_about (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imageUrl TEXT,
    description TEXT,
    experience JSON,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    orderIndex INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_isActive (isActive),
    INDEX idx_orderIndex (orderIndex)
);

CREATE TABLE IF NOT EXISTS certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    logoUrl TEXT,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    organization VARCHAR(255) NOT NULL,
    orderIndex INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    orderIndex INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cert_services (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    imageUrl TEXT,
    category VARCHAR(60) NOT NULL,
    provider VARCHAR(255),
    duration VARCHAR(100),
    price INT,
    currency VARCHAR(10) DEFAULT 'IDR',
    level VARCHAR(50) DEFAULT 'all',
    certificateProvided BOOLEAN DEFAULT TRUE,
    onlineAvailable BOOLEAN DEFAULT TRUE,
    location VARCHAR(255),
    schedule VARCHAR(255),
    requirements JSON,
    outcomes JSON,
    featured BOOLEAN DEFAULT FALSE,
    isActive BOOLEAN DEFAULT TRUE,
    views INT DEFAULT 0,
    enrollments INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    tags JSON,
    instructor VARCHAR(255) DEFAULT 'TRAVELLO Team',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_level (level),
    INDEX idx_isActive (isActive),
    INDEX idx_featured (featured)
);

CREATE TABLE IF NOT EXISTS portfolio_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    images JSON,
    tags JSON,
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    imageUrl TEXT,
    projectUrl TEXT,
    technologies JSON,
    tags JSON,
    featured BOOLEAN DEFAULT FALSE,
    isActive BOOLEAN DEFAULT TRUE,
    client VARCHAR(255),
    projectDate DATE,
    author VARCHAR(255) DEFAULT 'TRAVELLO Team',
    views INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_featured (featured),
    INDEX idx_isActive (isActive)
);

CREATE TABLE IF NOT EXISTS travel_journals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coverUrl TEXT,
    travelImageUrl TEXT,
    description TEXT,
    location VARCHAR(255),
    date VARCHAR(50),
    category VARCHAR(100),
    tags JSON,
    isActive BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    author VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_isActive (isActive),
    INDEX idx_featured (featured)
);

CREATE TABLE IF NOT EXISTS experiences (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    description TEXT,
    imageUrl TEXT,
    startDate VARCHAR(50),
    endDate VARCHAR(50),
    currentJob BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    type VARCHAR(100),
    department VARCHAR(255),
    achievements JSON,
    technologies JSON,
    responsibilities JSON,
    skills JSON,
    featured BOOLEAN DEFAULT FALSE,
    isActive BOOLEAN DEFAULT TRUE,
    `order` INT DEFAULT 0,
    tags JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_isActive (isActive),
    INDEX idx_featured (featured),
    INDEX idx_order (`order`)
);

CREATE TABLE IF NOT EXISTS blog_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coverUrl TEXT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    status ENUM('publish', 'draft') DEFAULT 'draft',
    content LONGTEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- =============================================
-- 2. TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transactionId VARCHAR(50) NOT NULL UNIQUE,
    userId VARCHAR(255),
    type ENUM('copywriter_service', 'travel_package', 'consultation', 'other', 'shop_item') NOT NULL,
    serviceName VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Financial information
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    discount DECIMAL(12,2) DEFAULT 0.00,
    tax DECIMAL(12,2) DEFAULT 0.00,
    finalAmount DECIMAL(12,2) NOT NULL,
    
    -- Payment information
    paymentMethod VARCHAR(50),
    paymentStatus ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    paymentDate DATETIME,
    paymentProof VARCHAR(500),
    
    -- Status tracking
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded', 'inactive') DEFAULT 'pending',
    confirmedAt DATETIME,
    startedAt DATETIME,
    completedAt DATETIME,
    cancelledAt DATETIME,
    
    -- Notes
    notes TEXT,
    adminNotes TEXT,

    -- Flexible details for various service types
    serviceDetails JSON,
    
    -- Timestamps
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_transactionId (transactionId),
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    INDEX idx_paymentStatus (paymentStatus),
    INDEX idx_type (type),
    INDEX idx_createdAt (createdAt),
    INDEX idx_paymentDate (paymentDate)
);

-- =============================================
-- 3. ADMIN_CHAT TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS admin_chats (
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
    lastActivityAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sessionId (sessionId),
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    INDEX idx_assignedAdmin (assignedAdmin),
    INDEX idx_userEmail (userEmail),
    INDEX idx_createdAt (createdAt),
    INDEX idx_lastActivityAt (lastActivityAt),
    INDEX idx_priority_status (priority, status)
);

-- =============================================
-- 4. CHAT_MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS admin_chat_messages (
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
    FOREIGN KEY (sessionId) REFERENCES admin_chats(sessionId) ON DELETE CASCADE,
    INDEX idx_sessionId (sessionId),
    INDEX idx_sender (sender),
    INDEX idx_timestamp (timestamp),
    INDEX idx_isRead (isRead)
);

CREATE TABLE IF NOT EXISTS shop_items (
    _id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    imageSrc TEXT DEFAULT '/placeholder-image.png',
    price VARCHAR(255) NOT NULL,
    deliveryTime TEXT,
    serviceCategory VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    details JSON,
    advantages JSON,
    packages JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 5. SAMPLE DATA
-- =============================================

-- Insert admin user
INSERT INTO users (id, email, username, displayName, role, isVerified, isActive, provider) VALUES 
('admin_1', 'admin@travello.com', 'admin', 'TRAVELLO Admin', 'admin', TRUE, TRUE, 'local');

-- Insert sample user
INSERT INTO users (id, email, username, displayName, phone, role, isVerified, isActive, provider) VALUES 
('user_1', 'john@example.com', 'john', 'John Doe', '+628123456789', 'user', TRUE, TRUE, 'local');

-- Insert sample transaction
INSERT INTO transactions (transactionId, userId, type, serviceName, description, amount, finalAmount, paymentMethod, paymentStatus, status, serviceDetails) VALUES 
('TXN1698765432001ABC', 'user_1', 'copywriter_service', 'Basic Copywriter Package', 'Website content writing service', 1500000.00, 1500000.00, 'transfer', 'paid', 'completed',
 JSON_OBJECT('customFields', JSON_OBJECT('customerName', 'John Doe', 'customerEmail', 'john@example.com')));

-- Insert sample chat session
INSERT INTO admin_chats (sessionId, userId, userName, userEmail, isGuest, status, priority, category) VALUES 
('CHAT1698765432001DEF', 'user_1', 'John Doe', 'john@example.com', FALSE, 'active', 'medium', 'general');

-- Insert sample chat messages
INSERT INTO admin_chat_messages (sessionId, sender, senderName, message, timestamp) VALUES 
('CHAT1698765432001DEF', 'user', 'John Doe', 'Halo, saya tertarik dengan layanan copywriter', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('CHAT1698765432001DEF', 'admin', 'TRAVELLO Admin', 'Halo! Terima kasih telah menghubungi kami. Ada yang bisa kami bantu?', DATE_SUB(NOW(), INTERVAL 55 MINUTE));

-- Update last message in chat
UPDATE admin_chats 
SET lastMessage = 'Halo! Terima kasih telah menghubungi kami. Ada yang bisa kami bantu?',
    lastMessageSender = 'admin',
    lastActivityAt = DATE_SUB(NOW(), INTERVAL 55 MINUTE),
    unreadCount_user = 1
WHERE sessionId = 'CHAT1698765432001DEF';

-- =============================================
-- 6. VIEWS FOR REPORTING
-- =============================================

-- User statistics view
CREATE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN isVerified = TRUE THEN 1 END) as verified_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    SUM(totalSpent) as total_revenue,
    AVG(totalSpent) as avg_spent_per_user
FROM users
WHERE isActive = TRUE;

-- Transaction statistics view
CREATE VIEW transaction_stats AS
SELECT 
    COUNT(*) as total_transactions,
    SUM(finalAmount) as total_revenue,
    COUNT(CASE WHEN paymentStatus = 'paid' THEN 1 END) as paid_transactions,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
    AVG(finalAmount) as avg_transaction_value
FROM transactions;

-- Chat statistics view
CREATE VIEW chat_stats AS
SELECT 
    COUNT(*) as total_chats,
    COUNT(CASE WHEN status IN ('active', 'waiting') THEN 1 END) as active_chats,
    COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_chats,
    AVG(satisfactionRating) as avg_satisfaction,
    COUNT(CASE WHEN isGuest = FALSE THEN 1 END) as registered_user_chats
FROM admin_chats;

-- =============================================
-- 7. STORED PROCEDURES
-- =============================================

DELIMITER //

-- Procedure to get user transaction history
CREATE PROCEDURE GetUserTransactionHistory(IN user_id_param VARCHAR(255), IN limit_param INT)
BEGIN
    SELECT 
        t.transactionId,
        t.type,
        t.serviceName,
        t.finalAmount,
        t.paymentStatus,
        t.status,
        t.createdAt
    FROM transactions t
    WHERE t.userId = user_id_param
    ORDER BY t.createdAt DESC
    LIMIT limit_param;
END //

-- Procedure to get monthly revenue
CREATE PROCEDURE GetMonthlyRevenue(IN year_param INT)
BEGIN
    SELECT 
        MONTH(createdAt) as month,
        COUNT(*) as transactions,
        SUM(finalAmount) as revenue
    FROM transactions
    WHERE YEAR(createdAt) = year_param
        AND paymentStatus = 'paid'
    GROUP BY MONTH(createdAt)
    ORDER BY month;
END //

-- Procedure to update user statistics
CREATE PROCEDURE UpdateUserStats(IN user_id_param VARCHAR(255))
BEGIN
    UPDATE users 
    SET 
        totalTransactions = (
            SELECT COUNT(*) 
            FROM transactions 
            WHERE userId = user_id_param
        ),
        totalSpent = (
            SELECT COALESCE(SUM(finalAmount), 0) 
            FROM transactions 
            WHERE userId = user_id_param 
                AND paymentStatus = 'paid'
        )
    WHERE id = user_id_param;
END //

DELIMITER ;

-- =============================================
-- 8. TRIGGERS
-- =============================================

-- Trigger to update user stats after transaction
DELIMITER //
CREATE TRIGGER after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.userId IS NOT NULL THEN
        CALL UpdateUserStats(NEW.userId);
    END IF;
END //
DELIMITER ;

-- Trigger to update last activity in chat
DELIMITER //
CREATE TRIGGER after_message_insert
AFTER INSERT ON admin_chat_messages
FOR EACH ROW
BEGIN
    UPDATE admin_chats 
    SET 
        lastMessage = NEW.message,
        lastMessageSender = NEW.sender,
        lastActivityAt = NEW.timestamp,
        unreadCount_admin = CASE WHEN NEW.sender = 'user' THEN unreadCount_admin + 1 ELSE unreadCount_admin END,
        unreadCount_user = CASE WHEN NEW.sender = 'admin' THEN unreadCount_user + 1 ELSE unreadCount_user END
    WHERE sessionId = NEW.sessionId;
END //
DELIMITER ;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

SELECT 'Database setup completed successfully!' as message,
       (SELECT COUNT(*) FROM users) as users_count,
       (SELECT COUNT(*) FROM transactions) as transactions_count,
       (SELECT COUNT(*) FROM admin_chats) as chats_count,
       (SELECT COUNT(*) FROM admin_chat_messages) as messages_count;
