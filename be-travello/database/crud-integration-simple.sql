-- ========================================
-- CRUD INTEGRATION SQL - SIMPLE VERSION
-- For Landing Pages and Portfolios
-- Compatible with MySQL Database
-- ========================================

-- Use the database
USE travello_db;

-- ========================================
-- LANDING PAGES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS landing_pages (
    id VARCHAR(255) PRIMARY KEY,
    section ENUM('hero', 'about', 'services', 'portfolio', 'testimonials', 'contact', 'footer') NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    content TEXT,
    image_url TEXT,
    button_text VARCHAR(255),
    button_link VARCHAR(255),
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_landing_pages_section (section),
    INDEX idx_landing_pages_order (order_index),
    INDEX idx_landing_pages_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- PORTFOLIOS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS portfolios (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('web', 'mobile', 'design', 'photography', 'video', 'other') NOT NULL DEFAULT 'web',
    image_url TEXT,
    thumbnail_url TEXT,
    project_url VARCHAR(255),
    github_url VARCHAR(255),
    technologies TEXT,
    tags TEXT,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    order_index INT NOT NULL DEFAULT 0,
    client_name VARCHAR(255),
    completion_date DATE,
    created_by VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_portfolios_category (category),
    INDEX idx_portfolios_featured (featured),
    INDEX idx_portfolios_published (published),
    INDEX idx_portfolios_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SAMPLE DATA FOR TESTING
-- ========================================

-- Sample landing pages
INSERT IGNORE INTO landing_pages (
    id, section, title, subtitle, content, image_url, button_text, button_link, order_index, is_active, created_by
) VALUES 
('landing-001', 'hero', 'Welcome to Travello', 'Your Ultimate Travel Companion', 'Discover amazing destinations, plan your perfect trip, and create unforgettable memories with our comprehensive travel platform.', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', 'Get Started', '#features', 0, TRUE, 'admin-001'),
('landing-002', 'about', 'About Travello', 'Making Travel Simple Since 2024', 'We are passionate about making travel accessible, enjoyable, and memorable for everyone. Our platform combines cutting-edge technology with local expertise to provide you with the best travel experience.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'Learn More', '#about', 0, TRUE, 'admin-001'),
('landing-003', 'services', 'Our Services', 'Everything You Need for Your Journey', 'From flight booking to hotel reservations, tour guides to travel insurance, we offer comprehensive services to make your travel planning seamless and stress-free.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'View Services', '#services', 0, TRUE, 'admin-001'),
('landing-004', 'portfolio', 'Success Stories', 'Real Experiences from Real Travelers', 'Explore our portfolio of successful travel experiences, customer testimonials, and destination highlights that showcase the magic of travel.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'View Portfolio', '#portfolio', 0, TRUE, 'admin-001'),
('landing-005', 'testimonials', 'What Our Travelers Say', 'Real Reviews from Real People', 'Join thousands of satisfied travelers who have discovered amazing destinations and created unforgettable memories with Travello.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'Read Reviews', '#testimonials', 0, TRUE, 'admin-001'),
('landing-006', 'contact', 'Get in Touch', 'We Are Here to Help', 'Have questions about your travel plans? Need assistance with bookings? Our team is ready to help you make your travel dreams come true.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'Contact Us', '#contact', 0, TRUE, 'admin-001'),
('landing-007', 'footer', 'Travello', 'Your Journey Starts Here', 'Connect with us on social media, subscribe to our newsletter, and join our community of passionate travelers.', NULL, NULL, NULL, 0, TRUE, 'admin-001');

-- Sample portfolios
INSERT IGNORE INTO portfolios (
    id, title, description, category, image_url, project_url, github_url, technologies, tags, featured, published, order_index, client_name, completion_date, created_by
) VALUES 
('portfolio-001', 'Travello Web Platform', 'A comprehensive travel booking and planning platform with real-time availability, secure payments, and personalized recommendations.', 'web', 'https://images.unsplash.com/photo-1467232004589-a923b39f4f04?w=800', 'https://travello-demo.com', 'https://github.com/travello/platform', 'React, Node.js, MongoDB, Express, Stripe', 'web, booking, travel, ecommerce', TRUE, TRUE, 0, 'Travello Inc.', '2024-01-15', 'admin-001'),
('portfolio-002', 'Mobile Travel Companion', 'iOS and Android apps for on-the-go travel planning with offline maps, real-time updates, and local guides.', 'mobile', 'https://images.unsplash.com/photo-1512314887859-39d3685e236f?w=800', 'https://apps.apple.com/travello', 'https://github.com/travello/mobile', 'React Native, Firebase, Redux, Maps API', 'mobile, ios, android, maps', TRUE, TRUE, 1, 'Travello Inc.', '2024-02-20', 'admin-001'),
('portfolio-003', 'Brand Identity Design', 'Complete brand redesign for Travello including logo, color palette, typography, and marketing materials.', 'design', 'https://images.unsplash.com/photo-1559027865-c7783ecf9d7b?w=800', 'https://behance.net/travello-brand', NULL, 'Figma, Adobe Illustrator, Photoshop, After Effects', 'branding, design, identity, ui', FALSE, TRUE, 2, 'Travello Inc.', '2024-03-10', 'admin-001'),
('portfolio-004', 'Travel Photography Collection', 'Professional photography services for destinations worldwide, featuring landscapes, portraits, and cultural experiences.', 'photography', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'https://travello-photography.com', NULL, 'Canon EOS, Lightroom, Photoshop, Drone', 'photography, landscape, portrait, travel', TRUE, TRUE, 3, 'Various Clients', '2024-01-05', 'admin-001'),
('portfolio-005', 'Travel Video Productions', 'Cinematic travel videos and promotional content for tourism boards and travel companies.', 'video', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', 'https://vimeo.com/travello-videos', NULL, 'Premiere Pro, After Effects, DaVinci Resolve, Drone', 'video, cinematic, promotion, tourism', FALSE, TRUE, 4, 'Tourism Board', '2024-02-15', 'admin-001'),
('portfolio-006', 'Custom Travel CRM', 'Internal customer relationship management system for travel agencies with client tracking, booking management, and analytics.', 'other', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', NULL, 'https://github.com/travello/crm', 'Python, Django, PostgreSQL, Docker', 'crm, internal, analytics, management', FALSE, FALSE, 5, 'Travel Agency X', '2024-03-25', 'admin-001');

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

SELECT 'CRUD INTEGRATION SQL COMPLETED' as status,
       'Landing pages and portfolios tables created with sample data' as description,
       NOW() as completion_time;
