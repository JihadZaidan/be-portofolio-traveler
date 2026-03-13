-- TRAVELLO Admin Chat Table
-- Customer support chat sessions

CREATE TABLE IF NOT EXISTS admin_chat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL UNIQUE,
    user_id INT,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20),
    is_guest BOOLEAN DEFAULT TRUE,
    
    -- Chat status
    status ENUM('active', 'waiting', 'closed', 'archived') DEFAULT 'waiting',
    assigned_admin_id INT,
    
    -- Unread counts
    unread_user_count INT DEFAULT 0,
    unread_admin_count INT DEFAULT 0,
    
    -- Last message info
    last_message TEXT,
    last_message_sender ENUM('user', 'admin'),
    last_message_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Chat metadata
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    category ENUM('general', 'support', 'sales', 'complaint', 'technical') DEFAULT 'general',
    tags JSON, -- Array of tags
    
    -- Resolution tracking
    resolved_at DATETIME,
    resolution_notes TEXT,
    satisfaction_rating INT CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    satisfaction_feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_assigned_admin (assigned_admin_id),
    INDEX idx_user_email (user_email),
    INDEX idx_created_at (created_at),
    INDEX idx_last_activity (last_activity_at),
    INDEX idx_priority_status (priority, status)
);

-- Sample chat sessions
INSERT INTO admin_chat (session_id, user_id, user_name, user_email, is_guest, status, priority, category) VALUES 
('CHAT1698765432001DEF', 2, 'John Doe', 'john@example.com', FALSE, 'active', 'medium', 'general'),
('CHAT1698765432002GHI', 3, 'Jane Smith', 'jane@example.com', FALSE, 'waiting', 'high', 'support'),
('CHAT1698765432003JKL', NULL, 'Guest User', 'guest@example.com', TRUE, 'active', 'medium', 'sales');
