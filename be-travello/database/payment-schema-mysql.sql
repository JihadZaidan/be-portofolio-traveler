-- Payments table for TRAVELLO payment system (MySQL version)
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    method VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    description TEXT NOT NULL,
    booking_id VARCHAR(255),
    customer_info TEXT, -- JSON string
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    processing_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_gateway_response TEXT, -- JSON string
    refund_reason TEXT,
    refund_processed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payments_user_id (user_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_method (method),
    INDEX idx_payments_booking_id (booking_id),
    INDEX idx_payments_created_at (created_at),
    INDEX idx_payments_user_status (user_id, status)
);

-- Payment transactions table (for detailed transaction logs)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id VARCHAR(255) PRIMARY KEY,
    payment_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    description TEXT,
    gateway_transaction_id VARCHAR(255),
    gateway_response TEXT, -- JSON string
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payment_transactions_payment_id (payment_id),
    INDEX idx_payment_transactions_type (type),
    INDEX idx_payment_transactions_status (status),
    INDEX idx_payment_transactions_gateway_id (gateway_transaction_id)
);

-- Payment methods configuration table
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    fees DECIMAL(5,2) DEFAULT 0, -- percentage fee
    fixed_fee DECIMAL(10,2) DEFAULT 0, -- fixed fee amount
    min_amount DECIMAL(10,2),
    max_amount DECIMAL(10,2),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    config TEXT, -- JSON string for method-specific config
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payment_methods_is_active (is_active)
);

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
('pay_001', 'admin-001', 'credit_card', 150000.00, 'IDR', 'Hotel booking - Bali Resort', 'completed', '{"transactionId": "CC_1643284567890", "approvalCode": "APPROV_XYZ123", "maskedCard": "****-****-****-1234"}', '2026-01-27 10:00:00', '2026-01-27 10:01:00'),
('pay_002', 'user-001', 'ewallet', 75000.00, 'IDR', 'Transport booking - GoCar', 'completed', '{"transactionId": "EW_1643284567891", "referenceId": "REF_ABC123", "phoneNumber": "****-****-5678"}', '2026-01-27 11:30:00', '2026-01-27 11:31:00'),
('pay_003', 'admin-001', 'bank_transfer', 250000.00, 'IDR', 'Tour package - Yogyakarta', 'pending', '{"virtualAccount": "BCA1234567890", "bankName": "BCA Virtual Account"}', '2026-01-27 14:15:00', '2026-01-27 14:15:00');

SELECT '✅ TRAVELLO Payment Database (MySQL) created successfully!' as status,
       NOW() as created_at;
