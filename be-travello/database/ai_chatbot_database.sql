-- =====================================================
-- AI CHATBOT DATABASE SCHEMA
-- Dedicated database for AI Chatbot functionality
-- =====================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ai_chatbot_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ai_chatbot_db;

-- =====================================================
-- AI CHAT SESSIONS TABLE
-- Stores user sessions with AI chatbot
-- =====================================================
DROP TABLE IF EXISTS ai_chat_sessions;
CREATE TABLE ai_chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    session_metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_last_activity (last_activity),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- AI CHAT MESSAGES TABLE
-- Stores all messages between users and AI
-- =====================================================
DROP TABLE IF EXISTS ai_chat_messages;
CREATE TABLE ai_chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    message_id VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(255) NOT NULL,
    role ENUM('user', 'ai', 'system') NOT NULL,
    content TEXT NOT NULL,
    content_type ENUM('text', 'markdown', 'html') DEFAULT 'text',
    message_metadata JSON,
    processing_time_ms INT,
    tokens_used INT,
    model_used VARCHAR(100),
    intent_detected VARCHAR(100),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(session_id) ON DELETE CASCADE,
    
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at),
    INDEX idx_intent_detected (intent_detected)
);

-- =====================================================
-- AI SUGGESTIONS TABLE
-- Stores contextual suggestions for users
-- =====================================================
DROP TABLE IF EXISTS ai_suggestions;
CREATE TABLE ai_suggestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    suggestion_text VARCHAR(500) NOT NULL,
    suggestion_category ENUM('copywriter', 'travel', 'general', 'custom') NOT NULL,
    context_keywords JSON,
    click_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(session_id) ON DELETE CASCADE,
    
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_category (suggestion_category),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- AI KNOWLEDGE BASE TABLE
-- Stores knowledge base entries for AI responses
-- =====================================================
DROP TABLE IF EXISTS ai_knowledge_base;
CREATE TABLE ai_knowledge_base (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    keywords JSON NOT NULL,
    response_template TEXT NOT NULL,
    response_type ENUM('text', 'markdown', 'html') DEFAULT 'markdown',
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    success_rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_subcategory (subcategory),
    INDEX idx_priority (priority),
    INDEX idx_is_active (is_active),
    INDEX idx_usage_count (usage_count)
);

-- =====================================================
-- AI ANALYTICS TABLE
-- Stores analytics data for AI performance
-- =====================================================
DROP TABLE IF EXISTS ai_analytics;
CREATE TABLE ai_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255),
    user_id VARCHAR(255),
    event_type ENUM('message_sent', 'message_received', 'suggestion_clicked', 'session_started', 'session_ended', 'error_occurred') NOT NULL,
    event_data JSON,
    processing_time_ms INT,
    tokens_used INT,
    model_version VARCHAR(50),
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(session_id) ON DELETE SET NULL,
    
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- AI FEEDBACK TABLE
-- Stores user feedback on AI responses
-- =====================================================
DROP TABLE IF EXISTS ai_feedback;
CREATE TABLE ai_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    rating TINYINT CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    feedback_category ENUM('helpful', 'not_helpful', 'inaccurate', 'inappropriate', 'other'),
    is_improved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(session_id) ON DELETE CASCADE,
    
    INDEX idx_message_id (message_id),
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_feedback_category (feedback_category)
);

-- =====================================================
-- AI TRAINING DATA TABLE
-- Stores training data for AI model improvement
-- =====================================================
DROP TABLE IF EXISTS ai_training_data;
CREATE TABLE ai_training_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255),
    user_input TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    user_feedback_rating TINYINT,
    user_feedback_text TEXT,
    intent_detected VARCHAR(100),
    confidence_score DECIMAL(3,2),
    is_used_for_training BOOLEAN DEFAULT FALSE,
    training_status ENUM('pending', 'approved', 'rejected', 'trained') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(session_id) ON DELETE SET NULL,
    
    INDEX idx_session_id (session_id),
    INDEX idx_intent_detected (intent_detected),
    INDEX idx_training_status (training_status),
    INDEX idx_is_used_for_training (is_used_for_training)
);

-- =====================================================
-- INSERT INITIAL KNOWLEDGE BASE DATA
-- =====================================================

-- Copywriter Services Knowledge
INSERT INTO ai_knowledge_base (category, subcategory, keywords, response_template, priority) VALUES
('copywriter', 'services', 
'["copywriter", "copywriting", "tulisan", "konten", "artikel", "blog", "deskripsi", "sales letter", "ads", "iklan"]',
'📝 **Jasa Copywriter Professional**\n\nKami menyediakan berbagai layanan copywriting:\n• **Artikel Blog** - SEO friendly, engaging, 1000-2000 kata\n• **Deskripsi Produk** - Persuasive, detail, conversion-focused\n• **Sales Letter** - High-converting, emotional triggers\n• **Social Media Content** - Viral-worthy, platform-specific\n• **Website Content** - Professional, user-friendly\n• **Email Marketing** - Open-rate optimization\n\n💰 **Harga Mulai:** Rp 50.000 - Rp 500.000 per project\n⏱️ **Pengerjaan:** 1-7 hari tergantung kompleksitas',
100),

('copywriter', 'pricing',
'["harga", "price", "biaya", "cost", "tarif", "rate"]',
'💰 **Paket Harga Copywriter**\n\n🥉 **Paket Bronze** - Rp 50.000/artikel\n• 500-800 kata\n• Basic SEO\n• 1x revisi\n\n🥈 **Paket Silver** - Rp 100.000/artikel\n• 1000-1500 kata\n• Advanced SEO\n• 2x revisi\n• Research mendalam\n\n🥇 **Paket Gold** - Rp 200.000/artikel\n• 2000+ kata\n• Premium SEO\n• Unlimited revisi\n• Market analysis\n• Fast delivery (3 hari)',
90),

('copywriter', 'process',
'["proses", "cara", "how", "process", "workflow"]',
'🔄 **Proses Kerja Copywriter**\n\n1. **Briefing Client** - Diskusi kebutuhan dan target\n2. **Research** - Market research dan competitor analysis\n3. **Drafting** - Pembuatan konten pertama\n4. **Review** - Internal quality check\n5. **Revisi** - Sesuai feedback client\n6. **Final Delivery** - File siap publish\n\n📋 **Dokumentasi:**\n• Brief form detail\n• Progress report\n• plagiarism check\n• SEO score report',
80),

-- Travel Services Knowledge
('travel', 'destinations',
'["wisata", "destinasi", "liburan", "trip", "tour", "tempat"]',
'🏝️ **Destinasi Wisata Populer**\n\n🌟 **Bali** - Island of Gods\n• Pantai Kuta, Seminyak, Nusa Dua\n• Ubud (culture & nature)\n• Tanah Lot, Uluwatu Temple\n• Budget: Rp 1-3 juta/3 hari\n\n🏛️ **Yogyakarta** - Cultural Heritage\n• Candi Borobudur & Prambanan\n• Malioboro shopping street\n• Keraton Yogyakarta\n• Budget: Rp 800ribu-2 juta/3 hari\n\n🐉 **Labuan Bajo** - Komodo Adventure\n• Komodo National Park\n• Pink Beach, Manta Point\n• Island hopping\n• Budget: Rp 3-5 juta/4 hari',
100),

('travel', 'packages',
'["paket", "package", "promo", "bundle"]',
'🎒 **Paket Wisata Terbaik**\n\n🏖️ **Paket Bali Family**\n• 4H3M untuk 4 orang\n• Hotel + breakfast\n• Private transport\n• Tiket masuk 3 destinasi\n• Harga: Rp 6 juta\n\n🏛️ **Paket Jogja Heritage**\n• 3H2M untuk 2 orang\n• Hotel dekat Malioboro\n• Tour guide\n• All-inclusive tiket\n• Harga: Rp 3.5 juta\n\n🐉 **Paket Komodo Explorer**\n• 4H3M untuk 2 orang\n• Resort + full board\n• Private boat\n• Diving equipment\n• Harga: Rp 8 juta',
90),

('travel', 'tips',
'["tips", "trick", "guide", "panduan", "hemat"]',
'💡 **Tips Traveling Hemat**\n\n🎯 **Planning:**\n• Booking tiket 1-2 bulan sebelumnya\n• Pilih weekday daripada weekend\n• Bandingkan harga di multiple platform\n\n🏨 **Akomodasi:**\n• Guesthouse/hotel bintang 2-3\n• Cari promo di Agoda/Traveloka\n• Pertimbangkan Airbnb untuk long stay\n\n🍜 **Makanan:**\n• Coba street food lokal\n• Hindari restoran di area turis\n• Beli snack di minimarket\n\n🚗 **Transportasi:**\n• Gunakan transportasi umum\n• Sewa motor untuk explore\n• Gunakan Go-Jek/Grab untuk jarak dekat',
85),

-- Combined Services
('combined', 'bundle',
'["bundle", "lengkap", "all-in-one", "solution", "kombinasi"]',
'🎁 **Paket Bundle - Copywriter + Travel**\n\n📝 **Travel Content Package**\n• 10 artikel travel blog\n• 50 social media captions\n• 5 video scripts\n• SEO optimization\n• Harga: Rp 2.5 juta (hemat 20%)\n\n🏝️ **Travel Business Package**\n• Website content lengkap\n• Product descriptions\n• Email marketing templates\n• Brand storytelling\n• Harga: Rp 5 juta (hemat 25%)\n\n🎯 **Influencer Package**\n• Personal branding content\n• Travel vlog scripts\n• Social media management\n• Engagement strategies\n• Harga: Rp 7.5 juta (hemat 30%)',
95);

-- =====================================================
-- CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update last_activity in sessions when new message is added
DELIMITER //
CREATE TRIGGER update_session_activity 
AFTER INSERT ON ai_chat_messages
FOR EACH ROW
BEGIN
    UPDATE ai_chat_sessions 
    SET last_activity = NEW.created_at 
    WHERE session_id = NEW.session_id;
END//
DELIMITER ;

-- Trigger to increment usage count in knowledge base
DELIMITER //
CREATE TRIGGER increment_knowledge_usage 
AFTER INSERT ON ai_chat_messages
FOR EACH ROW
BEGIN
    IF NEW.intent_detected IS NOT NULL THEN
        UPDATE ai_knowledge_base 
        SET usage_count = usage_count + 1 
        WHERE category = NEW.intent_detected;
    END IF;
END//
DELIMITER ;

-- =====================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active sessions with message count
DROP VIEW IF EXISTS active_sessions_summary;
CREATE VIEW active_sessions_summary AS
SELECT 
    s.session_id,
    s.user_id,
    s.user_name,
    s.user_email,
    s.started_at,
    s.last_activity,
    COUNT(m.id) as message_count,
    TIMESTAMPDIFF(MINUTE, s.started_at, s.last_activity) as duration_minutes
FROM ai_chat_sessions s
LEFT JOIN ai_chat_messages m ON s.session_id = m.session_id
WHERE s.is_active = TRUE
GROUP BY s.session_id, s.user_id, s.user_name, s.user_email, s.started_at, s.last_activity;

-- View for daily analytics summary
DROP VIEW IF EXISTS daily_analytics_summary;
CREATE VIEW daily_analytics_summary AS
SELECT 
    DATE(created_at) as date,
    event_type,
    COUNT(*) as event_count,
    AVG(processing_time_ms) as avg_processing_time,
    SUM(tokens_used) as total_tokens
FROM ai_analytics
GROUP BY DATE(created_at), event_type
ORDER BY date DESC, event_type;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample session
INSERT INTO ai_chat_sessions (session_id, user_id, user_name, user_email, session_metadata) VALUES
('test_session_001', 'user_demo_001', 'Demo User', 'demo@travello.com', '{"source": "web", "device": "desktop"}');

-- Insert sample messages
INSERT INTO ai_chat_messages (session_id, message_id, user_id, role, content, intent_detected, confidence_score) VALUES
('test_session_001', 'msg_001', 'user_demo_001', 'user', 'Halo, saya butuh jasa copywriter', 'copywriter', 0.95),
('test_session_001', 'msg_002', 'ai_system', 'ai', '📝 **Jasa Copywriter Professional**\n\nKami menyediakan berbagai layanan copywriting...', 'copywriter', 1.00),
('test_session_001', 'msg_003', 'user_demo_001', 'user', 'Berapa harganya?', 'copywriter', 0.92),
('test_session_001', 'msg_004', 'ai_system', 'ai', '💰 **Paket Harga Copywriter**\n\n🥉 **Paket Bronze** - Rp 50.000/artikel...', 'copywriter', 1.00);

-- Insert sample suggestions
INSERT INTO ai_suggestions (session_id, user_id, suggestion_text, suggestion_category, context_keywords) VALUES
('test_session_001', 'user_demo_001', 'Harga copywriter artikel', 'copywriter', '["harga", "artikel"]'),
('test_session_001', 'user_demo_001', 'Proses pengerjaan', 'copywriter', '["proses", "pengerjaan"]'),
('test_session_001', 'user_demo_001', 'Rekomendasi destinasi Bali', 'travel', '["rekomendasi", "bali"]'),
('test_session_001', 'user_demo_001', 'Tips hemat traveling', 'travel', '["tips", "hemat", "traveling"]');

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Add indexes for better performance
CREATE INDEX idx_ai_chat_messages_composite ON ai_chat_messages(session_id, created_at);
CREATE INDEX idx_ai_analytics_composite ON ai_analytics(created_at, event_type);
CREATE INDEX idx_ai_sessions_composite ON ai_chat_sessions(user_id, last_activity);

-- =====================================================
-- DATABASE COMPLETION
-- =====================================================

-- Show table creation summary
SELECT 
    TABLE_NAME as table_name,
    TABLE_ROWS as row_count,
    DATA_LENGTH as data_size_bytes,
    INDEX_LENGTH as index_size_bytes
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'ai_chatbot_db'
ORDER BY TABLE_NAME;

-- Display completion message
SELECT 'AI Chatbot Database created successfully!' as status,
       NOW() as completion_time;
