-- TRAVELLO Database Schema for MySQL
-- Created for phpMyAdmin Integration

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS travello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE travello_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    profile_picture TEXT,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    message TEXT,
    response TEXT,
    role ENUM('user', 'ai') NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_chat_messages_session_id (session_id),
    INDEX idx_chat_messages_user_id (user_id),
    INDEX idx_chat_messages_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User sessions table (for better session management)
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sessions_user_id (user_id),
    INDEX idx_user_sessions_token (token(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Travel knowledge base for auto chat
CREATE TABLE IF NOT EXISTS travel_knowledge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    keyword VARCHAR(255) NOT NULL,
    response TEXT NOT NULL,
    priority INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_travel_knowledge_category (category),
    INDEX idx_travel_knowledge_keyword (keyword)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample travel knowledge data
INSERT IGNORE INTO travel_knowledge (category, keyword, response, priority) VALUES
('wisata', 'bali', '🏝️ **Bali** - Pulau Dewata\n• Pantai Kuta, Seminyak, Nusa Dua\n• Ubud untuk culture dan nature\n• Budget: Rp 1-3 juta untuk 3 hari\n\n💡 **Tips tambahan:**\n• Selalu cek review terbaru sebelum booking\n• Bandingkan harga di multiple platform\n• Pertimbangkan musim wisata untuk pengalaman terbaik', 1),
('wisata', 'yogyakarta', '🏛️ **Yogyakarta** - Kota Budaya\n• Candi Borobudur & Prambanan\n• Malioboro untuk belanja oleh-oleh\n• Pantai Parangtritis untuk sunset\n• Budget: Rp 500rb-1.5 juta untuk 3 hari', 1),
('hotel', 'murah', '🏨 **Hotel Murah Recommendations:**\n• RedDoorz - Rp 100-300rb/malam\n• OYO - Rp 150-400rb/malam\n• Airbnb - Rp 200-500rb/malam\n\n💰 **Tips:**\n• Booking jauh hari untuk harga terbaik\n• Cek promo di Traveloka/Tiket.com\n• Pertimbangkan lokasi dekat transportasi', 1),
('transportasi', 'kereta', '🚂 **Transportasi Kereta:**\n• KAI Access - Ekonomi AC\n• KAI Jaka - Bisnis\n• Argo - Eksekutif\n\n📱 **Booking:**\n• KAI Access app\n• Traveloka\n• Tiket.com\n\n💡 **Tips:**\n• Booking H-90 untuk harga promo\n• Pilih jadwal pagi untuk on-time', 1),
('makanan', 'khas', '🍜 **Makanan Khas Indonesia:**\n• **Sumatra:** Rendang, Sate Padang\n• **Jawa:** Gudeg, Soto, Rawon\n• **Bali:** Babi Guling, Lawar\n• **Sulawesi:** Coto Makassar, Pallu Basa\n\n📍 **Tempat Makan:**\n• Warung lokal untuk autentik\n• Food court untuk variasi\n• Restoran untuk fine dining', 1),
('budget', 'backpacker', '🎒 **Backpacker Budget Tips:**\n• **Akomodasi:** Hostel Rp 50-150rb/malam\n• **Makan:** Warung Rp 15-50rb/saji\n• **Transport:** Angkot/Online Rp 10-30rb/trip\n• **Total:** Rp 500rb-1 juta/minggu\n\n💡 **Save Money:**\n• Masak di hostel\n• Gratis walking tour\n• Pakai transport umum', 1);

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.created_at,
    u.last_login,
    COUNT(cm.id) as total_messages,
    COUNT(DISTINCT cm.session_id) as total_sessions,
    MAX(cm.timestamp) as last_activity
FROM users u
LEFT JOIN chat_messages cm ON u.id = cm.user_id
GROUP BY u.id, u.username, u.email, u.created_at, u.last_login;

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

-- Sample regular user for testing (password: password123)
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
    'testuser',
    'user@travello.com',
    '$2a$12$9XqYcWQnWqKqBqBqBqBqOYz6TtxMQJqhN8/LewdBPj6ukx.LfC', -- password123
    'user',
    TRUE,
    NOW(),
    NOW()
);

-- Create a table to track login history
CREATE TABLE IF NOT EXISTS login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_method ENUM('local', 'google', 'github') NOT NULL DEFAULT 'local',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_login_history_user_id (user_id),
    INDEX idx_login_history_login_time (login_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
