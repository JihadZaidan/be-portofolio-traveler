-- =============================================
-- Travel Journal Database Schema for phpMyAdmin
-- =============================================
-- Database: travello_db
-- Table: travel_journals

-- Create table if not exists
CREATE TABLE IF NOT EXISTS `travel_journals` (
  `id` VARCHAR(255) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL,
  `cover` TEXT NOT NULL,
  `images` JSON NOT NULL DEFAULT (JSON_ARRAY()),
  `status` ENUM('active', 'expired') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name` (`name`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Sample Data (Optional)
-- =============================================

-- Insert sample travel journal
INSERT INTO `travel_journals` (`id`, `name`, `cover`, `images`, `status`) VALUES 
('bali-journal-001', 'Bali Adventure', '/foto 2.jpg', JSON_ARRAY('/foto 2.jpg', '/foto 5.jpg', '/foto 7.jpg'), 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `travel_journals` (`id`, `name`, `cover`, `images`, `status`) VALUES 
('tokyo-journal-001', 'Tokyo Experience', '/foto 1.jpg', JSON_ARRAY('/foto 1.jpg'), 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- =============================================
-- Queries for Testing
-- =============================================

-- View all travel journals
SELECT 
  id, 
  name, 
  cover, 
  JSON_LENGTH(images) as image_count,
  status, 
  created_at,
  updated_at,
  CASE 
    WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 24 THEN 'expired'
    ELSE 'active'
  END as calculated_status
FROM travel_journals 
ORDER BY created_at DESC;

-- View expired journals (older than 24 hours)
SELECT * FROM travel_journals 
WHERE TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 24;

-- Delete expired journals (older than 24 hours)
DELETE FROM travel_journals 
WHERE TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 24;

-- =============================================
-- Manual Cleanup Instructions
-- =============================================

/*
To manually manage travel journals in phpMyAdmin:

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Select database: travello_db
3. Find table: travel_journals
4. You can:
   - Browse data (Browse tab)
   - Add new journal (Insert tab)
   - Edit existing (Edit link)
   - Delete (Delete link)
   - Run SQL queries (SQL tab)

Table Location:
- Database: travello_db
- Table: travel_journals
- Location in phpMyAdmin: 
  http://localhost/phpmyadmin/db.php?db=travello_db&table=travel_journals

Auto-cleanup runs every hour via backend API.
*/
