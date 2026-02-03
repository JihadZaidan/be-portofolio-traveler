-- ========================================
-- TRAVELLO SHOP DATABASE SETUP
-- For phpMyAdmin / MySQL Integration
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
-- SHOP PRODUCT DETAILS TABLE - Detailed product descriptions
-- ========================================
CREATE TABLE IF NOT EXISTS shop_product_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    full_text TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE,
    INDEX idx_product_details_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SHOP PRODUCT ADVANTAGES TABLE - Product advantages/features
-- ========================================
CREATE TABLE IF NOT EXISTS shop_product_advantages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(300),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE,
    INDEX idx_product_advantages_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SHOP PRODUCT PACKAGES TABLE - Product packages/pricing
-- ========================================
CREATE TABLE IF NOT EXISTS shop_product_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    package_key ENUM('basic', 'standard', 'premium') NOT NULL,
    badge VARCHAR(100) NOT NULL,
    description TEXT,
    features JSON, -- Array of features
    default_words INT DEFAULT 0,
    base_price DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE,
    INDEX idx_product_packages_product_id (product_id),
    INDEX idx_product_packages_key (package_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SHOP ORDERS TABLE - Customer orders
-- ========================================
CREATE TABLE IF NOT EXISTS shop_orders (
    id VARCHAR(50) PRIMARY KEY, -- ORDER-YYYYMMDD-XXXX format
    product_id INT NOT NULL,
    user_id VARCHAR(255),
    package_id INT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    status ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    delivery_address TEXT,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES shop_products(id),
    FOREIGN KEY (package_id) REFERENCES shop_product_packages(id),
    INDEX idx_shop_orders_product_id (product_id),
    INDEX idx_shop_orders_user_id (user_id),
    INDEX idx_shop_orders_status (status),
    INDEX idx_shop_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SHOP ORDER PAYMENTS TABLE - Payment details for orders
-- ========================================
CREATE TABLE IF NOT EXISTS shop_order_payments (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    payment_method ENUM('credit_card', 'bank_transfer', 'ewallet', 'virtual_account', 'paypal') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled', 'expired') NOT NULL DEFAULT 'pending',
    gateway_response JSON, -- Payment gateway response
    payment_url VARCHAR(500), -- For redirect payments
    paid_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES shop_orders(id) ON DELETE CASCADE,
    INDEX idx_order_payments_order_id (order_id),
    INDEX idx_order_payments_status (status),
    INDEX idx_order_payments_method (payment_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SAMPLE DATA FOR SHOP PRODUCTS
-- ========================================

-- Insert sample products
INSERT IGNORE INTO shop_products (id, title, description, image_src, price, delivery_time, service_category, status) VALUES
(1, 'I will be SEO content writer for article writing or blog writing', 'Professional SEO content writing service with 7 years of experience. MBA degree holder specializing in creating content that drives results.', '/bg-shopCards.jpg', 20.00, '2 Days Delivery', 'SEO Content', 'active'),
(2, 'I will write human SEO blogs and articles', 'Human-written SEO blogs and articles that rank well and engage readers. No AI content, just authentic writing.', '/bg-shopCards.jpg', 100.00, '3 Days Delivery', 'Blog Writing', 'active'),
(3, 'I will write SEO blog posts and articles as your content writer', 'Expert SEO blog posts and articles with keyword research and optimization. Perfect for content marketing.', '/bg-shopCards.jpg', 100.00, '7 Days Delivery', 'Product Description', 'inactive');

-- Insert product details
INSERT IGNORE INTO shop_product_details (product_id, full_text) VALUES
(1, 'Hello, I''m Rizqi, a professional SEO content writer with 7 years of industry experience. I hold an MBA degree and specialize in creating content that not only informs but drives results.');

-- Insert product advantages
INSERT IGNORE INTO shop_product_advantages (product_id, title, subtitle) VALUES
(1, 'Highly Responsive', 'Known for exceptionally quick replies'),
(1, 'SEO Optimized', 'Content crafted to rank better on search engines');

-- Insert product packages
INSERT IGNORE INTO shop_product_packages (product_id, package_key, badge, description, features, default_words, base_price) VALUES
(1, 'basic', 'Starter', 'Short-form SEO content for quick tasks and smaller projects.', '["1 Article", "SEO-optimized title", "Proofreading"]', 500, 20.00),
(1, 'standard', 'Advance', 'SEO-Friendly Website Content, Blog Posts, Web Pages, Product Descriptions & More.', '["1 Article", "Plagiarism check", "References & citations", "Include keyword research"]', 1000, 20.00),
(1, 'premium', 'Premium Plus', 'Long-form content package with advanced research and multiple revisions.', '["2 Long-form articles", "In-depth keyword research", "SEO content strategy outline", "2 rounds of revisions"]', 1500, 20.00);

-- ========================================
-- VIEWS FOR ADMIN PANEL
-- ========================================

-- Shop products with details view
CREATE OR REPLACE VIEW shop_products_complete AS
SELECT 
    p.*,
    GROUP_CONCAT(DISTINCT pd.full_text SEPARATOR '\n') as details,
    GROUP_CONCAT(DISTINCT CONCAT(pa.title, ': ', pa.subtitle) SEPARATOR '\n') as advantages,
    COUNT(DISTINCT pkg.id) as package_count,
    MIN(pkg.base_price) as min_price,
    MAX(pkg.base_price) as max_price
FROM shop_products p
LEFT JOIN shop_product_details pd ON p.id = pd.product_id
LEFT JOIN shop_product_advantages pa ON p.id = pa.product_id
LEFT JOIN shop_product_packages pkg ON p.id = pkg.product_id
GROUP BY p.id;

-- Shop orders with product and payment info
CREATE OR REPLACE VIEW shop_orders_complete AS
SELECT 
    o.*,
    p.title as product_title,
    p.service_category,
    pkg.badge as package_badge,
    pkg.description as package_description,
    pay.payment_method,
    pay.status as payment_status,
    pay.paid_at
FROM shop_orders o
LEFT JOIN shop_products p ON o.product_id = p.id
LEFT JOIN shop_product_packages pkg ON o.package_id = pkg.id
LEFT JOIN shop_order_payments pay ON o.id = pay.order_id;

-- Shop statistics view
CREATE OR REPLACE VIEW shop_statistics AS
SELECT 
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_products,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as completed_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders,
    SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END) as total_revenue,
    AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END) as average_order_value,
    MAX(o.created_at) as last_order_date
FROM shop_products p
LEFT JOIN shop_orders o ON p.id = o.product_id;

-- ========================================
-- STORED PROCEDURES FOR SHOP OPERATIONS
-- ========================================

-- Procedure to get all products with filters
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetShopProducts(
    IN status_filter VARCHAR(20),
    IN category_filter VARCHAR(100),
    IN search_term VARCHAR(500),
    IN page_param INT,
    IN limit_param INT
)
BEGIN
    DECLARE offset_param INT;
    SET offset_param = (page_param - 1) * limit_param;
    
    SELECT 
        p.*,
        COUNT(DISTINCT pkg.id) as package_count,
        MIN(pkg.base_price) as min_price
    FROM shop_products p
    LEFT JOIN shop_product_packages pkg ON p.id = pkg.product_id
    WHERE (status_filter IS NULL OR p.status = status_filter)
    AND (category_filter IS NULL OR p.service_category = category_filter)
    AND (search_term IS NULL OR 
         p.title LIKE CONCAT('%', search_term, '%') OR
         p.description LIKE CONCAT('%', search_term, '%') OR
         p.service_category LIKE CONCAT('%', search_term, '%')
    )
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT limit_param OFFSET offset_param;
END//
DELIMITER ;

-- Procedure to create shop order
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS CreateShopOrder(
    IN product_id_param INT,
    IN user_id_param VARCHAR(255),
    IN package_id_param INT,
    IN quantity_param INT,
    IN customer_name_param VARCHAR(255),
    IN customer_email_param VARCHAR(255),
    IN customer_phone_param VARCHAR(50)
)
BEGIN
    DECLARE order_id VARCHAR(50);
    DECLARE unit_price_val DECIMAL(10,2);
    DECLARE service_fee_val DECIMAL(10,2);
    DECLARE total_amount_val DECIMAL(10,2);
    
    -- Get unit price
    IF package_id_param IS NOT NULL THEN
        SELECT base_price INTO unit_price_val 
        FROM shop_product_packages 
        WHERE id = package_id_param;
    ELSE
        SELECT price INTO unit_price_val 
        FROM shop_products 
        WHERE id = product_id_param;
    END IF;
    
    -- Calculate service fee (15% or minimum 3.25)
    SET service_fee_val = GREATEST(3.25, unit_price_val * quantity_param * 0.15);
    SET total_amount_val = (unit_price_val * quantity_param) + service_fee_val;
    
    -- Generate order ID
    SET order_id = CONCAT('ORDER-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 10000), 4, '0'));
    
    -- Insert order
    INSERT INTO shop_orders (
        id, product_id, user_id, package_id, quantity, 
        unit_price, service_fee, total_amount, 
        customer_name, customer_email, customer_phone
    ) VALUES (
        order_id, product_id_param, user_id_param, package_id_param, quantity_param,
        unit_price_val, service_fee_val, total_amount_val,
        customer_name_param, customer_email_param, customer_phone_param
    );
    
    -- Return order details
    SELECT * FROM shop_orders WHERE id = order_id;
END//
DELIMITER ;

-- Procedure to update product status
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS UpdateProductStatus(
    IN product_id_param INT,
    IN new_status VARCHAR(20),
    IN admin_user_id VARCHAR(255)
)
BEGIN
    DECLARE old_status VARCHAR(20);
    
    -- Get current status
    SELECT status INTO old_status FROM shop_products WHERE id = product_id_param;
    
    -- Update status
    UPDATE shop_products 
    SET status = new_status, updated_at = NOW()
    WHERE id = product_id_param;
    
    -- Log the change (you could create a logs table)
    SELECT CONCAT('Product ', product_id_param, ' status changed from ', old_status, ' to ', new_status, ' by ', admin_user_id) as log_message;
END//
DELIMITER ;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

SELECT 'TRAVELLO SHOP DATABASE SETUP COMPLETED' as status,
       'Database and tables created for shop management' as description,
       'Ready for admin shop panel integration' as next_step,
       NOW() as completion_time;
