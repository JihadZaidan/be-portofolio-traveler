-- TRAVELLO Database Setup Master Script
-- Run this script to create the complete database

-- Create database
CREATE DATABASE IF NOT EXISTS travello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travello_db;

-- Source unified database setup (single authoritative schema)
SOURCE database-setup.sql;

-- Display completion message
SELECT 'TRAVELLO Database setup completed successfully!' as message,
       (SELECT COUNT(*) FROM users) as users_count,
       (SELECT COUNT(*) FROM transactions) as transactions_count,
       (SELECT COUNT(*) FROM admin_chats) as chats_count,
       (SELECT COUNT(*) FROM admin_chat_messages) as messages_count;
