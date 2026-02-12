-- ========================================
-- TRAVELLO SHOP DATABASE SETUP
-- Run this in phpMyAdmin
-- ========================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS travello_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE travello_shop;

-- ========================================
-- SHOP PRODUCTS TABLE - Core product data
-- ========================================
CREATE TABLE IF NOT EXISTS shop_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    image_src VARCHAR(500) DEFAULT '/bg-shopCards.jpg',
    price DECIMAL(10,2) NOT NULL,
    delivery_time VARCHAR(100),
    service_category VARCHAR(100),
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_shop_products_status (status),
    INDEX idx_shop_products_category (service_category),
    INDEX idx_shop_products_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SAMPLE DATA FOR SHOP PRODUCTS
-- ========================================

-- Insert sample products
INSERT IGNORE INTO shop_products (id, title, description, image_src, price, delivery_time, service_category, status) VALUES
(1, 'I will be SEO content writer for article writing or blog writing', 'Professional SEO content writing service with 7 years of experience. MBA degree holder specializing in creating content that drives results.', '/bg-shopCards.jpg', 20.00, '2 Days Delivery', 'SEO Content', 'active'),
(2, 'I will write human SEO blogs and articles', 'Human-written SEO blogs and articles that rank well and engage readers. No AI content, just authentic writing.', '/bg-shopCards.jpg', 100.00, '3 Days Delivery', 'Blog Writing', 'active'),
(3, 'I will write SEO blog posts and articles as your content writer', 'Expert SEO blog posts and articles with keyword research and optimization. Perfect for content marketing.', '/bg-shopCards.jpg', 100.00, '7 Days Delivery', 'Product Description', 'inactive');

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

SELECT 'TRAVELLO SHOP DATABASE SETUP COMPLETED' as status,
       'Database and tables created for shop management' as description,
       'Ready for admin shop panel integration' as next_step,
       NOW() as completion_time;
