-- Extended Sample Data for Tourism Database
-- Comprehensive Indonesian Tourism Data

-- ============================================
-- MORE DESTINATIONS
-- ============================================

INSERT INTO destinations (name, description, category, province, city, latitude, longitude, rating, ticket_price_adult, opening_hours, best_visit_time, estimated_duration, facilities) VALUES
('Tanah Lot', 'Pura laut di atas batu karang dengan sunset ikonik', 'cultural', 'Bali', 'Tabanan', -8.8411, 115.0867, 4.6, 60000, JSON_OBJECT('monday', '07:00-19:00'), 'April - Oktober', '2-3 jam', JSON_ARRAY('parking', 'restaurant', 'souvenir_shop', 'toilet')),
('Ubud Monkey Forest', 'Hutan suci dengan ratusan monyet dan pura kuno', 'nature', 'Bali', 'Gianyar', -8.5069, 115.2625, 4.3, 100000, JSON_OBJECT('monday', '09:00-18:00'), 'All year', '1-2 jam', JSON_ARRAY('parking', 'guide', 'souvenir_shop')),
('Pantai Pink', 'Pantai dengan pasir berwarna pink yang langka', 'beach', 'NTT', 'Komodo', -8.7333, 120.4167, 4.7, 0, JSON_OBJECT('monday', '06:00-18:00'), 'April - Desember', '3-4 jam', JSON_ARRAY('parking', 'snack_stall')),
('Candi Prambanan', 'Kompleks candi Hindu terbesar di Indonesia', 'cultural', 'DIY', 'Sleman', -7.7520, 110.4915, 4.6, 50000, JSON_OBJECT('monday', '06:00-17:00'), 'April - Oktober', '2-3 jam', JSON_ARRAY('parking', 'museum', 'theater', 'restaurant')),
('Kawah Ijen', 'Kawah dengan blue fire fenomena alam langka', 'nature', 'Jawa Timur', 'Banyuwangi', -8.0584, 114.2426, 4.8, 100000, JSON_OBJECT('monday', '01:00-12:00'), 'Juli - September', '6-8 jam', JSON_ARRAY('parking', 'guide', 'safety_equipment')),
('Taman Nasional Komodo', 'Habitat asli komodo dan keanekaragaman hayati laut', 'nature', 'NTT', 'Manggarai Barat', -8.5500, 119.5000, 4.9, 150000, JSON_OBJECT('monday', '06:00-17:00'), 'April - Desember', '1 hari', JSON_ARRAY('parking', 'ranger_station', 'restaurant', 'toilet')),
('Gili Trawangan', 'Pulau kecil dengan pantai dan kehidupan malam', 'beach', 'NTB', 'Lombok Utara', -8.6167, 116.0333, 4.4, 0, JSON_OBJECT('monday', '00:00-23:59'), 'All year', '1 hari', JSON_ARRAY('snorkeling_rental', 'restaurant', 'accommodation')),
('Pulau Weh', 'Pulau paling barat Indonesia dengan diving spot world-class', 'beach', 'Aceh', 'Sabang', 5.8167, 95.2833, 4.5, 0, JSON_OBJECT('monday', '00:00-23:59'), 'April - Oktober', '2-3 hari', JSON_ARRAY('dive_center', 'restaurant', 'accommodation')),
('Candi Ratu Boko', 'Istana kuno dengan pemandangan matahari terbenam', 'cultural', 'DIY', 'Sleman', -7.7781, 110.4915, 4.4, 40000, JSON_OBJECT('monday', '06:00-17:00'), 'All year', '2-3 jam', JSON_ARRAY('parking', 'restaurant', 'photo_spot')),
('Pantai Parangtritis', 'Pantai legendaris dengan mitos Nyi Roro Kidul', 'beach', 'DIY', 'Bantul', -8.0256, 110.3294, 4.1, 0, JSON_OBJECT('monday', '00:00-23:59'), 'All year', '2-3 jam', JSON_ARRAY('parking', 'restaurant', 'atv_rental'));

-- ============================================
-- MORE ACCOMMODATIONS
-- ============================================

INSERT INTO accommodations (name, description, type, star_rating, province, city, price_per_night, rating, facilities, breakfast_included, free_wifi, pool, spa) VALUES
('Amanjiwo Resort', 'Resort mewah dengan pemandangan Borobudur', 'resort', 5, 'Jawa Tengah', 'Magelang', 8500000, 4.9, JSON_ARRAY('spa', 'pool', 'restaurant', 'butler_service', 'yoga_pavilion'), TRUE, TRUE, TRUE, TRUE),
('Alila Villas Uluwatu', 'Villa cliff-top dengan infinity pool', 'villa', 5, 'Bali', 'Badung', 5500000, 4.8, JSON_ARRAY('private_pool', 'spa', 'restaurant', 'beach_club'), TRUE, TRUE, TRUE, TRUE),
('The 101 Bali', 'Hotel modern di Seminyak', 'hotel', 4, 'Bali', 'Badung', 1200000, 4.2, JSON_ARRAY('pool', 'restaurant', 'fitness_center', 'meeting_room'), TRUE, TRUE, TRUE, FALSE),
('Malioboro Palace Hotel', 'Hotel strategis di pusat Yogyakarta', 'hotel', 3, 'DIY', 'Yogyakarta', 350000, 4.0, JSON_ARRAY('restaurant', 'free_wifi', 'parking'), TRUE, TRUE, FALSE, FALSE),
('Gili Islands Hostel', 'Hostel budget-friendly di Gili Trawangan', 'hostel', 2, 'NTB', 'Lombok Utara', 150000, 3.8, JSON_ARRAY('dormitory', 'kitchen', 'free_wifi'), FALSE, TRUE, FALSE, FALSE),
('Bromo Cottage', 'Guesthouse dekat Gunung Bromo', 'guesthouse', 2, 'Jawa Timur', 'Probolinggo', 250000, 3.9, JSON_ARRAY('restaurant', 'hot_water', 'tour_package'), TRUE, FALSE, FALSE, FALSE),
('Jakarta Backpacker Hostel', 'Hostel pusat kota Jakarta', 'hostel', 2, 'DKI Jakarta', 'Jakarta Pusat', 180000, 3.7, JSON_ARRAY('dormitory', 'kitchen', 'lounge'), FALSE, TRUE, FALSE, FALSE),
('Bandung Homestay', 'Homestay cozy di Dago', 'homestay', 3, 'Jawa Barat', 'Bandung', 300000, 4.1, JSON_ARRAY('kitchen', 'living_room', 'garden'), TRUE, TRUE, FALSE, FALSE);

-- ============================================
-- MORE RESTAURANTS
-- ============================================

INSERT INTO restaurants (name, description, cuisine_type, specialty_dish, province, city, price_range, average_price, rating, halal_certified, delivery_available) VALUES
('Sate Klathak Pak Budi', 'Sate kambing tanpa tusen khas Yogyakarta', 'Indonesian', 'Sate Kambing', 'DIY', 'Bantul', 'budget', 35000, 4.5, TRUE, FALSE),
('Nasi Padang Sederhana', 'Rumah makan Padang autentik', 'Indonesian', 'Rendang', 'Sumatera Barat', 'Padang', 'budget', 40000, 4.3, TRUE, TRUE),
('Lumpia Semarang Gang Lombok', 'Lumpia legendaris Semarang', 'Indonesian', 'Lumpia', 'Jawa Tengah', 'Semarang', 'budget', 25000, 4.4, TRUE, FALSE),
('Bakso Kota Cak Man', 'Bakso legendaris dengan kuah kental', 'Indonesian', 'Bakso Urat', 'Jawa Timur', 'Malang', 'budget', 30000, 4.2, TRUE, TRUE),
('Soto Ayam Pak Suharto', 'Soto ayam gurih khas Solo', 'Indonesian', 'Soto Ayam', 'Jawa Tengah', 'Surakarta', 'budget', 28000, 4.3, TRUE, FALSE),
('Gudeg Yu Djum', 'Gudeg legendaris Yogyakarta', 'Indonesian', 'Gudeg', 'DIY', 'Yogyakarta', 'moderate', 55000, 4.6, TRUE, TRUE),
('Ayam Bakar Wong Solo', 'Ayam bakar dengan sambal khas', 'Indonesian', 'Ayam Bakar', 'Jawa Tengah', 'Surakarta', 'moderate', 45000, 4.1, TRUE, TRUE),
('Seafood Pantai Jimbaran', 'Seafood segar di pinggir pantai', 'Seafood', 'Grilled Seafood', 'Bali', 'Badung', 'expensive', 200000, 4.4, TRUE, FALSE),
('Rock Bar Bali', 'Bar dengan sunset view ikonik', 'International', 'Cocktails', 'Bali', 'Badung', 'luxury', 350000, 4.5, FALSE, FALSE),
('Lara Jonggrang Bar', 'Fine dining dengan pemandangan Prambanan', 'International', 'Tasting Menu', 'DIY', 'Sleman', 'luxury', 450000, 4.3, FALSE, TRUE);

-- ============================================
-- MORE TRANSPORTATION
-- ============================================

INSERT INTO transportation (name, type, route_from, route_to, duration, distance_km, base_price, price_per_km, company, facilities) VALUES
('Citilink QG-123', 'flight', 'Jakarta', 'Yogyakarta', '1.5 jam', 600, 850000, 0, 'Citilink', JSON_ARRAY('meal', 'entertainment')),
('Lion Air JT-456', 'flight', 'Jakarta', 'Denpasar', '2 jam', 1000, 1200000, 0, 'Lion Air', JSON_ARRAY('meal', 'baggage')),
('Kereta Api Argo Lawu', 'train', 'Jakarta', 'Solo', '4 jam', 500, 450000, 0, 'KAI', JSON_ARRAY('executive_class', 'meal', 'wifi')),
('Kereta Api Gajayana', 'train', 'Jakarta', 'Malang', '8 jam', 800, 650000, 0, 'KAI', JSON_ARRAY('executive_class', 'meal', 'entertainment')),
('Travel X Malang', 'bus', 'Surabaya', 'Malang', '3 jam', 100, 85000, 0, 'Travel X', JSON_ARRAY('ac', 'reclining_seat')),
('Sugeng Rahayu Bus', 'bus', 'Jakarta', 'Yogyakarta', '8 jam', 550, 200000, 0, 'Sugeng Rahayu', JSON_ARRAY('ac', 'toilet', 'entertainment')),
('Blue Bird Taxi', 'taxi', 'Jakarta Airport', 'Jakarta City', '1 jam', 30, 150000, 5000, 'Blue Bird', JSON_ARRAY('ac', 'metered')),
('Go-Jek Car', 'online_transport', 'Bali Airport', 'Kuta', '45 menit', 15, 120000, 0, 'Go-Jek', JSON_ARRAY('ac', 'gps', 'cashless')),
('Sewa Motor Bali', 'motorcycle_rental', 'Kuta', 'Seminyak', '15 menit', 5, 75000, 0, 'Bali Rental', JSON_ARRAY('helmet', 'insurance')),
('Kapal Cepat Express', 'ferry', 'Bali', 'Lombok', '2 jam', 80, 350000, 0, 'Express Ferry', JSON_ARRAY('ac', 'seating', 'snack'));

-- ============================================
-- TOUR PACKAGES
-- ============================================

INSERT INTO tour_packages (name, description, duration_days, difficulty_level, province, destinations, itinerary, inclusions, exclusions, price_per_person, guide_included, transport_included, accommodation_included, meals_included) VALUES
('Bali Explorer 5D4N', 'Paket lengkap menjelajahi Bali dari pantai hingga budaya', 5, 'easy', 'Bali', 
JSON_ARRAY(1, 2, 5), 
JSON_OBJECT('day1', 'Arrival & Kuta Beach', 'day2', 'Ubud Tour', 'day3', 'Tanah Lot Sunset', 'day4', 'Nusa Dua Beach', 'day5', 'Departure'),
JSON_ARRAY('hotel', 'breakfast', 'guide', 'transport', 'entrance_fees'),
JSON_ARRAY('lunch', 'dinner', 'souvenirs', 'personal_expenses'),
3500000, TRUE, TRUE, TRUE, TRUE),

('Bromo Midnight Tour', 'Suntrip ke Gunung Bromo dengan pemandangan spektakuler', 2, 'moderate', 'Jawa Timur',
JSON_ARRAY(2),
JSON_OBJECT('day1', 'Midnight departure & sunrise', 'day2', 'Crater exploration & return'),
JSON_ARRAY('transport', 'guide', 'jeep', 'entrance_fees', 'breakfast'),
JSON_ARRAY('lunch', 'dinner', 'personal_expenses'),
850000, TRUE, TRUE, FALSE, FALSE),

('Yogyakarta Heritage 3D2N', 'Paket warisan budaya Yogyakarta', 3, 'easy', 'DIY',
JSON_ARRAY(4, 9),
JSON_OBJECT('day1', 'Borobudur Temple', 'day2', 'Prambanan & Ratu Boko', 'day3', 'City Tour'),
JSON_ARRAY('hotel', 'breakfast', 'guide', 'transport', 'entrance_fees'),
JSON_ARRAY('lunch', 'dinner', 'souvenirs'),
2200000, TRUE, TRUE, TRUE, FALSE),

('Komodo Adventure 4D3N', 'Petualangan melihat komodo di habitat aslinya', 4, 'moderate', 'NTT',
JSON_ARRAY(6),
JSON_OBJECT('day1', 'Labuan Bajo arrival', 'day2', 'Komodo Island', 'day3', 'Pink Beach & Diving', 'day4', 'Return'),
JSON_ARRAY('hotel', 'meals', 'guide', 'boat', 'diving_equipment'),
JSON_ARRAY('flight', 'personal_expenses', 'alcohol'),
5500000, TRUE, TRUE, TRUE, TRUE),

('Raja Ampat Diving 7D6N', 'Paket diving lengkap di surga bawah laut Raja Ampat', 7, 'hard', 'Papua Barat Daya',
JSON_ARRAY(4),
JSON_OBJECT('day1', 'Arrival & check-in', 'day2-6', 'Diving expeditions', 'day7', 'Departure'),
JSON_ARRAY('resort', 'all_meals', 'diving_guide', 'boat_diving', 'equipment'),
JSON_ARRAY('flight', 'diving_certification', 'souvenirs'),
12000000, TRUE, TRUE, TRUE, TRUE);

-- ============================================
-- WEATHER INFO
-- ============================================

INSERT INTO weather_info (province, city, month, avg_temperature_celsius, avg_humidity_percent, rainfall_mm, sunshine_hours, weather_condition, travel_suitability, recommendations) VALUES
('Bali', 'Denpasar', 'January', 28.5, 85, 350, 6, 'rainy', 'moderate', 'Bawa raincoat dan payung'),
('Bali', 'Denpasar', 'July', 26.8, 70, 50, 10, 'sunny', 'excellent', 'Perfect untuk beach activities'),
('DIY', 'Yogyakarta', 'August', 27.2, 65, 30, 9, 'sunny', 'excellent', 'Best time untuk temple visits'),
('Jawa Timur', 'Probolinggo', 'October', 28.0, 68, 80, 8, 'sunny', 'good', 'Ideal untuk Bromo sunrise'),
('NTT', 'Manggarai Barat', 'April', 29.5, 75, 120, 7, 'cloudy', 'good', 'Good untuk Komodo trekking'),
('Papua Barat Daya', 'Raja Ampat', 'November', 30.2, 80, 200, 6, 'rainy', 'moderate', 'Diving masih possible dengan proper gear'),
('DKI Jakarta', 'Jakarta', 'February', 29.0, 82, 280, 5, 'rainy', 'moderate', 'Avoid outdoor activities saat hujan deras'),
('Sumatera Utara', 'Toba', 'June', 26.5, 72, 60, 8, 'sunny', 'excellent', 'Perfect untuk lake activities');

-- ============================================
-- EVENTS & FESTIVALS
-- ============================================

INSERT INTO events_festivals (name, description, type, province, city, venue, start_date, end_date, is_annual, expected_attendees, ticket_price) VALUES
('Bali Arts Festival', 'Festival seni dan budaya Bali terbesar', 'cultural', 'Bali', 'Denpasar', 'Art Center', '2024-06-15', '2024-07-14', TRUE, 50000, 0),
('Yogyakarta Art Festival', 'Festival seni tahunan Yogyakarta', 'art', 'DIY', 'Yogyakarta', 'Taman Budaya', '2024-10-01', '2024-10-31', TRUE, 30000, 25000),
('Jakarta International Java Jazz Festival', 'Festival jazz internasional', 'music', 'DKI Jakarta', 'Jakarta', 'JIExpo', '2024-03-01', '2024-03-03', TRUE, 80000, 750000),
('Solo Batik Carnival', 'Karnaval batik khas Solo', 'cultural', 'Jawa Tengah', 'Surakarta', 'Jalan Slamet Riyadi', '2024-09-15', '2024-09-15', TRUE, 25000, 0),
('Borobudur Marathon', 'Marathon internasional di Candi Borobudur', 'sport', 'Jawa Tengah', 'Magelang', 'Borobudur Temple', '2024-11-17', '2024-11-17', TRUE, 10000, 850000),
('Raja Ampat Festival', 'Festival kebudayaan dan konservasi laut', 'cultural', 'Papua Barat Daya', 'Raja Ampat', 'Waisai', '2024-10-20', '2024-10-22', TRUE, 5000, 150000),
('Surabaya Food Festival', 'Festival kuliner Surabaya', 'food', 'Jawa Timur', 'Surabaya', 'Grand City', '2024-05-10', '2024-05-12', TRUE, 40000, 35000),
('Komodo Dragon Race', 'Lomba lari di Pulau Komodo', 'sport', 'NTT', 'Manggarai Barat', 'Komodo Island', '2024-08-25', '2024-08-25', TRUE, 1000, 500000);

-- ============================================
-- EMERGENCY CONTACTS
-- ============================================

INSERT INTO emergency_contacts (name, type, province, city, phone_number, address, is_24_hours, services_offered) VALUES
('Polresta Denpasar', 'police', 'Bali', 'Denpasar', '110', 'Jl. Raya Puputan No.1', TRUE, JSON_ARRAY('emergency_response', 'crime_reporting', 'traffic_control')),
('RSUP Sanglah', 'hospital', 'Bali', 'Denpasar', '0361-227333', 'Jl. Diponegoro', TRUE, JSON_ARRAY('emergency_care', 'surgery', 'icu', 'ambulance')),
('Bali Tourism Police', 'tourism_police', 'Bali', 'Denpasar', '0361-222222', 'Jl. Raya Kuta', TRUE, JSON_ARRAY('tourist_assistance', 'complaint_handling', 'information')),
('Pemadam Kebakaran Jakarta', 'fire', 'DKI Jakarta', 'Jakarta', '113', 'Jl. Medan Merdeka Selatan', TRUE, JSON_ARRAY('fire_fighting', 'rescue', 'emergency_medical')),
('SAR Jakarta', 'rescue', 'DKI Jakarta', 'Jakarta', '112', 'Jl. Gatot Subroto', TRUE, JSON_ARRAY('search_rescue', 'disaster_response', 'evacuation')),
('Rumah Sakit Borobudur', 'hospital', 'DIY', 'Magelang', '0293-368133', 'Jl. Borobudur', TRUE, JSON_ARRAY('emergency_care', 'outpatient', 'inpatient')),
('Tourism Police Yogyakarta', 'tourism_police', 'DIY', 'Yogyakarta', '0274-562000', 'Jl. Malioboro', TRUE, JSON_ARRAY('tourist_safety', 'information', 'complaint_handling')),
('RSU Dr. Soetomo', 'hospital', 'Jawa Timur', 'Surabaya', '031-550000', 'Jl. Airlangga', TRUE, JSON_ARRAY('trauma_center', 'emergency_care', 'specialist_clinic'));

-- ============================================
-- MORE TRAVEL TIPS
-- ============================================

INSERT INTO travel_tips (title, content, category, target_audience, province, priority_level) VALUES
('Tips Bertransit di Bandara Soekarno-Hatta', 'Gunakan Skytrain untuk pindah terminal, datang 3 jam sebelum penerbangan domestik', 'transportation', 'all', 'DKI Jakarta', 'high'),
('Cara Menggunakan Transportasi Online di Bali', 'Download Go-Jek atau Grab, siapkan cash untuk beberapa area', 'transportation', 'backpacker', 'Bali', 'high'),
('Etiket Berfoto di Tempat Suci', 'Jangan menggunakan flash, dress code sopan, jangan membuat keributan', 'culture', 'all', 'DIY', 'medium'),
('Tips Menghindari Macet di Jakarta', 'Hindari jam 07:00-10:00 dan 16:00-19:00, gunakan MRT atau TransJakarta', 'transportation', 'all', 'DKI Jakarta', 'high'),
('Panduan Makanan Halal di Bali', 'Cari restoran dengan sertifikat halal, tanya "apakah ini halal?" sebelum memesan', 'food', 'muslim_traveler', 'Bali', 'high'),
('Tips Budget untuk Backpacker Indonesia', 'Hostel mulai 50k, makan di warung 20-30k, gunakan bus ekonomi', 'budget', 'backpacker', NULL, 'high'),
('Health Tips untuk Travel ke Indonesia', 'Minum air botol, bawa obat diare, vaksinasi hepatitis A', 'health', 'all', NULL, 'high'),
('Safety Tips untuk Female Traveler', 'Dress modestly, avoid walking alone at night, share itinerary', 'safety', 'solo_traveler', NULL, 'high'),
('Packing List untuk Indonesia', 'Light clothes, sunscreen, insect repellent, comfortable shoes, rain jacket', 'packing', 'all', NULL, 'medium'),
('Tips Berinteraksi dengan Lokal', 'Learn basic Bahasa, smile, respect elders, bargain politely', 'culture', 'all', NULL, 'medium');

-- ============================================
-- EXTENDED CHATBOT KNOWLEDGE
-- ============================================

INSERT INTO chatbot_knowledge (question, answer, category, keywords, priority_level) VALUES
('Bagaimana cara ke Raja Ampat', 'Untuk ke Raja Ampat, terbang dari Jakarta ke Sorong, lalu lanjut dengan speedboat 2 jam ke Waisai. Harga tiket Jakarta-Sorong sekitar Rp 2-3 juta.', 'transportation', JSON_ARRAY('raja ampat', 'transportasi', 'pesawat', 'speedboat'), 'high'),
('Paket wisata Bromo murah', 'Paket Bromo midnight tour mulai dari Rp 500.000 sudah termasuk transport, jeep, dan guide. Berangkat tengah malam untuk sunrise.', 'tour_packages', JSON_ARRAY('bromo', 'paket', 'murah', 'sunrise'), 'high'),
('Hotel dekat Malioboro', 'Hotel di sekitar Malioboro mulai dari Rp 200.000/malam. Rekomendasi: Hotel Mutiara, Ibis Malioboro, atau guesthouse lokal.', 'accommodations', JSON_ARRAY('yogyakarta', 'hotel', 'malioboro', 'dekat'), 'medium'),
('Makanan halal di Bali', 'Banyak restoran halal di Bali, terutama di area Kuta dan Seminyak. Cari logo halal atau tanya "apakah makanan ini halal?"', 'food', JSON_ARRAY('bali', 'halal', 'makanan', 'muslim'), 'high'),
('Tips naik kereta api di Indonesia', 'Download aplikasi KAI Access, booking online 30 hari sebelumnya, check-in 30 menit sebelum keberangkatan.', 'transportation', JSON_ARRAY('kereta api', 'tiket', 'booking', 'tips'), 'medium'),
('Cuaca terbaik ke Bali', 'April-Oktober adalah musim kemarau Bali, cuaca cerah dan tidak hujan. November-Maret musim hujan.', 'weather', JSON_ARRAY('bali', 'cuaca', 'musim', 'terbaik'), 'medium'),
('Destinasi untuk keluarga', 'Bali, Lombok, dan Bandung cocok untuk family trip. Banyak theme park dan aktivitas anak-anak.', 'destinations', JSON_ARRAY('keluarga', 'family', 'anak', 'destinasi'), 'medium'),
('Backpacking Indonesia budget', 'Budget backpacker Indonesia sekitar Rp 300.000-500.000/hari termasuk hostel, makan, dan transport lokal.', 'budget', JSON_ARRAY('backpacking', 'budget', 'hemat', 'murah'), 'high'),
('Visa untuk turis asing', 'Most nationalities get visa on arrival 30 days di Indonesia. Extendable 30 hari lagi di imigrasi.', 'general', JSON_ARRAY('visa', 'turis', 'asing', 'immigration'), 'high'),
('Sim card untuk turis', 'Beli SIM card lokal di bandara. Telkomsel atau XL memiliki coverage terbaik. Harga Rp 50.000-100.000.', 'general', JSON_ARRAY('sim card', 'internet', 'pulsa', 'turis'), 'medium');

COMMIT;
