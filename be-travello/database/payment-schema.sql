-- Payments table for TRAVELLO payment system
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payment transactions table (for detailed transaction logs)
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
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- Payment methods configuration table
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
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);

-- Create indexes for payment_transactions table
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(type);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_id ON payment_transactions(gateway_transaction_id);

-- Create indexes for payment_methods table
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_active ON payment_methods(is_active);

-- Insert default payment methods
INSERT OR IGNORE INTO payment_methods (id, name, display_name, description, icon, fees, fixed_fee, min_amount, max_amount, is_active) VALUES
('credit_card', 'credit_card', 'Credit Card', 'Visa, Mastercard, JCB', '💳', 2.9, 0, 10000, 50000000, 1),
('bank_transfer', 'bank_transfer', 'Bank Transfer', 'Transfer to virtual account', '🏦', 0, 0, 10000, 100000000, 1),
('ewallet', 'ewallet', 'E-Wallet', 'GoPay, OVO, Dana, ShopeePay', '📱', 1.5, 0, 1000, 20000000, 1),
('virtual_account', 'virtual_account', 'Virtual Account', 'BCA, BNI, BRI, Mandiri VA', '🔢', 0, 0, 10000, 50000000, 1);

-- Create view for payment statistics
CREATE VIEW IF NOT EXISTS payment_stats AS
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

-- Create view for payment method performance
CREATE VIEW IF NOT EXISTS payment_method_performance AS
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

-- Sample payment data for testing
INSERT OR IGNORE INTO payments (
    id, user_id, method, amount, currency, description, status, payment_gateway_response, created_at, updated_at
) VALUES
('pay_001', 'admin-001', 'credit_card', 150000.00, 'IDR', 'Hotel booking - Bali Resort', 'completed', '{"transactionId": "CC_1643284567890", "approvalCode": "APPROV_XYZ123", "maskedCard": "****-****-****-1234"}', '2026-01-27 10:00:00', '2026-01-27 10:01:00'),
('pay_002', 'user-001', 'ewallet', 75000.00, 'IDR', 'Transport booking - GoCar', 'completed', '{"transactionId": "EW_1643284567891", "referenceId": "REF_ABC123", "phoneNumber": "****-****-5678"}', '2026-01-27 11:30:00', '2026-01-27 11:31:00'),
('pay_003', 'admin-001', 'bank_transfer', 250000.00, 'IDR', 'Tour package - Yogyakarta', 'pending', '{"virtualAccount": "BCA1234567890", "bankName": "BCA Virtual Account"}', '2026-01-27 14:15:00', '2026-01-27 14:15:00');

-- Sample transaction data
INSERT OR IGNORE INTO payment_transactions (
    id, payment_id, type, amount, currency, description, gateway_transaction_id, status, created_at, updated_at
) VALUES
('txn_001', 'pay_001', 'payment', 150000.00, 'IDR', 'Credit card payment processing', 'CC_1643284567890', 'completed', '2026-01-27 10:00:00', '2026-01-27 10:01:00'),
('txn_002', 'pay_001', 'fee', 4350.00, 'IDR', 'Credit card processing fee (2.9%)', 'FEE_CC_1643284567890', 'completed', '2026-01-27 10:00:00', '2026-01-27 10:01:00'),
('txn_003', 'pay_002', 'payment', 75000.00, 'IDR', 'E-wallet payment processing', 'EW_1643284567891', 'completed', '2026-01-27 11:30:00', '2026-01-27 11:31:00'),
('txn_004', 'pay_002', 'fee', 1125.00, 'IDR', 'E-wallet processing fee (1.5%)', 'FEE_EW_1643284567891', 'completed', '2026-01-27 11:30:00', '2026-01-27 11:31:00');

-- Success message
SELECT '✅ TRAVELLO Payment Database created successfully!' as status,
       datetime('now') as created_at;
