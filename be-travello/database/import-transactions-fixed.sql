-- ========================================
-- RIWAYAT TRANSAKSI TRAVELLO - IMPORT SQL (FIXED VERSION)
-- Compatible dengan semua versi MySQL
-- ========================================

-- Step 1: Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS travello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 2: Gunakan database
USE travello_db;

-- Step 3: Buat tabel users (jika belum ada)
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
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_google_id (google_id),
    INDEX idx_users_provider (provider),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Buat tabel payments (tabel utama riwayat transaksi)
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('credit_card', 'bank_transfer', 'ewallet', 'virtual_account')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'IDR',
    description TEXT NOT NULL,
    booking_id TEXT,
    customer_info TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled', 'expired')),
    payment_gateway_response TEXT,
    refund_reason TEXT,
    refund_processed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payments_user_id (user_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_method (method),
    INDEX idx_payments_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Buat tabel payment_transactions (detail transaksi)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'fee', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'IDR',
    description TEXT,
    gateway_transaction_id TEXT,
    gateway_response TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_payment_transactions_payment_id (payment_id),
    INDEX idx_payment_transactions_type (type),
    INDEX idx_payment_transactions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 6: Buat tabel payment_methods (konfigurasi metode)
CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    fees DECIMAL(5,2) DEFAULT 0,
    fixed_fee DECIMAL(10,2) DEFAULT 0,
    min_amount DECIMAL(10,2),
    max_amount DECIMAL(10,2),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    config TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_payment_methods_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 7: Insert user admin (jika belum ada)
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
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LfC',
    'admin',
    TRUE,
    NOW(),
    NOW()
);

-- Step 8: Insert user sample (jika belum ada)
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
    'user-001',
    'john_doe',
    'john@example.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.Lf',
    'user',
    TRUE,
    NOW(),
    NOW()
);

-- Step 9: Insert payment methods (jika belum ada)
INSERT IGNORE INTO payment_methods (id, name, display_name, description, icon, fees, fixed_fee, min_amount, max_amount, is_active) VALUES
('credit_card', 'credit_card', 'Credit Card', 'Visa, Mastercard, JCB', '💳', 2.9, 0, 10000, 50000000, 1),
('bank_transfer', 'bank_transfer', 'Bank Transfer', 'Transfer to virtual account', '🏦', 0, 0, 10000, 100000000, 1),
('ewallet', 'ewallet', 'E-Wallet', 'GoPay, OVO, Dana, ShopeePay', '📱', 1.5, 0, 1000, 20000000, 1),
('virtual_account', 'virtual_account', 'Virtual Account', 'BCA, BNI, BRI, Mandiri VA', '🔢', 0, 0, 10000, 50000000, 1);

-- Step 10: Insert sample payment transactions (riwayat transaksi)
INSERT IGNORE INTO payments (
    id, user_id, method, amount, currency, description, status, payment_gateway_response, created_at, updated_at
) VALUES
('pay_001', 'admin-001', 'credit_card', 150000.00, 'IDR', 'Hotel booking - Bali Resort', 'completed', '{"transactionId": "CC_1643284567890", "approvalCode": "APPROV_XYZ123", "maskedCard": "****-****-****-1234"}', '2026-01-27 10:00:00', '2026-01-27 10:01:00'),

('pay_002', 'user-001', 'ewallet', 75000.00, 'IDR', 'Transport booking - GoCar', 'completed', '{"transactionId": "EW_1643284567891", "referenceId": "REF_ABC123", "phoneNumber": "****-****-5678"}', '2026-01-27 11:30:00', '2026-01-27 11:31:00'),

('pay_003', 'admin-001', 'bank_transfer', 250000.00, 'IDR', 'Tour package - Yogyakarta', 'pending', '{"virtualAccount": "BCA1234567890", "bankName": "BCA Virtual Account"}', '2026-01-27 14:15:00', '2026-01-27 14:15:00'),

('pay_004', 'user-001', 'credit_card', 843750.00, 'IDR', 'SEO content writer untuk penulisan artikel', 'completed', '{"transactionId": "CC_1643284567892", "approvalCode": "APPROV_ABC456", "maskedCard": "****-****-****-5678"}', '2026-01-28 09:15:00', '2026-01-28 09:16:00'),

('pay_005', 'admin-001', 'ewallet', 2250000.00, 'IDR', 'Desain logo profesional', 'completed', '{"transactionId": "EW_1643284567893", "referenceId": "REF_DEF789", "phoneNumber": "****-****-9012"}', '2026-01-28 13:45:00', '2026-01-28 13:46:00'),

('pay_006', 'user-001', 'bank_transfer', 7500000.00, 'IDR', 'Pengembangan website landing page', 'processing', '{"virtualAccount": "BNI1234567890", "bankName": "BNI Virtual Account"}', '2026-01-29 10:30:00', '2026-01-29 10:30:00'),

('pay_007', 'admin-001', 'credit_card', 1125000.00, 'IDR', 'Manajemen media sosial (1 bulan)', 'cancelled', '{"transactionId": "CC_1643284567894", "approvalCode": "CANCELLED_GHI012", "maskedCard": "****-****-****-3456"}', '2026-01-29 15:20:00', '2026-01-29 15:21:00'),

('pay_008', 'user-001', 'ewallet', 3000000.00, 'IDR', 'Editing video cinematic', 'completed', '{"transactionId": "EW_1643284567895", "referenceId": "REF_JKL345", "phoneNumber": "****-****-6789"}', '2026-01-30 11:10:00', '2026-01-30 11:11:00'),

('pay_009', 'admin-001', 'bank_transfer', 1800000.00, 'IDR', 'Optimasi SEO on-page', 'refunded', '{"virtualAccount": "BRI1234567890", "bankName": "BRI Virtual Account"}', '2026-01-30 14:55:00', '2026-01-30 16:30:00'),

('pay_010', 'user-001', 'credit_card', 500000.00, 'IDR', 'Social media marketing campaign', 'pending', '{"transactionId": "CC_1643284567896", "approvalCode": "PENDING_MNO789", "maskedCard": "****-****-****-7890"}', '2026-01-31 09:45:00', '2026-01-31 09:45:00');

-- Step 11: Buat view untuk admin transactions (format khusus admin panel)
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
        WHEN p.description LIKE '%website%' OR p.description LIKE '%web%' OR p.description LIKE '%landing page%' THEN 'WebDev Pro'
        WHEN p.description LIKE '%video%' OR p.description LIKE '%editing%' THEN 'Video Pro Studio'
        WHEN p.description LIKE '%media sosial%' OR p.description LIKE '%social%' OR p.description LIKE '%marketing%' THEN 'Social Media Expert'
        WHEN p.description LIKE '%hotel%' OR p.description LIKE '%resort%' OR p.description LIKE '%tour%' THEN 'Travel Agency'
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

-- Step 12: Verifikasi data
SELECT 'DATABASE SETUP COMPLETED' as status,
       'Tables created and sample data inserted' as message,
       NOW() as completion_time;
