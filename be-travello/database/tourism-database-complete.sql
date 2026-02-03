-- Comprehensive Tourism Database Schema for AI Chatbot
-- Designed for phpMyAdmin - Complete Indonesian Tourism Data

-- ============================================
-- 1. DESTINATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS destinations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('beach', 'mountain', 'cultural', 'city', 'nature', 'religious', 'adventure') NOT NULL,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    image_url VARCHAR(500),
    ticket_price_adult DECIMAL(10, 2),
    ticket_price_child DECIMAL(10, 2),
    opening_hours JSON,
    best_visit_time VARCHAR(100),
    difficulty_level ENUM('easy', 'moderate', 'hard') DEFAULT 'easy',
    estimated_duration VARCHAR(50),
    facilities JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_province (province),
    INDEX idx_category (category),
    INDEX idx_rating (rating),
    INDEX idx_location (latitude, longitude),
    FULLTEXT idx_search (name, description, city)
);

-- ============================================
-- 2. ACCOMMODATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS accommodations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('hotel', 'resort', 'villa', 'hostel', 'guesthouse', 'apartment', 'homestay') NOT NULL,
    star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5),
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    image_url VARCHAR(500),
    price_per_night DECIMAL(10, 2),
    facilities JSON,
    room_types JSON,
    check_in_time TIME DEFAULT '14:00:00',
    check_out_time TIME DEFAULT '12:00:00',
    breakfast_included BOOLEAN DEFAULT FALSE,
    free_wifi BOOLEAN DEFAULT TRUE,
    parking BOOLEAN DEFAULT FALSE,
    pool BOOLEAN DEFAULT FALSE,
    fitness_center BOOLEAN DEFAULT FALSE,
    spa BOOLEAN DEFAULT FALSE,
    restaurant BOOLEAN DEFAULT FALSE,
    pet_friendly BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_province (province),
    INDEX idx_type (type),
    INDEX idx_star_rating (star_rating),
    INDEX idx_price (price_per_night),
    INDEX idx_rating (rating),
    FULLTEXT idx_search (name, description, city)
);

-- ============================================
-- 3. RESTAURANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS restaurants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(100) NOT NULL,
    specialty_dish VARCHAR(255),
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT DEFAULT 0,
    image_url VARCHAR(500),
    price_range ENUM('budget', 'moderate', 'expensive', 'luxury') NOT NULL,
    average_price DECIMAL(10, 2),
    opening_hours JSON,
    facilities JSON,
    halal_certified BOOLEAN DEFAULT TRUE,
    delivery_available BOOLEAN DEFAULT FALSE,
    reservation_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_province (province),
    INDEX idx_cuisine (cuisine_type),
    INDEX idx_price_range (price_range),
    INDEX idx_rating (rating),
    FULLTEXT idx_search (name, description, specialty_dish, city)
);

-- ============================================
-- 4. TRANSPORTATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transportation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type ENUM('flight', 'train', 'bus', 'ferry', 'car_rental', 'motorcycle_rental', 'taxi', 'online_transport') NOT NULL,
    company VARCHAR(255),
    route_from VARCHAR(255) NOT NULL,
    route_to VARCHAR(255) NOT NULL,
    province_from VARCHAR(100),
    province_to VARCHAR(100),
    duration VARCHAR(50),
    distance_km DECIMAL(8, 2),
    base_price DECIMAL(10, 2),
    price_per_km DECIMAL(8, 2),
    schedule JSON,
    facilities JSON,
    booking_url VARCHAR(500),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_route_from (route_from),
    INDEX idx_route_to (route_to),
    INDEX idx_price (base_price),
    FULLTEXT idx_search (name, company, route_from, route_to)
);

-- ============================================
-- 5. TOUR PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tour_packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_days INT NOT NULL,
    difficulty_level ENUM('easy', 'moderate', 'hard') DEFAULT 'easy',
    group_size_min INT DEFAULT 1,
    group_size_max INT DEFAULT 50,
    province VARCHAR(100) NOT NULL,
    destinations JSON, -- Array of destination IDs
    itinerary JSON, -- Day by day itinerary
    inclusions JSON, -- What's included
    exclusions JSON, -- What's not included
    price_per_person DECIMAL(10, 2),
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    image_url VARCHAR(500),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    best_season VARCHAR(50),
    age_restriction VARCHAR(50),
    fitness_requirement VARCHAR(255),
    guide_included BOOLEAN DEFAULT TRUE,
    transport_included BOOLEAN DEFAULT TRUE,
    accommodation_included BOOLEAN DEFAULT TRUE,
    meals_included BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_duration (duration_days),
    INDEX idx_difficulty (difficulty_level),
    INDEX idx_price (price_per_person),
    INDEX idx_province (province),
    FULLTEXT idx_search (name, description)
);

-- ============================================
-- 6. TRAVEL TIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS travel_tips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('budget', 'safety', 'culture', 'packing', 'health', 'transportation', 'accommodation', 'food') NOT NULL,
    target_audience ENUM('backpacker', 'family', 'couple', 'solo_traveler', 'senior', 'student', 'luxury') NOT NULL,
    province VARCHAR(100),
    season_relevance ENUM('all_year', 'summer', 'rainy', 'dry', 'winter') DEFAULT 'all_year',
    priority_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_audience (target_audience),
    INDEX idx_priority (priority_level),
    FULLTEXT idx_search (title, content)
);

-- ============================================
-- 7. WEATHER INFORMATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weather_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    month ENUM('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') NOT NULL,
    avg_temperature_celsius DECIMAL(5, 2),
    avg_humidity_percent DECIMAL(5, 2),
    rainfall_mm DECIMAL(6, 2),
    sunshine_hours DECIMAL(5, 2),
    weather_condition ENUM('sunny', 'cloudy', 'rainy', 'stormy', 'foggy') NOT NULL,
    travel_suitability ENUM('excellent', 'good', 'moderate', 'poor') NOT NULL,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_province_city_month (province, city, month),
    INDEX idx_province (province),
    INDEX idx_month (month),
    INDEX idx_suitability (travel_suitability)
);

-- ============================================
-- 8. EVENTS & FESTIVALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events_festivals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('cultural', 'religious', 'music', 'food', 'art', 'sport', 'nature') NOT NULL,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    venue VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_annual BOOLEAN DEFAULT TRUE,
    expected_attendees INT,
    ticket_price DECIMAL(10, 2),
    image_url VARCHAR(500),
    contact_info JSON,
    schedule JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_province (province),
    INDEX idx_type (type),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_annual (is_annual),
    FULLTEXT idx_search (name, description, city)
);

-- ============================================
-- 9. EMERGENCY CONTACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type ENUM('police', 'hospital', 'fire', 'tourism_police', 'embassy', 'rescue', 'hotline') NOT NULL,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_24_hours BOOLEAN DEFAULT TRUE,
    services_offered JSON,
    language_support JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_province (province),
    INDEX idx_type (type),
    INDEX idx_24_hours (is_24_hours),
    FULLTEXT idx_search (name, services_offered)
);

-- ============================================
-- 10. CHATBOT KNOWLEDGE BASE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_knowledge (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    keywords JSON,
    province VARCHAR(100),
    priority_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    usage_count INT DEFAULT 0,
    last_used TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_province (province),
    INDEX idx_priority (priority_level),
    INDEX idx_usage (usage_count),
    FULLTEXT idx_question (question),
    FULLTEXT idx_answer (answer),
    FULLTEXT idx_keywords (keywords)
);

-- ============================================
-- 11. USER PREFERENCES TABLE (for personalization)
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL, -- Reference to users table
    preferred_destinations JSON, -- Array of destination IDs
    preferred_accommodation_types JSON, -- Array of accommodation types
    budget_range_min DECIMAL(10, 2),
    budget_range_max DECIMAL(10, 2),
    travel_style ENUM('backpacker', 'mid_range', 'luxury', 'family', 'adventure', 'cultural', 'relaxation'),
    dietary_restrictions JSON,
    preferred_transportation JSON,
    favorite_cuisines JSON,
    travel_companions ENUM('solo', 'couple', 'family_with_kids', 'friends', 'group'),
    accessibility_needs JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_travel_style (travel_style)
);

-- ============================================
-- 12. SEARCH HISTORY TABLE (for analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS search_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    search_query TEXT NOT NULL,
    search_category VARCHAR(100),
    results_count INT DEFAULT 0,
    clicked_result_id INT,
    clicked_result_type VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_category (search_category),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search_query (search_query)
);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for popular destinations
CREATE VIEW popular_destinations AS
SELECT 
    d.*,
    COUNT(sc.id) as search_count
FROM destinations d
LEFT JOIN search_history sc ON sc.search_query LIKE CONCAT('%', d.name, '%')
WHERE d.is_active = TRUE AND d.rating >= 4.0
GROUP BY d.id
ORDER BY d.rating DESC, search_count DESC;

-- View for budget accommodations
CREATE VIEW budget_accommodations AS
SELECT 
    a.*,
    p.name as province_name
FROM accommodations a
JOIN provinces p ON a.province = p.name
WHERE a.is_active = TRUE 
  AND a.price_per_night <= 300000
  AND a.rating >= 3.5
ORDER BY a.price_per_night ASC, a.rating DESC;

-- View for recommended restaurants
CREATE VIEW recommended_restaurants AS
SELECT 
    r.*,
    p.name as province_name
FROM restaurants r
JOIN provinces p ON r.province = p.name
WHERE r.is_active = TRUE 
  AND r.rating >= 4.0
  AND r.review_count >= 50
ORDER BY r.rating DESC, r.review_count DESC;

-- ============================================
-- STORED PROCEDURES FOR CHATBOT
-- ============================================

DELIMITER //

-- Procedure to get destination recommendations
CREATE PROCEDURE GetDestinationRecommendations(
    IN p_province VARCHAR(100),
    IN p_category VARCHAR(50),
    IN p_budget DECIMAL(10, 2),
    IN p_limit INT
)
BEGIN
    SELECT 
        d.id,
        d.name,
        d.description,
        d.category,
        d.city,
        d.rating,
        d.ticket_price_adult,
        d.image_url,
        d.best_visit_time,
        d.estimated_duration,
        MATCH(d.name, d.description) AGAINST(p_province IN NATURAL LANGUAGE MODE) as relevance_score
    FROM destinations d
    WHERE d.is_active = TRUE
      AND (p_province IS NULL OR d.province = p_province)
      AND (p_category IS NULL OR d.category = p_category)
      AND (p_budget IS NULL OR d.ticket_price_adult <= p_budget)
    ORDER BY relevance_score DESC, d.rating DESC
    LIMIT p_limit;
END //

-- Procedure to search accommodations
CREATE PROCEDURE SearchAccommodations(
    IN p_province VARCHAR(100),
    IN p_type VARCHAR(50),
    IN p_budget_max DECIMAL(10, 2),
    IN p_rating_min DECIMAL(3, 2),
    IN p_limit INT
)
BEGIN
    SELECT 
        a.id,
        a.name,
        a.type,
        a.star_rating,
        a.city,
        a.rating,
        a.price_per_night,
        a.image_url,
        a.facilities,
        a.breakfast_included,
        a.free_wifi,
        a.pool,
        MATCH(a.name, a.description) AGAINST(p_province IN NATURAL LANGUAGE MODE) as relevance_score
    FROM accommodations a
    WHERE a.is_active = TRUE
      AND (p_province IS NULL OR a.province = p_province)
      AND (p_type IS NULL OR a.type = p_type)
      AND (p_budget_max IS NULL OR a.price_per_night <= p_budget_max)
      AND (p_rating_min IS NULL OR a.rating >= p_rating_min)
    ORDER BY relevance_score DESC, a.rating DESC, a.price_per_night ASC
    LIMIT p_limit;
END //

-- Procedure to get travel tips by category and audience
CREATE PROCEDURE GetTravelTips(
    IN p_category VARCHAR(50),
    IN p_audience VARCHAR(50),
    IN p_province VARCHAR(100),
    IN p_limit INT
)
BEGIN
    SELECT 
        t.id,
        t.title,
        t.content,
        t.category,
        t.target_audience,
        t.priority_level,
        MATCH(t.title, t.content) AGAINST(p_category IN NATURAL LANGUAGE MODE) as relevance_score
    FROM travel_tips t
    WHERE t.is_active = TRUE
      AND (p_category IS NULL OR t.category = p_category)
      AND (p_audience IS NULL OR t.target_audience = p_audience)
      AND (p_province IS NULL OR t.province = p_province)
    ORDER BY t.priority_level DESC, relevance_score DESC
    LIMIT p_limit;
END //

DELIMITER ;

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

DELIMITER //

-- Trigger to update search history analytics
CREATE TRIGGER update_search_analytics
    AFTER INSERT ON search_history
    FOR EACH ROW
BEGIN
    UPDATE chatbot_knowledge 
    SET usage_count = usage_count + 1,
        last_used = CURRENT_TIMESTAMP
    WHERE MATCH(question, keywords) AGAINST(NEW.search_query IN NATURAL LANGUAGE MODE);
END //

DELIMITER ;

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert sample destinations
INSERT INTO destinations (name, description, category, province, city, latitude, longitude, rating, ticket_price_adult, opening_hours, best_visit_time) VALUES
('Pantai Kuta', 'Pantai paling terkenal di Bali dengan pasir putih dan ombak yang sempurna untuk berselancar', 'beach', 'Bali', 'Badung', -8.7188, 115.1686, 4.2, 0, JSON_OBJECT('monday', '00:00-23:59', 'tuesday', '00:00-23:59'), 'April - Oktober'),
('Gunung Bromo', 'Gunung berapi aktif dengan pemandangan sunrise yang spektakuler', 'mountain', 'Jawa Timur', 'Probolinggo', -7.9425, 112.9500, 4.5, 34000, JSON_OBJECT('monday', '04:00-17:00'), 'Juni - Oktober'),
('Candi Borobudur', 'Monumen Buddha terbesar di dunia dan UNESCO World Heritage Site', 'cultural', 'Jawa Tengah', 'Magelang', -7.6079, 110.2038, 4.7, 75000, JSON_OBJECT('monday', '06:00-17:00'), 'April - Oktober'),
('Raja Ampat', 'Surga diving dengan keanekaragaman hayati laut terkaya di dunia', 'nature', 'Papua Barat Daya', 'Raja Ampat', -0.2500, 130.8333, 4.8, 150000, JSON_OBJECT('monday', '06:00-18:00'), 'Oktober - April'),
('Danau Toba', 'Danau vulkanik terbesar di Asia Tenggara dengan pulau di tengahnya', 'nature', 'Sumatera Utara', 'Toba', 2.6833, 98.8667, 4.6, 0, JSON_OBJECT('monday', '00:00-23:59'), 'April - Oktober');

-- Insert sample accommodations
INSERT INTO accommodations (name, description, type, star_rating, province, city, price_per_night, rating, facilities) VALUES
('The Mulia Bali', 'Resort mewah di Nusa Dua dengan pantai pribadi', 'resort', 5, 'Bali', 'Badung', 3500000, 4.8, JSON_ARRAY('private_beach', 'spa', 'pool', 'fitness_center', 'restaurant')),
('Hotel Santika Borobudur', 'Hotel dekat Candi Borobudur dengan pemandangan gunung', 'hotel', 4, 'Jawa Tengah', 'Magelang', 850000, 4.3, JSON_ARRAY('restaurant', 'pool', 'free_wifi', 'parking')),
('Kampung Lumbung Hotel', 'Hotel tradisional dekat Gunung Bromo', 'hotel', 3, 'Jawa Timur', 'Probolinggo', 450000, 4.1, JSON_ARRAY('restaurant', 'free_wifi', 'parking', 'tour_desk')),
('Raja Ampat Dive Resort', 'Resort khusus diving dengan akses langsung ke spot terbaik', 'resort', 4, 'Papua Barat Daya', 'Raja Ampat', 1800000, 4.6, JSON_ARRAY('dive_center', 'restaurant', 'free_wifi', 'boat_rental'));

-- Insert sample restaurants
INSERT INTO restaurants (name, description, cuisine_type, specialty_dish, province, city, price_range, average_price, rating) VALUES
('Warung Made', 'Restoran tradisional Bali dengan masakan autentik', 'Indonesian', 'Babi Guling', 'Bali', 'Badung', 'moderate', 75000, 4.4),
('Bebek Bengil', 'Restoran terkenal dengan bebek goreng khas Bali', 'Indonesian', 'Bebek Goreng', 'Bali', 'Badung', 'moderate', 85000, 4.3),
('Restaurant Borobudur', 'Restoran dengan pemandangan Candi Borobudur', 'Indonesian', 'Nasi Goreng', 'Jawa Tengah', 'Magelang', 'moderate', 65000, 4.2),
('Seafood Raja Ampat', 'Seafood segar langsung dari nelayan lokal', 'Seafood', 'Grilled Fish', 'Papua Barat Daya', 'Raja Ampat', 'expensive', 150000, 4.5);

-- Insert sample transportation
INSERT INTO transportation (name, type, route_from, route_to, duration, base_price, company) VALUES
('Garuda Indonesia GA-123', 'flight', 'Jakarta', 'Denpasar', '2 jam', 1200000, 'Garuda Indonesia'),
('Kereta Api Argo Bromo', 'train', 'Surabaya', 'Probolinggo', '1.5 jam', 150000, 'KAI'),
('Travel X', 'bus', 'Jakarta', 'Bogor', '3 jam', 75000, 'Travel X'),
('Sewa Mobil Bali', 'car_rental', 'Denpasar Airport', 'Kuta', '30 menit', 500000, 'Bali Car Rental');

-- Insert sample travel tips
INSERT INTO travel_tips (title, content, category, target_audience, province, priority_level) VALUES
('Tips Packing ke Bali', 'Bawa pakaian tipis, sunscreen, dan kamera waterproof', 'packing', 'backpacker', 'Bali', 'high'),
('Budget Traveling di Indonesia', 'Gunakan transportasi umum dan makan di warung lokal', 'budget', 'backpacker', NULL, 'high'),
('Safety Tips untuk Solo Traveler', 'Selalu informasikan itinerary ke keluarga dan simpan nomor darurat', 'safety', 'solo_traveler', NULL, 'high'),
('Etiket Mengunjungi Candi', 'Gunakan pakaian sopan dan jaga ketenangan', 'culture', 'all', 'Jawa Tengah', 'medium');

-- Insert sample chatbot knowledge
INSERT INTO chatbot_knowledge (question, answer, category, keywords, priority_level) VALUES
('Destinasi wisata terbaik di Bali', 'Bali memiliki banyak destinasi menarik seperti Pantai Kuta, Ubud, Tanah Lot, dan Nusa Dua. Setiap tempat menawarkan pengalaman yang berbeda dari pantai hingga budaya.', 'destinations', JSON_ARRAY('bali', 'wisata', 'pantai', 'ubud'), 'high'),
('Hotel murah di Yogyakarta', 'Untuk budget-friendly, Anda bisa mencari hotel di area Malioboro atau Prawirotaman dengan harga mulai dari Rp 200.000 per malam.', 'accommodations', JSON_ARRAY('yogyakarta', 'hotel', 'murah', 'budget'), 'high'),
('Transportasi ke Gunung Bromo', 'Anda bisa menggunakan kereta api dari Surabaya ke Probolinggo, lalu lanjut dengan jeep atau ojek ke area Bromo.', 'transportation', JSON_ARRAY('bromo', 'transportasi', 'kereta', 'jeep'), 'medium'),
('Makanan khas Padang', 'Rendang adalah makanan khas Padang yang terkenal di seluruh dunia. Coba juga Sate Padang dan Gulai Ikan.', 'food', JSON_ARRAY('padang', 'makanan', 'rendang', 'kuliner'), 'medium');

-- ============================================
-- Final Setup
-- ============================================

-- Create indexes for better performance
CREATE INDEX idx_destinations_location ON destinations(latitude, longitude);
CREATE INDEX idx_accommodations_location ON accommodations(latitude, longitude);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);

-- Enable full-text search
ALTER TABLE destinations ADD FULLTEXT(destinations_search, name, description, city);
ALTER TABLE accommodations ADD FULLTEXT(accommodations_search, name, description, city);
ALTER TABLE restaurants ADD FULLTEXT(restaurants_search, name, description, specialty_dish);

COMMIT;
