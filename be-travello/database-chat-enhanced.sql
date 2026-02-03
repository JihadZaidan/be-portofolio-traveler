-- Enhanced Database Schema for Real-time Chat System
-- Extends existing database with conversation management

-- Conversations table (groups messages between participants)
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    participant_1_id TEXT NOT NULL,
    participant_2_id TEXT NOT NULL,
    last_message TEXT,
    last_message_timestamp DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_2_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(participant_1_id, participant_2_id)
);

-- Enhanced chat_messages table with conversation relationship
CREATE TABLE IF NOT EXISTS chat_messages_enhanced (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    file_url TEXT,
    is_read BOOLEAN DEFAULT 0,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Online users tracking
CREATE TABLE IF NOT EXISTS user_online_status (
    user_id TEXT PRIMARY KEY,
    is_online BOOLEAN DEFAULT 0,
    last_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    socket_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Typing indicators
CREATE TABLE IF NOT EXISTS typing_indicators (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    is_typing BOOLEAN DEFAULT 1,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1_id, participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages_enhanced(conversation_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages_enhanced(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON chat_messages_enhanced(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages_enhanced(receiver_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_online_status ON user_online_status(is_online, last_seen);
CREATE INDEX IF NOT EXISTS idx_typing_indicators ON typing_indicators(conversation_id, user_id);

-- Triggers for conversation updates
CREATE TRIGGER IF NOT EXISTS update_conversation_timestamp 
    AFTER INSERT ON chat_messages_enhanced
    FOR EACH ROW
BEGIN
    UPDATE conversations 
    SET last_message = NEW.message,
        last_message_timestamp = NEW.timestamp,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
END;

-- Trigger for cleaning up old typing indicators
CREATE TRIGGER IF NOT EXISTS cleanup_typing_indicators
    AFTER INSERT ON typing_indicators
    FOR EACH ROW
BEGIN
    DELETE FROM typing_indicators 
    WHERE timestamp < datetime('now', '-5 minutes');
END;

-- Views for common queries
CREATE VIEW IF NOT EXISTS conversation_list AS
SELECT 
    c.id,
    c.participant_1_id,
    c.participant_2_id,
    c.last_message,
    c.last_message_timestamp,
    c.created_at,
    c.updated_at,
    u1.username as participant_1_name,
    u1.display_name as participant_1_display,
    u1.profile_picture as participant_1_avatar,
    u2.username as participant_2_name,
    u2.display_name as participant_2_display,
    u2.profile_picture as participant_2_avatar,
    CASE 
        WHEN u1.display_name IS NOT NULL AND u1.display_name != '' THEN u1.display_name
        ELSE u1.username
    END as participant_1_display_name,
    CASE 
        WHEN u2.display_name IS NOT NULL AND u2.display_name != '' THEN u2.display_name
        ELSE u2.username
    END as participant_2_display_name,
    (SELECT COUNT(*) FROM chat_messages_enhanced cm 
     WHERE cm.conversation_id = c.id AND cm.receiver_id = u1.id AND cm.is_read = 0) as unread_count_1,
    (SELECT COUNT(*) FROM chat_messages_enhanced cm 
     WHERE cm.conversation_id = c.id AND cm.receiver_id = u2.id AND cm.is_read = 0) as unread_count_2
FROM conversations c
JOIN users u1 ON c.participant_1_id = u1.id
JOIN users u2 ON c.participant_2_id = u2.id;

-- Sample conversation data for testing
INSERT OR IGNORE INTO conversations (
    id, 
    participant_1_id, 
    participant_2_id, 
    last_message, 
    last_message_timestamp
) VALUES 
('conv-001', 'user-001', 'admin-001', 'Halo kak, saya mau tanya tentang paket liburan di Bali.', datetime('now', '-1 hour')),
('conv-002', 'user-001', 'admin-001', 'Terima kasih atas informasinya!', datetime('now', '-2 days'));

-- Sample messages
INSERT OR IGNORE INTO chat_messages_enhanced (
    id, 
    conversation_id, 
    sender_id, 
    receiver_id, 
    message, 
    timestamp
) VALUES 
('msg-001', 'conv-001', 'user-001', 'admin-001', 'Halo kak, saya mau tanya tentang paket liburan di Bali.', datetime('now', '-1 hour')),
('msg-002', 'conv-001', 'admin-001', 'user-001', 'Halo, selamat siang! Untuk paket Bali yang mana ya kak?', datetime('now', '-59 minutes')),
('msg-003', 'conv-001', 'user-001', 'admin-001', 'Yang 3 hari 2 malam kak, yang ada Ubud dan Nusa Penida.', datetime('now', '-58 minutes')),
('msg-004', 'conv-001', 'admin-001', 'user-001', 'Baik, saya kirim detail itinerary dan harganya di sini ya kak.', datetime('now', '-57 minutes')),
('msg-005', 'conv-002', 'user-001', 'admin-001', 'Terima kasih atas informasinya!', datetime('now', '-2 days')),
('msg-006', 'conv-002', 'admin-001', 'user-001', 'Sama-sama, semoga perjalanan Anda menyenangkan!', datetime('now', '-2 days', '-59 minutes'));
