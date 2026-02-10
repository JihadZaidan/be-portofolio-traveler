-- Create Travel Journal Table
CREATE TABLE IF NOT EXISTS `travel_journals` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL,
  `cover_image` TEXT NOT NULL,
  `images` JSON NOT NULL DEFAULT (JSON_ARRAY()),
  `status` ENUM('active', 'expired') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT IGNORE INTO `travel_journals` (`id`, `name`, `cover_image`, `images`, `status`, `created_at`, `updated_at`) VALUES
('bali-journal-001', 'Bali', '/foto 2.jpg', '["/foto 2.jpg", "/foto 5.jpg", "/foto 7.jpg"]', 'active', NOW(), NOW()),
('tokyo-journal-002', 'Tokyo', '/foto 1.jpg', '["/foto 1.jpg"]', 'active', NOW(), NOW());
