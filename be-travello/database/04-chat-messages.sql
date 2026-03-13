-- TRAVELLO Chat Messages Table
-- Individual chat messages

CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender ENUM('user', 'admin') NOT NULL,
    sender_id INT,
    sender_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    file_url VARCHAR(500),
    
    -- Message status
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    
    -- Metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at DATETIME,
    
    -- Foreign key
    FOREIGN KEY (chat_id) REFERENCES admin_chat(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_chat_id (chat_id),
    INDEX idx_sender (sender),
    INDEX idx_timestamp (timestamp),
    INDEX idx_is_read (is_read)
);

-- Sample chat messages
INSERT INTO chat_messages (chat_id, sender, sender_name, message, timestamp) VALUES 
(1, 'user', 'John Doe', 'Halo, saya tertarik dengan layanan copywriter', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'admin', 'TRAVELLO Admin', 'Halo! Terima kasih telah menghubungi kami. Ada yang bisa kami bantu?', DATE_SUB(NOW(), INTERVAL 55 MINUTE)),
(2, 'user', 'Jane Smith', 'Saya butuh bantuan untuk paket travel ke Bali', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(3, 'user', 'Guest User', 'Apakah ada promo untuk layanan copywriter?', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(1, 'user', 'John Doe', 'Berapa harga untuk paket basic?', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(1, 'admin', 'TRAVELLO Admin', 'Paket basic kami harganya Rp 1.500.000 untuk 1000 kata', DATE_SUB(NOW(), INTERVAL 5 MINUTE));

-- Update last message in chats
UPDATE admin_chat 
SET last_message = 'Paket basic kami harganya Rp 1.500.000 untuk 1000 kata',
    last_message_sender = 'admin',
    last_message_timestamp = DATE_SUB(NOW(), INTERVAL 5 MINUTE),
    unread_user_count = 1
WHERE id = 1;

UPDATE admin_chat 
SET last_message = 'Saya butuh bantuan untuk paket travel ke Bali',
    last_message_sender = 'user',
    last_message_timestamp = DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    unread_admin_count = 1
WHERE id = 2;

UPDATE admin_chat 
SET last_message = 'Apakah ada promo untuk layanan copywriter?',
    last_message_sender = 'user',
    last_message_timestamp = DATE_SUB(NOW(), INTERVAL 15 MINUTE),
    unread_admin_count = 1
WHERE id = 3;
