-- TRAVELLO Users Table
-- User accounts and profiles

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT '/images/default-avatar.png',
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other') DEFAULT 'other',
    
    -- Address fields
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_province VARCHAR(100),
    address_postal_code VARCHAR(10),
    address_country VARCHAR(100) DEFAULT 'Indonesia',
    
    -- Travel preferences
    travel_style ENUM('budget', 'mid-range', 'luxury') DEFAULT 'mid-range',
    favorite_destinations JSON, -- Array of destinations
    interests JSON, -- Array of interests: ['adventure', 'beach', 'mountain', 'city', 'cultural', 'food', 'shopping', 'nature']
    
    -- Account status
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role ENUM('user', 'admin') DEFAULT 'admin',
    
    -- Statistics
    total_transactions INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_google_id (google_id),
    INDEX idx_active_verified (is_active, is_verified),
    INDEX idx_created_at (created_at),
    INDEX idx_role (role)
);

-- Sample data
INSERT INTO users (name, email, role, is_verified, is_active, travel_style, favorite_destinations, interests) VALUES 
('TRAVELLO Admin', 'admin@travello.com', 'admin', TRUE, TRUE, 'mid-range', 
 JSON_ARRAY('Bali', 'Yogyakarta', 'Raja Ampat'), 
 JSON_ARRAY('cultural', 'adventure', 'food')),
('John Doe', 'john@example.com', 'user', TRUE, TRUE, 'budget', 
 JSON_ARRAY('Bali', 'Lombok'), 
 JSON_ARRAY('beach', 'adventure')),
('Jane Smith', 'jane@example.com', 'user', TRUE, TRUE, 'luxury', 
 JSON_ARRAY('Raja Ampat', 'Komodo', 'Flores'), 
 JSON_ARRAY('adventure', 'nature', 'cultural'));
