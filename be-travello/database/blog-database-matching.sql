-- Blog Database Schema Matching Frontend Blog Page Structure
-- Based on blogPosts.ts structure

-- Create database
CREATE DATABASE IF NOT EXISTS travello_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE travello_blog;

-- Blog Articles Table (matching BlogPost interface)
CREATE TABLE IF NOT EXISTS blog_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT DEFAULT NULL,  -- Added to match BlogPost.description
    imageSrc VARCHAR(500) DEFAULT NULL,  -- Changed from 'cover' to 'imageSrc' to match BlogPost
    category VARCHAR(100) DEFAULT 'Uncategorized',
    author VARCHAR(100) DEFAULT 'Admin',  -- Added to match BlogPost.author
    date VARCHAR(50) DEFAULT NULL,  -- Added to match BlogPost.date
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

-- Blog Authors Table
CREATE TABLE IF NOT EXISTS blog_authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT DEFAULT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT DEFAULT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data matching the frontend blogPosts.ts
INSERT INTO blog_authors (name, email, bio) VALUES 
('Admin Travello', 'admin@travello.com', 'Travel blogger and content creator'),
('Rizqi Maulana', 'rizqi@travello.com', 'Travel enthusiast and photographer');

INSERT INTO blog_categories (name, slug, description, color) VALUES 
('Travel', 'travel', 'Travel guides and destination reviews', '#3b82f6'),
('Tips', 'tips', 'Travel tips and advice', '#10b981'),
('Story', 'story', 'Personal travel stories', '#f59e0b'),
('Food', 'food', 'Food and culinary experiences', '#ef4444'),
('Lifestyle', 'lifestyle', 'Lifestyle and wellness', '#8b5cf6');

-- Insert sample articles matching blogPosts.ts data
INSERT INTO blog_articles (title, slug, description, imageSrc, category, author, date, content, status, author_id, published_at) VALUES 
(
    'Hidden Gems in Bali You Should Visit',
    'hidden-gems-in-bali-you-should-visit',
    'Discover lesser-known spots in Bali that are perfect for recharging, photography, and authentic local experiences.',
    '/blog-image.jpeg',
    'Travel',
    'Rizqi Maulana',
    'Jan 29, 2026',
    '<h2>Discover Bali''s Hidden Treasures</h2><p>Bali is famous for its beaches and vibrant nightlife, but the island also hides quiet corners that feel untouched. If you want a more relaxed itinerary, try balancing popular attractions with places that locals love.</p><h3>1. Sekumpul Waterfall</h3><p>Located in northern Bali, this stunning waterfall offers crystal-clear waters and lush surroundings. Perfect for swimming and photography.</p><h3>2. Tegallalang Rice Terraces</h3><p>While many tourists visit the rice terraces, few explore the hidden paths that lead to authentic local villages nearby.</p><h3>3. Nusa Penida</h3><p>This island paradise offers dramatic cliffs, pristine beaches, and incredible snorkeling spots that remain relatively uncrowded.</p>',
    'publish',
    2,
    NOW()
),
(
    'Tips Menyiapkan Liburan ke Bali',
    'tips-menyiapkan-liburan-ke-bali',
    'Konten artikel contoh tentang liburan ke Bali.',
    '/placeholder-image.png',
    'Travel Tips',
    'Admin',
    'Jan 28, 2026',
    '<h2>Planning Your Perfect Bali Trip</h2><p>Konten artikel contoh tentang liburan ke Bali. Berikut adalah tips-tips penting untuk persiapan liburan Anda:</p><ul><li>Pilih waktu yang tepat untuk berkunjung</li><li>Siapkan dokumen perjalanan</li><li>Booking akomodasi dan transportasi</li><li>Packing yang efisien</li><li>Asuransi perjalanan</li></ul>',
    'publish',
    1,
    NOW()
),
(
    'Coffee Guide: Finding the Best Local Cafes',
    'coffee-guide-finding-best-local-cafes',
    'Tips for choosing great local cafes for working, hanging out, and exploring regional coffee flavors.',
    '/blog-image.jpeg',
    'Food',
    'Rizqi Maulana',
    'Jan 23, 2026',
    '<h2>Finding Your Perfect Cafe</h2><p>A great cafe isn''t only about coffee—it''s about comfort, service, and atmosphere. Start by checking their menu focus: espresso-based, manual brew, or signature drinks.</p><h3>For Working</h3><p>For working, prioritize seating, power outlets, and stable internet.</p><h3>For Hanging Out</h3><p>For hanging out, look for comfortable spaces and music volume.</p>',
    'publish',
    2,
    NOW()
),
(
    'Packing Smart: Essential Travel Items',
    'packing-smart-essential-travel-items',
    'Smart packing tips for travelers who want to travel light but prepared.',
    '/blog-image2.jpeg',
    'Tips',
    'Admin',
    'Jan 22, 2026',
    '<h2>Travel Smart, Pack Light</h2><p>Packing for a trip doesn''t have to be stressful. With the right approach, you can pack everything you need without overpacking.</p><h3>Essential Items</h3><ul><li>Universal power adapter</li><li>First-aid kit</li><li>Portable charger</li><li>Travel documents organizer</li></ul>',
    'publish',
    1,
    NOW()
),
(
    'Healthy Habits While Traveling',
    'healthy-habits-while-traveling',
    'Healthy habits while traveling: sleep, hydration, walking, and balanced meals.',
    '/blog-image2.jpeg',
    'Lifestyle',
    'Rizqi Maulana',
    'Jan 21, 2026',
    '<h2>Stay Healthy on the Road</h2><p>Travel routines can be unpredictable, but your health doesn''t have to be. Small habits make a big difference.</p><h3>Key Habits</h3><ul><li>Drink water regularly</li><li>Walk as much as possible</li><li>Balance your meals</li><li>Get enough sleep</li></ul>',
    'publish',
    2,
    NOW()
),
(
    'Photography Tips for Travelers',
    'photography-tips-for-travelers',
    'Capture your travel memories like a pro with these photography tips.',
    '/blog-image.jpeg',
    'Travel',
    'Admin',
    'Jan 20, 2026',
    '<h2>Travel Photography Essentials</h2><p>Great travel photos don''t require expensive equipment. Just know the basics and practice regularly.</p><h3>Tips for Better Photos</h3><ul><li>Golden hour lighting</li><li>Rule of thirds</li><li>Local culture respect</li><li>Backup your photos</li></ul>',
    'publish',
    1,
    NOW()
),
(
    'Budget Travel: How to Save Money',
    'budget-travel-how-to-save-money',
    'Travel on a budget without sacrificing experiences with these money-saving tips.',
    '/blog-image2.jpeg',
    'Tips',
    'Rizqi Maulana',
    'Jan 19, 2026',
    '<h2>Travel More, Spend Less</h2><p>Budget travel doesn''t mean missing out. It means being smarter with your money.</p><h3>Money-Saving Tips</h3><ul><li>Travel off-season</li><li>Use public transport</li><li>Eat like a local</li><li>Free walking tours</li></ul>',
    'publish',
    2,
    NOW()
),
(
    'Local Food Adventures: What to Try',
    'local-food-adventures-what-to-try',
    'Discover authentic local cuisine and food experiences around the world.',
    '/blog-image.jpeg',
    'Food',
    'Admin',
    'Jan 18, 2026',
    <h2>Taste the Local Culture</h2><p>Food is one of the best ways to experience local culture. Be adventurous and try everything!</p><h3>Food Adventures</h3><ul><li>Street food markets</li><li>Local cooking classes</li><li>Food festivals</li><li>Home dining experiences</li></ul>',
    'publish',
    1,
    NOW()
);

-- Create view for frontend compatibility
CREATE VIEW frontend_blog_posts AS
SELECT 
    id,
    title,
    description,
    imageSrc,
    category,
    author,
    date,
    content,
    status,
    view_count,
    published_at,
    created_at
FROM blog_articles 
WHERE status = 'publish'
ORDER BY published_at DESC;

-- Create triggers for automatic slug and description generation
DELIMITER //
CREATE TRIGGER before_article_insert
BEFORE INSERT ON blog_articles
FOR EACH ROW
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.title, ' ', '-'), '.', ''), '--', '-'));
    END IF;
    
    IF NEW.description IS NULL OR NEW.description = '' THEN
        SET NEW.description = LEFT(REPLACE(REPLACE(NEW.content, '<[^>]*>', ' '), '&nbsp;', ' '), 150);
    END IF;
    
    IF NEW.date IS NULL OR NEW.date = '' THEN
        SET NEW.date = DATE_FORMAT(NEW.created_at, '%M %e, %Y');
    END IF;
END //

CREATE TRIGGER before_article_update
BEFORE UPDATE ON blog_articles
FOR EACH ROW
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.title, ' ', '-'), '.', ''), '--', '-'));
    END IF;
    
    IF NEW.description IS NULL OR NEW.description = '' THEN
        SET NEW.description = LEFT(REPLACE(REPLACE(NEW.content, '<[^>]*>', ' '), '&nbsp;', ' '), 150);
    END IF;
    
    IF NEW.date IS NULL OR NEW.date = '' THEN
        SET NEW.date = DATE_FORMAT(NEW.created_at, '%M %e, %Y');
    END IF;
END //
DELIMITER ;

-- Success message
SELECT '✅ Blog database created matching frontend structure!' as message;
SELECT '📊 Tables created: blog_articles, blog_authors, blog_categories' as tables;
SELECT '📝 Sample articles inserted: 8 articles' as sample_data;
SELECT '🔗 Compatible with BlogPost interface' as compatibility;
SELECT '🚀 Ready for blog CRUD operations!' as status;
