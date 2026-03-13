-- TRAVELLO Transactions Table
-- Payment and service transactions

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    type ENUM('copywriter_service', 'travel_package', 'consultation', 'other') NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Financial information
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    discount DECIMAL(12,2) DEFAULT 0.00,
    tax DECIMAL(12,2) DEFAULT 0.00,
    final_amount DECIMAL(12,2) NOT NULL,
    
    -- Payment information
    payment_method ENUM('transfer', 'ewallet', 'credit_card', 'paypal', 'other') NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    payment_date DATETIME,
    payment_proof VARCHAR(500),
    
    -- Service details (flexible fields)
    copywriter_package ENUM('basic', 'standard', 'premium'),
    word_count INT,
    topic VARCHAR(255),
    deadline DATE,
    
    -- Travel package fields
    travel_destination VARCHAR(255),
    travel_duration INT, -- in days
    departure_date DATE,
    return_date DATE,
    participants INT,
    
    -- Consultation fields
    consultation_type ENUM('travel_planning', 'copywriter_consultation', 'general'),
    consultation_date DATETIME,
    consultation_duration INT, -- in hours
    
    -- Status tracking
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
    confirmed_at DATETIME,
    started_at DATETIME,
    completed_at DATETIME,
    cancelled_at DATETIME,
    
    -- Notes
    notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    INDEX idx_payment_date (payment_date)
);

-- Sample transactions
INSERT INTO transactions (transaction_id, user_id, type, service_name, description, amount, final_amount, payment_method, payment_status, status, copywriter_package, word_count, topic, deadline) VALUES 
('TXN1698765432001ABC', 2, 'copywriter_service', 'Basic Copywriter Package', 'Website content writing service', 1500000.00, 1500000.00, 'transfer', 'paid', 'completed', 'basic', 1000, 'Travel website content', DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)),
('TXN1698765432002DEF', 3, 'travel_package', 'Bali Adventure Package', '3 days 2 nights Bali adventure tour', 3500000.00, 3500000.00, 'ewallet', 'paid', 'confirmed', NULL, NULL, NULL, NULL, 'Bali', 3, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 16 DAY), 2),
('TXN1698765432003GHI', 2, 'consultation', 'Travel Planning Consultation', '1 hour travel planning session', 500000.00, 500000.00, 'credit_card', 'pending', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'travel_planning', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 1);
