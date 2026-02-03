-- ========================================
-- TRAVELLO USER DATABASE SETUP
-- For phpMyAdmin / MySQL Integration
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
-- PAYMENTS TABLE - Payment transaction records
-- ========================================
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('credit_card', 'bank_transfer', 'ewallet', 'virtual_account')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'IDR',
    description TEXT NOT NULL,
    booking_id TEXT,
    customer_info TEXT, -- JSON string
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled', 'expired')),
    payment_gateway_response TEXT, -- JSON string
    refund_reason TEXT,
    refund_processed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payments_user_id (user_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_method (method),
    INDEX idx_payments_booking_id (booking_id),
    INDEX idx_payments_created_at (created_at),
    INDEX idx_payments_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- PAYMENT TRANSACTIONS TABLE - Detailed transaction logs
-- ========================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'fee', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'IDR',
    description TEXT,
    gateway_transaction_id TEXT,
    gateway_response TEXT, -- JSON string
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_payment_transactions_payment_id (payment_id),
    INDEX idx_payment_transactions_type (type),
    INDEX idx_payment_transactions_status (status),
    INDEX idx_payment_transactions_gateway_id (gateway_transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- PAYMENT METHODS TABLE - Payment method configuration
-- ========================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    fees DECIMAL(5,2) DEFAULT 0, -- percentage fee
    fixed_fee DECIMAL(10,2) DEFAULT 0, -- fixed fee amount
    min_amount DECIMAL(10,2),
    max_amount DECIMAL(10,2),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    config TEXT, -- JSON string for method-specific config
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_payment_methods_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SAMPLE DATA FOR PAYMENTS
-- ========================================

-- Insert default payment methods
INSERT IGNORE INTO payment_methods (id, name, display_name, description, icon, fees, fixed_fee, min_amount, max_amount, is_active) VALUES
('credit_card', 'credit_card', 'Credit Card', 'Visa, Mastercard, JCB', '💳', 2.9, 0, 10000, 50000000, 1),
('bank_transfer', 'bank_transfer', 'Bank Transfer', 'Transfer to virtual account', '🏦', 0, 0, 10000, 100000000, 1),
('ewallet', 'ewallet', 'E-Wallet', 'GoPay, OVO, Dana, ShopeePay', '📱', 1.5, 0, 1000, 20000000, 1),
('virtual_account', 'virtual_account', 'Virtual Account', 'BCA, BNI, BRI, Mandiri VA', '🔢', 0, 0, 10000, 50000000, 1);

-- Sample payment data for testing
INSERT IGNORE INTO payments (
    id, user_id, method, amount, currency, description, status, payment_gateway_response, created_at, updated_at
) VALUES
('pay_001', 'admin-001', 'credit_card', 150000.00, 'IDR', 'Hotel booking - Bali Resort', 'completed', '{"transactionId": "CC_1643284567890", "approvalCode": "APPROV_XYZ123", "maskedCard": "****-****-****-1234"}', NOW(), NOW()),
('pay_002', 'user-001', 'ewallet', 75000.00, 'IDR', 'Transport booking - GoCar', 'completed', '{"transactionId": "EW_1643284567891", "referenceId": "REF_ABC123", "phoneNumber": "****-****-5678"}', NOW(), NOW()),
('pay_003', 'admin-001', 'bank_transfer', 250000.00, 'IDR', 'Tour package - Yogyakarta', 'pending', '{"virtualAccount": "BCA1234567890", "bankName": "BCA Virtual Account"}', NOW(), NOW());

-- Sample transaction data
INSERT IGNORE INTO payment_transactions (
    id, payment_id, type, amount, currency, description, gateway_transaction_id, status, created_at, updated_at
) VALUES
('txn_001', 'pay_001', 'payment', 150000.00, 'IDR', 'Credit card payment processing', 'CC_1643284567890', 'completed', NOW(), NOW()),
('txn_002', 'pay_001', 'fee', 4350.00, 'IDR', 'Credit card processing fee (2.9%)', 'FEE_CC_1643284567890', 'completed', NOW(), NOW()),
('txn_003', 'pay_002', 'payment', 75000.00, 'IDR', 'E-wallet payment processing', 'EW_1643284567891', 'completed', NOW(), NOW()),
('txn_004', 'pay_002', 'fee', 1125.00, 'IDR', 'E-wallet processing fee (1.5%)', 'FEE_EW_1643284567891', 'completed', NOW(), NOW());

-- ========================================
-- LOGIN HISTORY TABLE - Track all authentication attempts
-- ========================================
CREATE TABLE IF NOT EXISTS login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_method ENUM('manual', 'google', 'github') NOT NULL DEFAULT 'manual',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_login_history_user_id (user_id),
    INDEX idx_login_history_login_time (login_time),
    INDEX idx_login_history_method (login_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SAMPLE DATA FOR TESTING (Optional)
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

-- ========================================
-- VIEWS FOR ADMIN PANEL
-- ========================================

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.provider,
    u.created_at,
    u.last_login,
    COUNT(DISTINCT lh.id) as total_logins,
    MAX(lh.login_time) as last_activity
FROM users u
LEFT JOIN login_history lh ON u.id = lh.user_id
GROUP BY u.id, u.username, u.email, u.role, u.provider, u.created_at, u.last_login;

-- Payment statistics view
CREATE OR REPLACE VIEW payment_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(p.id) as total_payments,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_payments,
    COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_payments,
    COUNT(CASE WHEN p.status = 'failed' THEN 1 END) as failed_payments,
    COUNT(CASE WHEN p.status = 'refunded' THEN 1 END) as refunded_payments,
    SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_amount,
    AVG(CASE WHEN p.status = 'completed' THEN p.amount ELSE NULL END) as average_amount,
    MAX(p.created_at) as last_payment_date
FROM users u
LEFT JOIN payments p ON u.id = p.user_id
GROUP BY u.id, u.username;

-- Payment method performance view
CREATE OR REPLACE VIEW payment_method_performance AS
SELECT 
    pm.name,
    pm.display_name,
    COUNT(p.id) as usage_count,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as successful_count,
    COUNT(CASE WHEN p.status = 'failed' THEN 1 END) as failed_count,
    SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_volume,
    AVG(CASE WHEN p.status = 'completed' THEN p.amount ELSE NULL END) as average_amount,
    ROUND(COUNT(CASE WHEN p.status = 'completed' THEN 1 END) * 100.0 / COUNT(p.id), 2) as success_rate
FROM payment_methods pm
LEFT JOIN payments p ON pm.name = p.method
WHERE pm.is_active = 1
GROUP BY pm.name, pm.display_name
ORDER BY total_volume DESC;

-- Transactions view for admin panel
CREATE OR REPLACE VIEW admin_transactions AS
SELECT 
    p.id,
    p.id as trxCode,
    CONCAT('ORD-', DATE_FORMAT(p.created_at, '%Y%m%d'), '-', LPAD(SUBSTRING(p.id, -4), 4, '0')) as orderCode,
    u.username as buyerName,
    u.email as buyerEmail,
    CASE 
        WHEN p.description LIKE '%SEO%' THEN 'SEO Specialist'
        WHEN p.description LIKE '%desain%' OR p.description LIKE '%logo%' THEN 'Design Studio'
        WHEN p.description LIKE '%website%' OR p.description LIKE '%web%' THEN 'WebDev Pro'
        WHEN p.description LIKE '%video%' THEN 'Video Pro Studio'
        WHEN p.description LIKE '%media sosial%' OR p.description LIKE '%social%' THEN 'Social Media Expert'
        ELSE 'Service Provider'
    END as sellerName,
    p.description as sellerService,
    p.amount as grossAmount,
    ROUND(p.amount * (SELECT fees FROM payment_methods WHERE name = p.method LIMIT 1) / 100, 2) as adminFee,
    p.amount - ROUND(p.amount * (SELECT fees FROM payment_methods WHERE name = p.method LIMIT 1) / 100, 2) as netAmount,
    p.status,
    p.method as paymentMethod,
    CASE WHEN p.status = 'completed' THEN 'paid' ELSE 'unpaid' END as paidStatus,
    DATE_FORMAT(p.created_at, '%d %b %Y') as date,
    p.created_at,
    p.updated_at
FROM payments p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;

-- ========================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ========================================

-- Procedure to get user login history
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetUserLoginHistory(
    IN user_id_param VARCHAR(255),
    IN limit_param INT
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

-- Procedure to get all transactions for admin
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetAllTransactions(
    IN page_param INT,
    IN limit_param INT,
    IN status_filter VARCHAR(50),
    IN search_term VARCHAR(255)
)
BEGIN
    DECLARE offset_param INT;
    SET offset_param = (page_param - 1) * limit_param;
    
    SELECT 
        *,
        (SELECT COUNT(*) FROM admin_transactions 
         WHERE (status_filter IS NULL OR status = status_filter)
         AND (search_term IS NULL OR 
              trxCode LIKE CONCAT('%', search_term, '%') OR
              orderCode LIKE CONCAT('%', search_term, '%') OR
              buyerName LIKE CONCAT('%', search_term, '%') OR
              buyerEmail LIKE CONCAT('%', search_term, '%') OR
              sellerName LIKE CONCAT('%', search_term, '%') OR
              sellerService LIKE CONCAT('%', search_term, '%')
         )) as total_count
    FROM admin_transactions
    WHERE (status_filter IS NULL OR status = status_filter)
    AND (search_term IS NULL OR 
         trxCode LIKE CONCAT('%', search_term, '%') OR
         orderCode LIKE CONCAT('%', search_term, '%') OR
         buyerName LIKE CONCAT('%', search_term, '%') OR
         buyerEmail LIKE CONCAT('%', search_term, '%') OR
         sellerName LIKE CONCAT('%', search_term, '%') OR
         sellerService LIKE CONCAT('%', search_term, '%')
    )
    ORDER BY created_at DESC
    LIMIT limit_param OFFSET offset_param;
END//
DELIMITER ;

-- Procedure to update transaction status
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS UpdateTransactionStatus(
    IN transaction_id VARCHAR(255),
    IN new_status VARCHAR(50),
    IN admin_user_id VARCHAR(255)
)
BEGIN
    DECLARE current_status VARCHAR(50);
    
    -- Get current status
    SELECT status INTO current_status FROM payments WHERE id = transaction_id;
    
    -- Update payment status
    UPDATE payments 
    SET status = new_status, updated_at = NOW()
    WHERE id = transaction_id;
    
    -- Log the status change in transactions table
    INSERT INTO payment_transactions (
        id, payment_id, type, amount, currency, description, status, created_at, updated_at
    ) VALUES (
        CONCAT('txn_', UUID()),
        transaction_id,
        'adjustment',
        0,
        'IDR',
        CONCAT('Status changed from ', current_status, ' to ', new_status, ' by admin ', admin_user_id),
        'completed',
        NOW(),
        NOW()
    );
    
    SELECT * FROM payments WHERE id = transaction_id;
END//
DELIMITER ;

-- Procedure to get payment statistics
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetPaymentStats(
    IN date_range VARCHAR(20)
)
BEGIN
    DECLARE start_date DATE;
    DECLARE end_date DATE;
    
    -- Set date range
    IF date_range = '7d' THEN
        SET start_date = DATE_SUB(NOW(), INTERVAL 7 DAY);
        SET end_date = NOW();
    ELSEIF date_range = '30d' THEN
        SET start_date = DATE_SUB(NOW(), INTERVAL 30 DAY);
        SET end_date = NOW();
    ELSEIF date_range = 'this_month' THEN
        SET start_date = DATE_FORMAT(NOW(), '%Y-%m-01');
        SET end_date = LAST_DAY(NOW());
    ELSE
        SET start_date = '2000-01-01';
        SET end_date = NOW();
    END IF;
    
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
    WHERE created_at BETWEEN start_date AND end_date;
END//
DELIMITER ;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

SELECT 'TRAVELLO DATABASE SETUP COMPLETED' as status,
       'Database and tables created for user authentication' as description,
       'Ready for phpMyAdmin integration' as next_step,
       NOW() as completion_time;
