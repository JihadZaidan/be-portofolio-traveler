const { v4: uuidv4 } = require('uuid');

// Mock data for tourism destinations (for testing without database)
const mockDestinations = [
  {
    id: 1,
    name: 'Pantai Kuta',
    description: 'Pantai pasir putih yang terkenal dengan sunset spektakuler dan ombak yang cocok untuk berselancar. Salah satu destinasi paling populer di Bali.',
    category: 'Pantai',
    province: 'Bali',
    city: 'Badung',
    rating: 4.5,
    ticket_price_adult: 0,
    best_visit_time: 'Sore hari untuk sunset',
    estimated_duration: '2-3 jam',
    facilities: ['Toilet', 'Shower', 'Restoran', 'Parkir', 'Lifeguard']
  },
  {
    id: 2,
    name: 'Candi Borobudur',
    description: 'Monumen Buddha terbesar di dunia yang merupakan situs warisan UNESCO. Terdiri dari 9 platform, 6 platform berbentuk persegi dan 3 platform berbentuk bundar dengan 72 stupa.',
    category: 'Candi',
    province: 'Jawa Tengah',
    city: 'Magelang',
    rating: 4.8,
    ticket_price_adult: 50000,
    best_visit_time: 'Pagi hari sebelum pukul 09:00',
    estimated_duration: '3-4 jam',
    facilities: ['Toilet', 'Mushola', 'Restoran', 'Souvenir Shop', 'Guide Service']
  },
  {
    id: 3,
    name: 'Raja Ampat',
    description: 'Kepulauan dengan keanekaragaman hayati laut terkaya di dunia. Terkenal dengan diving spot yang menakjubkan dan pemandangan karst yang dramatis.',
    category: 'Pulau',
    province: 'Papua Barat',
    city: 'Raja Ampat',
    rating: 4.9,
    ticket_price_adult: 100000,
    best_visit_time: 'Oktober - April',
    estimated_duration: '3-5 hari',
    facilities: ['Resort', 'Diving Center', 'Restaurant', 'Speed Boat', 'Guide']
  }
];

const mockAccommodations = [
  {
    id: 1,
    name: 'Kuta Beach Hotel',
    description: 'Hotel bintang 4 tepat di depan Pantai Kuta dengan pemandangan laut yang menakjubkan.',
    type: 'Hotel',
    star_rating: 4,
    province: 'Bali',
    city: 'Badung',
    rating: 4.3,
    price_per_night: 800000,
    breakfast_included: true,
    free_wifi: true,
    pool: true,
    facilities: ['Restaurant', 'Bar', 'Spa', 'Gym', 'Beach Access']
  },
  {
    id: 2,
    name: 'Manohara Hotel Borobudur',
    description: 'Hotel nyaman dekat Candi Borobudur dengan akses sunrise tour ke candi.',
    type: 'Hotel',
    star_rating: 3,
    province: 'Jawa Tengah',
    city: 'Magelang',
    rating: 4.1,
    price_per_night: 450000,
    breakfast_included: true,
    free_wifi: true,
    pool: false,
    facilities: ['Restaurant', 'Tour Service', 'Garden', 'Parking']
  }
];

const mockRestaurants = [
  {
    id: 1,
    name: 'Warung Made',
    description: 'Restoran terkenal dengan masakan Indonesia dan Bali autentik.',
    cuisine_type: 'Indonesian',
    specialty_dish: 'Nasi Campur Bali',
    province: 'Bali',
    city: 'Badung',
    rating: 4.4,
    price_range: 'moderate',
    average_price: 75000,
    halal_certified: true
  },
  {
    id: 2,
    name: 'Restaurant Borobudur',
    description: 'Restoran dengan pemandangan langsung ke Candi Borobudur.',
    cuisine_type: 'Indonesian',
    specialty_dish: 'Gudeg Jogja',
    province: 'Jawa Tengah',
    city: 'Magelang',
    rating: 4.2,
    price_range: 'moderate',
    average_price: 60000,
    halal_certified: true
  }
];

class EnhancedTourismChatController {
  constructor() {
    console.log('Enhanced Tourism Chat Controller initialized with mock data');
  }

  /**
   * Search destinations from mock data
   */
  async searchDestinations(query, limit = 5) {
    try {
      const lowerQuery = query.toLowerCase();
      const results = mockDestinations.filter(dest => 
        dest.name.toLowerCase().includes(lowerQuery) ||
        dest.city.toLowerCase().includes(lowerQuery) ||
        dest.province.toLowerCase().includes(lowerQuery) ||
        dest.description.toLowerCase().includes(lowerQuery)
      ).slice(0, limit);

      return results;
    } catch (error) {
      console.error('Error searching destinations:', error);
      return [];
    }
  }

  /**
   * Search accommodations from mock data
   */
  async searchAccommodations(query, province, maxPrice, limit = 5) {
    try {
      const lowerQuery = query.toLowerCase();
      let results = mockAccommodations.filter(acc => 
        acc.name.toLowerCase().includes(lowerQuery) ||
        acc.city.toLowerCase().includes(lowerQuery) ||
        acc.province.toLowerCase().includes(lowerQuery)
      );

      if (province) {
        results = results.filter(acc => acc.province.toLowerCase().includes(province.toLowerCase()));
      }

      if (maxPrice) {
        results = results.filter(acc => acc.price_per_night <= maxPrice);
      }

      return results.slice(0, limit);
    } catch (error) {
      console.error('Error searching accommodations:', error);
      return [];
    }
  }

  /**
   * Search restaurants from mock data
   */
  async searchRestaurants(query, province, priceRange, limit = 5) {
    try {
      const lowerQuery = query.toLowerCase();
      let results = mockRestaurants.filter(rest => 
        rest.name.toLowerCase().includes(lowerQuery) ||
        rest.city.toLowerCase().includes(lowerQuery) ||
        rest.province.toLowerCase().includes(lowerQuery) ||
        rest.specialty_dish.toLowerCase().includes(lowerQuery)
      );

      if (province) {
        results = results.filter(rest => rest.province.toLowerCase().includes(province.toLowerCase()));
      }

      if (priceRange) {
        results = results.filter(rest => rest.price_range === priceRange);
      }

      return results.slice(0, limit);
    } catch (error) {
      console.error('Error searching restaurants:', error);
      return [];
    }
  }

  /**
   * Format destination results for detailed chat response
   */
  formatDestinations(destinations) {
    if (destinations.length === 0) return '';

    let response = `🏝️ **Destinasi Wisata Ditemukan:**\n\n`;
    
    destinations.forEach((dest, index) => {
      response += `${index + 1}. **${dest.name}** (${dest.city}, ${dest.province})\n`;
      response += `   📍 **Deskripsi:** ${dest.description}\n`;
      response += `   ⭐ **Rating:** ${dest.rating}/5 | 💰 **Harga Tiket:** Rp ${dest.ticket_price_adult.toLocaleString('id-ID')}\n`;
      response += `   🕐 **Waktu Terbaik:** ${dest.best_visit_time}\n`;
      response += `   ⏱️ **Durasi Kunjungan:** ${dest.estimated_duration}\n`;
      
      if (dest.category) {
        response += `   🏷️ **Kategori:** ${dest.category}\n`;
      }
      
      if (dest.facilities && Array.isArray(dest.facilities)) {
        response += `   🏗️ **Fasilitas:** ${dest.facilities.join(', ')}\n`;
      }
      
      // Add detailed travel tips for each destination
      response += `   💡 **Tips Kunjungan:**\n`;
      response += `      • Datang pada ${dest.best_visit_time} untuk pengalaman terbaik\n`;
      response += `      • Sediakan waktu ${dest.estimated_duration} untuk eksplorasi menyeluruh\n`;
      response += `      • Bawa kamera untuk dokumentasi pemandangan indah\n`;
      
      if (dest.ticket_price_adult > 100000) {
        response += `      • Pertimbangkan budget tambahan untuk makan dan suvenir\n`;
      } else {
        response += `      • Destinasi ini ramah budget, cocok untuk backpacker\n`;
      }
      
      response += `   🗺️ **Akses:** Tanyakan "cara ke ${dest.name}" untuk info rute dan transportasi\n\n`;
    });

    response += `💬 *Butuh info lebih detail? Tanya tentang hotel, restoran, atau transportasi ke destinasi ini!*`;
    return response;
  }

  /**
   * Format accommodation results for chat response
   */
  formatAccommodations(accommodations) {
    if (accommodations.length === 0) return '';

    let response = `🏨 **Penginapan Ditemukan:**\n\n`;
    
    accommodations.forEach((acc, index) => {
      response += `${index + 1}. **${acc.name}** (${acc.type}, ${acc.star_rating}⭐)\n`;
      response += `   📍 ${acc.city}, ${acc.province}\n`;
      response += `   💰 Rp ${acc.price_per_night.toLocaleString('id-ID')}/malam | ⭐ Rating: ${acc.rating}/5\n`;
      
      let facilities = [];
      if (acc.breakfast_included) facilities.push('Sarapan');
      if (acc.free_wifi) facilities.push('WiFi');
      if (acc.pool) facilities.push('Kolam Renang');
      
      if (facilities.length > 0) {
        response += `   🏗️ Fasilitas: ${facilities.join(', ')}\n`;
      }
      response += '\n';
    });

    return response;
  }

  /**
   * Format restaurant results for chat response
   */
  formatRestaurants(restaurants) {
    if (restaurants.length === 0) return '';

    let response = `🍜 **Restoran Ditemukan:**\n\n`;
    
    restaurants.forEach((rest, index) => {
      response += `${index + 1}. **${rest.name}** (${rest.cuisine_type})\n`;
      response += `   📍 ${rest.city}, ${rest.province}\n`;
      response += `   🍽️ Spesial: ${rest.specialty_dish}\n`;
      response += `   💰 ${rest.price_range} | 📊 Rp ${rest.average_price?.toLocaleString('id-ID')} | ⭐ ${rest.rating}/5\n`;
      response += `   ${rest.halal_certified ? '✅ Halal Certified' : 'ℹ️ Cek ketersediaan makanan halal'}\n\n`;
    });

    return response;
  }

  /**
   * Generate detailed destination information
   */
  generateDetailedDestinationInfo(destination) {
    let detailedInfo = `\n📖 **Informasi Detail ${destination.name}:**\n\n`;
    
    detailedInfo += `🌟 **Highlight Destinasi:**\n`;
    detailedInfo += `${destination.description}\n\n`;
    
    detailedInfo += `📍 **Lokasi & Akses:**\n`;
    detailedInfo += `• Alamat: ${destination.city}, ${destination.province}\n`;
    detailedInfo += `• Koordinat: [Tanya "cara ke ${destination.name}" untuk petunjuk arah]\n\n`;
    
    detailedInfo += `💰 **Informasi Tiket:**\n`;
    detailedInfo += `• Harga dewasa: Rp ${destination.ticket_price_adult.toLocaleString('id-ID')}\n`;
    detailedInfo += `• Estimasi biaya tambahan: Rp ${Math.round(destination.ticket_price_adult * 0.3).toLocaleString('id-ID')} (makan, transport)\n\n`;
    
    detailedInfo += `⏰ **Waktu & Durasi:**\n`;
    detailedInfo += `• Waktu terbaik: ${destination.best_visit_time}\n`;
    detailedInfo += `• Durasi rekomendasi: ${destination.estimated_duration}\n\n`;
    
    if (destination.facilities && Array.isArray(destination.facilities)) {
      detailedInfo += `🏗️ **Fasilitas Lengkap:**\n`;
      destination.facilities.forEach((facility, index) => {
        detailedInfo += `• ${facility}\n`;
      });
      detailedInfo += `\n`;
    }
    
    detailedInfo += `📸 **Tips Fotografi:**\n`;
    detailedInfo += `• Golden hour: 06:00-08:00 dan 16:00-18:00\n`;
    detailedInfo += `• Spot terbaik: Tanya "spot foto ${destination.name}"\n\n`;
    
    detailedInfo += `🍽️ **Rekomendasi Kuliner:**\n`;
    detailedInfo += `• Coba makanan khas ${destination.city}\n`;
    detailedInfo += `• Tanya "restoran di ${destination.city}" untuk rekomendasi\n\n`;
    
    detailedInfo += `🏨 **Penginapan Terdekat:**\n`;
    detailedInfo += `• Tanya "hotel di ${destination.city}" untuk opsi menginap\n`;
    detailedInfo += `• Budget: Rp ${Math.round(destination.ticket_price_adult * 2).toLocaleString('id-ID')}-${Math.round(destination.ticket_price_adult * 10).toLocaleString('id-ID')}/malam\n\n`;
    
    return detailedInfo;
  }

  /**
   * Extract locations from message
   */
  extractLocations(message) {
    const locations = [];
    const knownLocations = [
      'bali', 'jakarta', 'yogyakarta', 'jogja', 'bandung', 'surabaya', 'malang', 
      'medan', 'batam', 'palembang', 'makassar', 'manado', ' lombok', 'sumbawa',
      'flores', 'komodo', 'raja ampat', 'papua', 'sorong', 'manokwari',
      'kalimantan', 'borneo', 'balikpapan', 'samarinda', 'pontianak',
      'sulawesi', 'celebes', 'makassar', 'kendari', 'palu', 'gorontalo',
      'jawa', 'java', 'banten', 'jakarta', 'bandung', 'semarang', 'yogyakarta', 'surabaya', 'malang',
      'sumatera', 'sumatra', 'aceh', 'medan', 'padang', 'pekanbaru', 'palembang', 'lampung', 'bengkulu',
      'bali', 'ntb', 'nusa tenggara barat', 'mataram', 'lombok', 'sumbawa', 'komodo',
      'ntt', 'nusa tenggara timur', 'kupang', 'flores', 'ende', 'maumere',
      'maluku', 'ambon', 'ternate', 'tidore',
      'papua', 'jayapura', 'sorong', 'manokwari', 'biak', 'merauke',
      'magelang', 'badung'
    ];

    const lowerMessage = message.toLowerCase();
    for (const location of knownLocations) {
      if (lowerMessage.includes(location)) {
        locations.push(location);
      }
    }

    return locations;
  }

  /**
   * Extract budget information from message
   */
  extractBudget(message) {
    const budgetPatterns = [
      { pattern: /(\d+)juta/, multiplier: 1000000 },
      { pattern: /(\d+)ribu/, multiplier: 1000 },
      { pattern: /(\d+)k/, multiplier: 1000 },
      { pattern: /rp\s*(\d+)/, multiplier: 1 },
      { pattern: /(\d+)/, multiplier: 1 }
    ];

    for (const { pattern, multiplier } of budgetPatterns) {
      const match = message.toLowerCase().match(pattern);
      if (match) {
        const amount = parseInt(match[1]) * multiplier;
        
        // Determine price range
        let priceRange = 'budget';
        if (amount > 1000000) priceRange = 'moderate';
        if (amount > 3000000) priceRange = 'expensive';
        if (amount > 8000000) priceRange = 'luxury';

        return { maxPrice: amount, priceRange };
      }
    }

    return null;
  }

  /**
   * Generate enhanced default response with detailed travel guidance
   */
  generateDefaultResponse(message) {
    const hour = new Date().getHours();
    let greeting = 'Halo!';
    
    if (hour < 12) greeting = 'Selamat pagi! ☀️';
    else if (hour < 15) greeting = 'Selamat siang! 🌤️';
    else if (hour < 18) greeting = 'Selamat sore! 🌅';
    else greeting = 'Selamat malam! 🌙';

    return `${greeting} Saya adalah TRAVELLO, asisten travel pintar dengan database pariwisata lengkap Indonesia.\n\n` +
           `🎯 *Saya bisa memberikan informasi detail tentang:*\n` +
           `• 📍 **Destinasi Wisata** - Deskripsi lengkap, fasilitas, harga tiket, waktu terbaik\n` +
           `• 🏨 **Akomodasi** - Hotel, villa, resort dengan detail fasilitas dan harga\n` +
           `• 🍜 **Kuliner** - Restoran, makanan khas, rekomendasi halal\n` +
           `• 🚗 **Transportasi** - Rute, harga, durasi perjalanan\n` +
           `• 💰 **Budget Planning** - Estimasi biaya, tips hemat\n` +
           `• 📅 **Travel Tips** - Panduan lengkap, cuaca, packing list\n\n` +
           `**Contoh pertanyaan detail:**\n` +
           `• "Jelaskan Pantai Kuta Bali secara lengkap"\n` +
           `• "Berapa harga tiket Borobudur dan apa saja fasilitasnya?"\n` +
           `• "Hotel murah dekat Malioboro dengan sarapan"\n` +
           `• "Restoran halal terkenal di Padang"\n` +
           `• "Rute Jakarta ke Bandung dan ongkosnya"\n` +
           `• "Tips liburan hemat ke Bali 3 hari 2 malam"\n\n` +
           `💡 *Saya akan memberikan jawaban yang sangat detail untuk setiap destinasi yang Anda tanyakan!* 🌏`;
  }

  /**
   * Generate contextual suggestions
   */
  generateContextualSuggestions(response, relatedData) {
    const suggestions = [];
    const lowerResponse = response.toLowerCase();

    // Based on response content
    if (lowerResponse.includes('bali')) {
      suggestions.push('Hotel murah di Bali', 'Transportasi di Bali', 'Makanan halal Bali');
    } else if (lowerResponse.includes('yogyakarta') || lowerResponse.includes('jogja')) {
      suggestions.push('Candi Borobudur', 'Hotel dekat Malioboro', 'Makanan khas Jogja');
    } else if (lowerResponse.includes('hotel')) {
      suggestions.push('Hotel bintang 3', 'Villa untuk keluarga', 'Hostel backpacker');
    } else if (lowerResponse.includes('budget')) {
      suggestions.push('Tips hemat traveling', 'Paket wisata murah', 'Hostel terbaik');
    } else if (lowerResponse.includes('transportasi')) {
      suggestions.push('Sewa mobil', 'Tiket pesawat murah', 'Kereta api');
    } else if (lowerResponse.includes('makanan') || lowerResponse.includes('restoran')) {
      suggestions.push('Makanan halal', 'Kuliner khas', 'Restoran keluarga');
    } else {
      suggestions.push('Destinasi populer', 'Hotel terdekat', 'Tips traveling');
    }

    // Based on related data
    if (relatedData.destinations && relatedData.destinations.length > 0) {
      const dest = relatedData.destinations[0];
      suggestions.push(`Hotel di ${dest.city}`, `Transportasi ke ${dest.name}`, `Makanan di ${dest.city}`);
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Generate contextual response based on message and mock data
   */
  async generateContextualResponse(message, history) {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced keyword detection for detailed travel queries
    const hasDestinationKeyword = lowerMessage.match(/wisata|destinasi|tempat|kunjungan|pantai|gunung|candi|pulau|danau|air terjun|jelaskan|detail|lengkap/);
    const hasAccommodationKeyword = lowerMessage.match(/hotel|penginapan|villa|resort|hostel|menginap|stay/);
    const hasRestaurantKeyword = lowerMessage.match(/makan|restoran|kuliner|food|cafe|warung|makanan/);
    const hasBudgetKeyword = lowerMessage.match(/budget|harga|murah|hemat|biaya|ongkos/);
    const hasTipsKeyword = lowerMessage.match(/tips|panduan|cara|petunjuk|saran|rekomendasi/);
    const hasDetailKeyword = lowerMessage.match(/detail|lengkap|jelaskan|informasi|berapa|apa saja/);

    // Extract locations
    const locations = this.extractLocations(message);
    const budget = this.extractBudget(message);

    let response = '';
    let relatedData = {};

    try {
      // Enhanced destination search with detailed responses
      if (hasDestinationKeyword && locations.length > 0) {
        const destinations = await this.searchDestinations(locations[0], 5); // Increased limit for more options
        if (destinations.length > 0) {
          response += this.formatDestinations(destinations);
          relatedData.destinations = destinations;
          
          // Add additional detailed information if user asks for details
          if (hasDetailKeyword) {
            response += this.generateDetailedDestinationInfo(destinations[0]);
          }
        }
      }

      // Search accommodations
      if (hasAccommodationKeyword && locations.length > 0) {
        const accommodations = await this.searchAccommodations(
          locations[0], 
          locations[1], 
          budget?.maxPrice
        );
        if (accommodations.length > 0) {
          response += this.formatAccommodations(accommodations);
          relatedData.accommodations = accommodations;
        }
      }

      // Search restaurants
      if (hasRestaurantKeyword && locations.length > 0) {
        const restaurants = await this.searchRestaurants(
          locations[0], 
          locations[1], 
          budget?.priceRange
        );
        if (restaurants.length > 0) {
          response += this.formatRestaurants(restaurants);
          relatedData.restaurants = restaurants;
        }
      }

      // If no database results, provide helpful default response
      if (!response) {
        response = this.generateDefaultResponse(message);
      } else {
        response += `\n\n💬 *Ada pertanyaan lain tentang destinasi ini? Tanya saja detailnya!*`;
      }

    } catch (error) {
      console.error('Error generating contextual response:', error);
      response = this.generateDefaultResponse(message);
    }

    return response;
  }

  /**
   * Main enhanced chat endpoint
   */
  async chat(req, res) {
    try {
      const { message, sessionId, history } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          data: { response: '', timestamp: new Date().toISOString() }
        });
      }

      // Validate input
      if (!message || message.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Pesan tidak boleh kosong'
        });
      }

      // Generate session ID
      const currentSessionId = sessionId || `session_${user.id}_${Date.now()}`;

      // Generate contextual response using mock data
      const contextualResponse = await this.generateContextualResponse(message, []);

      // Generate suggestions
      const suggestions = this.generateContextualSuggestions(contextualResponse, {});

      const chatResponse = {
        success: true,
        data: {
          response: contextualResponse,
          timestamp: new Date().toISOString(),
          sessionId: currentSessionId,
          suggestions
        }
      };

      // Log for monitoring
      console.log(`[${new Date().toISOString()}] Enhanced Tourism Chat Success:`, {
        userId: user.id,
        sessionId: currentSessionId,
        messageLength: message.length,
        responseLength: contextualResponse.length,
        hasMockDataResults: contextualResponse.includes('Ditemukan')
      });

      return res.json(chatResponse);

    } catch (error) {
      console.error('Enhanced Tourism Chat API Error:', error);

      const errorResponse = {
        success: false,
        error: 'Gagal menghasilkan respons. Silakan coba lagi.',
        data: {
          response: '',
          timestamp: new Date().toISOString(),
          sessionId: ''
        }
      };

      return res.status(500).json(errorResponse);
    }
  }

  /**
   * Health check for enhanced tourism chat
   */
  async healthCheck(req, res) {
    try {
      return res.status(200).json({
        success: true,
        data: {
          status: 'Healthy',
          service: 'Enhanced Tourism Chat Bot',
          features: [
            'Mock data responses',
            'Comprehensive tourism data',
            'Contextual responses',
            'Smart search algorithms',
            'Budget-aware recommendations',
            'Location-based suggestions',
            'Multi-language support (Indonesian)',
            'Session management',
            'Detailed destination information'
          ],
          database: 'Mock Data (Ready for Production)',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Health check failed',
        data: {
          status: 'Unhealthy',
          service: 'Enhanced Tourism Chat Bot',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get suggestions
   */
  async getSuggestions(req, res) {
    try {
      const { sessionId } = req.query;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentSessionId = sessionId || `session_${user.id}`;
      
      // Generate contextual suggestions
      const suggestions = this.generateContextualSuggestions('', {});

      return res.json({
        success: true,
        data: {
          suggestions,
          sessionId: currentSessionId,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Get Suggestions Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate suggestions'
      });
    }
  }
}

module.exports = { EnhancedTourismChatController };
