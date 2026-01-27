-- TRAVELLO Database Quick Setup for DBeaver
-- Copy semua SQL ini dan paste di DBeaver SQL Editor

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    google_id TEXT UNIQUE,
    display_name TEXT,
    profile_picture TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_email_verified BOOLEAN NOT NULL DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message TEXT,
    response TEXT,
    role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Travel knowledge base
CREATE TABLE IF NOT EXISTS travel_knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    keyword TEXT NOT NULL,
    response TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_travel_knowledge_category ON travel_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_travel_knowledge_keyword ON travel_knowledge(keyword);

-- Insert sample travel knowledge data
INSERT OR IGNORE INTO travel_knowledge (category, keyword, response, priority) VALUES
('wisata', 'bali', '🏝️ **Bali** - Pulau Dewata\n• Pantai Kuta, Seminyak, Nusa Dua\n• Ubud untuk culture dan nature\n• Budget: Rp 1-3 juta untuk 3 hari\n\n💡 **Tips:**\n• Selalu cek review terbaru sebelum booking\n• Bandingkan harga di multiple platform', 1),
('wisata', 'yogyakarta', '🏛️ **Yogyakarta** - Kota Budaya\n• Candi Borobudur & Prambanan\n• Malioboro untuk belanja oleh-oleh\n• Pantai Parangtritis untuk sunset\n• Budget: Rp 500rb-1.5 juta untuk 3 hari', 1),
('hotel', 'murah', '🏨 **Hotel Murah:**\n• RedDoorz - Rp 100-300rb/malam\n• OYO - Rp 150-400rb/malam\n• Airbnb - Rp 200-500rb/malam\n\n💰 **Tips:**\n• Booking jauh hari untuk harga terbaik\n• Cek promo di Traveloka/Tiket.com', 1),
('transportasi', 'kereta', '🚂 **Transportasi Kereta:**\n• KAI Access - Ekonomi AC\n• KAI Jaka - Bisnis\n• Argo - Eksekutif\n\n📱 **Booking:**\n• KAI Access app\n• Traveloka\n• Tiket.com\n\n💡 **Tips:**\n• Booking H-90 untuk harga promo\n• Pilih jadwal pagi untuk on-time', 1),
('makanan', 'khas', '🍜 **Makanan Khas Indonesia:**\n• **Sumatra:** Rendang, Sate Padang\n• **Jawa:** Gudeg, Soto, Rawon\n• **Bali:** Babi Guling, Lawar\n• **Sulawesi:** Coto Makassar, Pallu Basa\n\n📍 **Tempat Makan:**\n• Warung lokal untuk autentik\n• Food court untuk variasi\n• Restoran untuk fine dining', 1),
('budget', 'backpacker', '🎒 **Backpacker Budget Tips:**\n• **Akomodasi:** Hostel Rp 50-150rb/malam\n• **Makan:** Warung Rp 15-50rb/saji\n• **Transport:** Angkot/Online Rp 10-30rb/trip\n• **Total:** Rp 500rb-1 juta/minggu\n\n💡 **Save Money:**\n• Masak di hostel\n• Gratis walking tour\n• Pakai transport umum', 1);

-- Insert sample users (password: admin123 dan password123)
INSERT OR IGNORE INTO users (
    id, 
    username, 
    email, 
    password, 
    role, 
    is_email_verified, 
    created_at, 
    updated_at
) VALUES
(
    'admin-001',
    'admin',
    'admin@travello.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LfC',
    'admin',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'user-001',
    'testuser',
    'user@travello.com',
    '$2a$12$9XqYcWQnWqKqBqBqBqOYz6TtxMQJqhN8/LewdBPj6ukx.LfC',
    'user',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Create view for user statistics
CREATE VIEW IF NOT EXISTS user_stats AS
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

-- Success message
SELECT '✅ TRAVELLO Database created successfully!' as status,
       datetime('now') as created_at;
