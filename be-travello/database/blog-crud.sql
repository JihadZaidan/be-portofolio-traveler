-- Blog Articles CRUD for PHPMyAdmin
-- Create database and tables for blog management

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS travello_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE travello_blog;

-- Blog Articles Table
CREATE TABLE IF NOT EXISTS blog_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    cover VARCHAR(500) DEFAULT NULL,
    category VARCHAR(100) DEFAULT 'Uncategorized',
    content LONGTEXT DEFAULT NULL,
    status ENUM('publish', 'draft') DEFAULT 'draft',
    author_id INT DEFAULT NULL,
    excerpt TEXT DEFAULT NULL,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL DEFAULT NULL,
    
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_published_at (published_at),
    INDEX idx_created_at (created_at)
);

-- Blog Authors Table (Optional - for multiple authors)
CREATE TABLE IF NOT EXISTS blog_authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT DEFAULT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    social_links JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Blog Categories Table (Optional - for categorized management)
CREATE TABLE IF NOT EXISTS blog_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT DEFAULT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog Tags Table (Optional - for tagging system)
CREATE TABLE IF NOT EXISTS blog_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Article Tags Junction Table
CREATE TABLE IF NOT EXISTS article_tags (
    article_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES blog_articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO blog_authors (name, email, bio) VALUES 
('Admin Travello', 'admin@travello.com', 'Travel blogger and content creator'),
('Rizqi Maulana', 'rizqi@travello.com', 'Travel enthusiast and photographer');

INSERT INTO blog_categories (name, slug, description, color) VALUES 
('Travel', 'travel', 'Travel guides and destination reviews', '#3b82f6'),
('Tips', 'tips', 'Travel tips and advice', '#10b981'),
('Story', 'story', 'Personal travel stories', '#f59e0b'),
('Food', 'food', 'Food and culinary experiences', '#ef4444'),
('Lifestyle', 'lifestyle', 'Lifestyle and wellness', '#8b5cf6');

INSERT INTO blog_tags (name, slug) VALUES 
('Bali', 'bali'),
('Indonesia', 'indonesia'),
('Southeast Asia', 'southeast-asia'),
('Budget Travel', 'budget-travel'),
('Luxury Travel', 'luxury-travel'),
('Adventure', 'adventure'),
('Culture', 'culture'),
('Photography', 'photography');

-- Insert sample blog articles
INSERT INTO blog_articles (title, slug, cover, category, content, status, author_id, excerpt, published_at) VALUES 
(
    'Hidden Gems in Bali You Should Visit',
    'hidden-gems-in-bali-you-should-visit',
    '/blog-image.jpeg',
    'Travel',
    '<h2>Discover Bali''s Hidden Treasures</h2><p>Bali is famous for its beaches and vibrant nightlife, but the island also hides quiet corners that feel untouched. If you want a more relaxed itinerary, try balancing popular attractions with places that locals love.</p><h3>1. Sekumpul Waterfall</h3><p>Located in northern Bali, this stunning waterfall offers crystal-clear waters and lush surroundings. Perfect for swimming and photography.</p><h3>2. Tegallalang Rice Terraces</h3><p>While many tourists visit the rice terraces, few explore the hidden paths that lead to authentic local villages nearby.</p><h3>3. Nusa Penida</h3><p>This island paradise offers dramatic cliffs, pristine beaches, and incredible snorkeling spots that remain relatively uncrowded.</p>',
    'publish',
    1,
    'Discover lesser-known spots in Bali that are perfect for recharging, photography, and authentic local experiences.',
    NOW()
),
(
    'Tips Menyiapkan Liburan ke Bali',
    'tips-menyiapkan-liburan-ke-bali',
    '/placeholder-image.png',
    'Tips',
    '<h2>Planning Your Perfect Bali Trip</h2><p>Konten artikel contoh tentang liburan ke Bali. Berikut adalah tips-tips penting untuk persiapan liburan Anda:</p><ul><li>Pilih waktu yang tepat untuk berkunjung</li><li>Siapkan dokumen perjalanan</li><li>Booking akomodasi dan transportasi</li><li>Packing yang efisien</li><li>Asuransi perjalanan</li></ul>',
    'publish',
    2,
    'Panduan lengkap untuk merencanakan liburan yang sempurna ke Bali.',
    NOW()
),
(
    'Coffee Guide: Finding the Best Local Cafes',
    'coffee-guide-finding-best-local-cafes',
    '/blog-image.jpeg',
    'Food',
    '<h2>Finding Your Perfect Cafe</h2><p>A great cafe isn''t only about coffee—it''s about comfort, service, and atmosphere. Start by checking their menu focus: espresso-based, manual brew, or signature drinks.</p><h3>For Working</h3><p>For working, prioritize seating, power outlets, and stable internet.</p><h3>For Hanging Out</h3><p>For hanging out, look for comfortable spaces and music volume.</p>',
    'publish',
    1,
    'Tips for choosing great local cafes for working, hanging out, and exploring regional coffee flavors.',
    NOW()
);

-- Create stored procedures for CRUD operations
DELIMITER //

-- Create Article
CREATE PROCEDURE CreateArticle(
    IN p_title VARCHAR(255),
    IN p_slug VARCHAR(255),
    IN p_cover VARCHAR(500),
    IN p_category VARCHAR(100),
    IN p_content LONGTEXT,
    IN p_status ENUM('publish', 'draft'),
    IN p_author_id INT,
    IN p_excerpt TEXT,
    IN p_meta_title VARCHAR(255),
    IN p_meta_description TEXT
)
BEGIN
    INSERT INTO blog_articles (
        title, slug, cover, category, content, status, 
        author_id, excerpt, meta_title, meta_description,
        published_at
    ) VALUES (
        p_title, p_slug, p_cover, p_category, p_content, p_status,
        p_author_id, p_excerpt, p_meta_title, p_meta_description,
        CASE WHEN p_status = 'publish' THEN NOW() ELSE NULL END
    );
    
    SELECT LAST_INSERT_ID() as article_id;
END //

-- Update Article
CREATE PROCEDURE UpdateArticle(
    IN p_id INT,
    IN p_title VARCHAR(255),
    IN p_slug VARCHAR(255),
    IN p_cover VARCHAR(500),
    IN p_category VARCHAR(100),
    IN p_content LONGTEXT,
    IN p_status ENUM('publish', 'draft'),
    IN p_author_id INT,
    IN p_excerpt TEXT,
    IN p_meta_title VARCHAR(255),
    IN p_meta_description TEXT
)
BEGIN
    UPDATE blog_articles SET
        title = p_title,
        slug = p_slug,
        cover = p_cover,
        category = p_category,
        content = p_content,
        status = p_status,
        author_id = p_author_id,
        excerpt = p_excerpt,
        meta_title = p_meta_title,
        meta_description = p_meta_description,
        published_at = CASE 
            WHEN p_status = 'publish' AND published_at IS NULL THEN NOW()
            WHEN p_status = 'draft' THEN NULL
            ELSE published_at
        END,
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END //

-- Delete Article
CREATE PROCEDURE DeleteArticle(IN p_id INT)
BEGIN
    DELETE FROM blog_articles WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END //

-- Get All Articles
CREATE PROCEDURE GetAllArticles(IN p_status VARCHAR(20))
BEGIN
    SELECT 
        id, title, slug, cover, category, status, 
        author_id, excerpt, view_count, 
        created_at, updated_at, published_at
    FROM blog_articles 
    WHERE (p_status IS NULL OR status = p_status)
    ORDER BY created_at DESC;
END //

-- Get Article by ID
CREATE PROCEDURE GetArticleById(IN p_id INT)
BEGIN
    SELECT 
        a.*, 
        au.name as author_name,
        au.email as author_email
    FROM blog_articles a
    LEFT JOIN blog_authors au ON a.author_id = au.id
    WHERE a.id = p_id;
END //

-- Get Published Articles for Frontend
CREATE PROCEDURE GetPublishedArticles()
BEGIN
    SELECT 
        id, title, slug, cover, category, excerpt, 
        view_count, created_at, published_at
    FROM blog_articles 
    WHERE status = 'publish'
    ORDER BY published_at DESC;
END //

DELIMITER ;

-- Create views for easy access
CREATE VIEW published_articles AS
SELECT 
    id, title, slug, cover, category, excerpt, 
    view_count, created_at, published_at
FROM blog_articles 
WHERE status = 'publish'
ORDER BY published_at DESC;

CREATE VIEW article_stats AS
SELECT 
    COUNT(*) as total_articles,
    COUNT(CASE WHEN status = 'publish' THEN 1 END) as published_articles,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_articles,
    SUM(view_count) as total_views
FROM blog_articles;

-- Create triggers for automatic slug generation
DELIMITER //
CREATE TRIGGER before_article_insert
BEFORE INSERT ON blog_articles
FOR EACH ROW
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.title, ' ', '-'), '.', ''), '--', '-'));
    END IF;
END //

CREATE TRIGGER before_article_update
BEFORE UPDATE ON blog_articles
FOR EACH ROW
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.title, ' ', '-'), '.', ''), '--', '-'));
    END IF;
END //
DELIMITER ;

-- Grant permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON travello_blog.* TO 'travello_user'@'localhost' IDENTIFIED BY 'your_password';
-- FLUSH PRIVILEGES;

-- Instructions for PHPMyAdmin:
-- 1. Import this SQL file in PHPMyAdmin
-- 2. Use the stored procedures for CRUD operations
-- 3. The views provide easy access to published articles
-- 4. Triggers automatically generate slugs from titles
