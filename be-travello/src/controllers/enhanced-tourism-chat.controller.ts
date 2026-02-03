import { Request, Response } from 'express';
import { UserAttributes } from '../models/User.model.js';
import { 
  createMessage, 
  findBySessionId, 
  findByUserId,
  ChatMessage 
} from '../models/ChatMessage.model.js';
import { Op, Sequelize } from 'sequelize';

// Initialize Sequelize connection for tourism database
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'travello_db',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

interface TourismDestination {
  id: number;
  name: string;
  description: string;
  category: string;
  province: string;
  city: string;
  rating: number;
  ticket_price_adult: number;
  image_url?: string;
  best_visit_time: string;
  estimated_duration: string;
  facilities: any;
}

interface TourismAccommodation {
  id: number;
  name: string;
  description: string;
  type: string;
  star_rating: number;
  province: string;
  city: string;
  rating: number;
  price_per_night: number;
  image_url?: string;
  facilities: any;
  breakfast_included: boolean;
  free_wifi: boolean;
  pool: boolean;
}

interface TourismRestaurant {
  id: number;
  name: string;
  description: string;
  cuisine_type: string;
  specialty_dish: string;
  province: string;
  city: string;
  rating: number;
  price_range: string;
  average_price: number;
  halal_certified: boolean;
}

interface TourismTransportation {
  id: number;
  name: string;
  type: string;
  route_from: string;
  route_to: string;
  duration: string;
  base_price: number;
  company: string;
  facilities: any;
}

interface ChatRequest {
  message: string;
  sessionId?: string;
  history?: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
}

interface ChatResponse {
  success: boolean;
  data?: {
    response: string;
    timestamp: string;
    sessionId: string;
    suggestions?: string[];
    relatedData?: any;
  };
  error?: string;
}

export class EnhancedTourismChatController {
  constructor() {
    this.initializeDatabaseConnection();
  }

  private async initializeDatabaseConnection(): Promise<void> {
    try {
      await sequelize.authenticate();
      console.log('Tourism database connected successfully');
    } catch (error) {
      console.error('Tourism database connection failed:', error);
    }
  }

  /**
   * Search destinations from database
   */
  private async searchDestinations(query: string, limit: number = 5): Promise<TourismDestination[]> {
    try {
      const [results] = await sequelize.query(`
        SELECT id, name, description, category, province, city, rating, 
               ticket_price_adult, image_url, best_visit_time, estimated_duration, facilities,
               MATCH(name, description, city) AGAINST(:query IN NATURAL LANGUAGE MODE) as relevance_score
        FROM destinations 
        WHERE is_active = TRUE 
          AND (MATCH(name, description, city) AGAINST(:query IN NATURAL LANGUAGE MODE) 
               OR name LIKE :likeQuery 
               OR city LIKE :likeQuery 
               OR province LIKE :likeQuery)
        ORDER BY relevance_score DESC, rating DESC
        LIMIT :limit
      `, {
        replacements: { 
          query, 
          likeQuery: `%${query}%`,
          limit 
        },
        type: sequelize.QueryTypes.SELECT
      });

      return results as TourismDestination[];
    } catch (error) {
      console.error('Error searching destinations:', error);
      return [];
    }
  }

  /**
   * Search accommodations from database
   */
  private async searchAccommodations(query: string, province?: string, maxPrice?: number, limit: number = 5): Promise<TourismAccommodation[]> {
    try {
      let whereConditions = ['is_active = TRUE'];
      let replacements: any = { query, likeQuery: `%${query}%`, limit };

      if (province) {
        whereConditions.push('province = :province');
        replacements.province = province;
      }

      if (maxPrice) {
        whereConditions.push('price_per_night <= :maxPrice');
        replacements.maxPrice = maxPrice;
      }

      const sql = `
        SELECT id, name, description, type, star_rating, province, city, rating,
               price_per_night, image_url, facilities, breakfast_included, free_wifi, pool,
               MATCH(name, description, city) AGAINST(:query IN NATURAL LANGUAGE MODE) as relevance_score
        FROM accommodations 
        WHERE ${whereConditions.join(' AND ')}
          AND (MATCH(name, description, city) AGAINST(:query IN NATURAL LANGUAGE MODE) 
               OR name LIKE :likeQuery 
               OR city LIKE :likeQuery)
        ORDER BY relevance_score DESC, rating DESC, price_per_night ASC
        LIMIT :limit
      `;

      const [results] = await sequelize.query(sql, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      return results as TourismAccommodation[];
    } catch (error) {
      console.error('Error searching accommodations:', error);
      return [];
    }
  }

  /**
   * Search restaurants from database
   */
  private async searchRestaurants(query: string, province?: string, priceRange?: string, limit: number = 5): Promise<TourismRestaurant[]> {
    try {
      let whereConditions = ['is_active = TRUE'];
      let replacements: any = { query, likeQuery: `%${query}%`, limit };

      if (province) {
        whereConditions.push('province = :province');
        replacements.province = province;
      }

      if (priceRange) {
        whereConditions.push('price_range = :priceRange');
        replacements.priceRange = priceRange;
      }

      const sql = `
        SELECT id, name, description, cuisine_type, specialty_dish, province, city, rating,
               price_range, average_price, halal_certified,
               MATCH(name, description, specialty_dish, city) AGAINST(:query IN NATURAL LANGUAGE MODE) as relevance_score
        FROM restaurants 
        WHERE ${whereConditions.join(' AND ')}
          AND (MATCH(name, description, specialty_dish, city) AGAINST(:query IN NATURAL LANGUAGE MODE) 
               OR name LIKE :likeQuery 
               OR specialty_dish LIKE :likeQuery)
        ORDER BY relevance_score DESC, rating DESC
        LIMIT :limit
      `;

      const [results] = await sequelize.query(sql, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      return results as TourismRestaurant[];
    } catch (error) {
      console.error('Error searching restaurants:', error);
      return [];
    }
  }

  /**
   * Search transportation from database
   */
  private async searchTransportation(from: string, to: string, type?: string, limit: number = 5): Promise<TourismTransportation[]> {
    try {
      let whereConditions = ['is_active = TRUE'];
      let replacements: any = { from, to, fromLike: `%${from}%`, toLike: `%${to}%`, limit };

      if (type) {
        whereConditions.push('type = :type');
        replacements.type = type;
      }

      const sql = `
        SELECT id, name, type, route_from, route_to, duration, base_price, company, facilities,
               MATCH(name, route_from, route_to) AGAINST(:from IN NATURAL LANGUAGE MODE) as relevance_score
        FROM transportation 
        WHERE ${whereConditions.join(' AND ')}
          AND (route_from LIKE :fromLike OR route_to LIKE :toLike)
        ORDER BY relevance_score DESC, base_price ASC
        LIMIT :limit
      `;

      const [results] = await sequelize.query(sql, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      return results as TourismTransportation[];
    } catch (error) {
      console.error('Error searching transportation:', error);
      return [];
    }
  }

  /**
   * Get travel tips from database
   */
  private async getTravelTips(category: string, audience?: string, province?: string, limit: number = 3): Promise<any[]> {
    try {
      let whereConditions = ['is_active = TRUE'];
      let replacements: any = { category, limit };

      if (audience) {
        whereConditions.push('target_audience = :audience');
        replacements.audience = audience;
      }

      if (province) {
        whereConditions.push('province = :province');
        replacements.province = province;
      }

      const sql = `
        SELECT id, title, content, category, target_audience, priority_level,
               MATCH(title, content) AGAINST(:category IN NATURAL LANGUAGE MODE) as relevance_score
        FROM travel_tips 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY priority_level DESC, relevance_score DESC
        LIMIT :limit
      `;

      const [results] = await sequelize.query(sql, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      return results;
    } catch (error) {
      console.error('Error getting travel tips:', error);
      return [];
    }
  }

  /**
   * Format destination results for chat response
   */
  private formatDestinations(destinations: TourismDestination[]): string {
    if (destinations.length === 0) return '';

    let response = `🏝️ **Destinasi Wisata Ditemukan:**\n\n`;
    
    destinations.forEach((dest, index) => {
      response += `${index + 1}. **${dest.name}** (${dest.city}, ${dest.province})\n`;
      response += `   📍 ${dest.description.substring(0, 100)}...\n`;
      response += `   ⭐ Rating: ${dest.rating}/5 | 💰 Tiket: Rp ${dest.ticket_price_adult.toLocaleString('id-ID')}\n`;
      response += `   🕐 Best time: ${dest.best_visit_time} | ⏱️ Durasi: ${dest.estimated_duration}\n`;
      if (dest.facilities && Array.isArray(dest.facilities)) {
        response += `   🏗️ Fasilitas: ${dest.facilities.slice(0, 3).join(', ')}\n`;
      }
      response += '\n';
    });

    return response;
  }

  /**
   * Format accommodation results for chat response
   */
  private formatAccommodations(accommodations: TourismAccommodation[]): string {
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
  private formatRestaurants(restaurants: TourismRestaurant[]): string {
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
   * Format transportation results for chat response
   */
  private formatTransportation(transportation: TourismTransportation[]): string {
    if (transportation.length === 0) return '';

    let response = `🚗 **Transportasi Ditemukan:**\n\n`;
    
    transportation.forEach((trans, index) => {
      response += `${index + 1}. **${trans.name}** (${trans.type})\n`;
      response += `   🛣️ ${trans.route_from} → ${trans.route_to}\n`;
      response += `   ⏱️ Durasi: ${trans.duration} | 💰 Rp ${trans.base_price.toLocaleString('id-ID')}\n`;
      response += `   🏢 ${trans.company}\n\n`;
    });

    return response;
  }

  /**
   * Generate contextual response based on message and database results
   */
  private async generateContextualResponse(message: string, history: any[]): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Extract key information from message
    const hasDestinationKeyword = lowerMessage.match(/wisata|destinasi|tempat|kunjungan|pantai|gunung|candi|pulau|danau|air terjun/);
    const hasAccommodationKeyword = lowerMessage.match(/hotel|penginapan|villa|resort|hostel|menginap|stay/);
    const hasRestaurantKeyword = lowerMessage.match(/makan|restoran|kuliner|food|cafe|warung|makanan/);
    const hasTransportKeyword = lowerMessage.match(/transportasi|kendaraan|mobil|bus|kereta|pesawat|travel|cara ke|menuju/);
    const hasBudgetKeyword = lowerMessage.match(/budget|harga|murah|hemat|biaya|ongkos/);
    const hasTipsKeyword = lowerMessage.match(/tips|panduan|cara|petunjuk|saran|rekomendasi/);

    // Extract locations
    const locations = this.extractLocations(message);
    const budget = this.extractBudget(message);
    const transportRoute = this.extractTransportRoute(message);

    let response = '';
    let relatedData: any = {};

    try {
      // Search destinations
      if (hasDestinationKeyword && locations.length > 0) {
        const destinations = await this.searchDestinations(locations[0], 3);
        if (destinations.length > 0) {
          response += this.formatDestinations(destinations);
          relatedData.destinations = destinations;
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

      // Search transportation
      if (hasTransportKeyword && transportRoute) {
        const transportation = await this.searchTransportation(
          transportRoute.from, 
          transportRoute.to
        );
        if (transportation.length > 0) {
          response += this.formatTransportation(transportation);
          relatedData.transportation = transportation;
        }
      }

      // Get travel tips
      if (hasTipsKeyword) {
        let category = 'general';
        if (hasBudgetKeyword) category = 'budget';
        if (hasTransportKeyword) category = 'transportation';
        
        const tips = await this.getTravelTips(category, 'all', locations[0]);
        if (tips.length > 0) {
          response += `💡 **Tips Perjalanan:**\n\n`;
          tips.forEach((tip, index) => {
            response += `${index + 1}. **${tip.title}**\n`;
            response += `   ${tip.content.substring(0, 150)}...\n\n`;
          });
          relatedData.tips = tips;
        }
      }

      // If no database results, provide helpful default response
      if (!response) {
        response = this.generateDefaultResponse(message);
      } else {
        response += `💬 *Ada pertanyaan lain tentang destinasi ini? Tanya saja detailnya!*`;
      }

    } catch (error) {
      console.error('Error generating contextual response:', error);
      response = this.generateDefaultResponse(message);
    }

    return response;
  }

  /**
   * Extract locations from message
   */
  private extractLocations(message: string): string[] {
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
      'papua', 'jayapura', 'sorong', 'manokwari', 'biak', 'merauke'
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
  private extractBudget(message: string): { maxPrice?: number; priceRange?: string } | null {
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
   * Extract transportation route from message
   */
  private extractTransportRoute(message: string): { from: string; to: string } | null {
    const patterns = [
      /dari\s+(\w+)\s+ke\s+(\w+)/i,
      /(\w+)\s+ke\s+(\w+)/i,
      /from\s+(\w+)\s+to\s+(\w+)/i
    ];

    for (const pattern of patterns) {
      const match = message.toLowerCase().match(pattern);
      if (match) {
        return { from: match[1], to: match[2] };
      }
    }

    return null;
  }

  /**
   * Generate default response
   */
  private generateDefaultResponse(message: string): string {
    const hour = new Date().getHours();
    let greeting = 'Halo!';
    
    if (hour < 12) greeting = 'Selamat pagi! ☀️';
    else if (hour < 15) greeting = 'Selamat siang! 🌤️';
    else if (hour < 18) greeting = 'Selamat sore! 🌅';
    else greeting = 'Selamat malam! 🌙';

    return `${greeting} Saya adalah TRAVELLO, asisten travel pintar dengan database pariwisata lengkap Indonesia.\n\n` +
           `🎯 *Saya bisa membantu Anda dengan:*\n` +
           `• 📍 Destinasi wisata di seluruh Indonesia\n` +
           `• 🏨 Hotel, villa, resort, dan penginapan\n` +
           `• 🍜 Restoran dan kuliner khas daerah\n` +
           `• 🚗 Info transportasi dan rute perjalanan\n` +
           `• 💰 Tips budget traveling\n` +
           `• 📅 Info cuaca dan waktu terbaik berkunjung\n\n` +
           `**Cara tanya:**\n` +
           `• "Wisata di Bali"\n` +
           `• "Hotel murah di Yogyakarta"\n` +
           `• "Restoran halal di Jakarta"\n` +
           `• "Transportasi Jakarta ke Surabaya"\n` +
           `• "Tips backpacker Indonesia"\n\n` +
           `Apa yang ingin Anda ketahui tentang traveling di Indonesia? 🌏`;
  }

  /**
   * Generate contextual suggestions
   */
  private generateContextualSuggestions(response: string, relatedData: any): string[] {
    const suggestions: string[] = [];
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
   * Main enhanced chat endpoint
   */
  async chat(req: Request, res: Response): Promise<Response> {
    try {
      const { message, sessionId, history }: ChatRequest = req.body;
      const user = req.user as UserAttributes;

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

      // Get chat history for context
      const dbHistory = await findBySessionId(currentSessionId, 10);

      // Generate contextual response using database
      const contextualResponse = await this.generateContextualResponse(message, dbHistory);

      // Save user message
      await createMessage({
        sessionId: currentSessionId,
        userId: user.id,
        message: message,
        response: '',
        role: 'user',
        timestamp: new Date()
      });

      // Save AI response
      await createMessage({
        sessionId: currentSessionId,
        userId: user.id,
        message: '',
        response: contextualResponse,
        role: 'ai',
        timestamp: new Date()
      });

      // Generate suggestions
      const suggestions = this.generateContextualSuggestions(contextualResponse, {});

      const chatResponse: ChatResponse = {
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
        hasDatabaseResults: contextualResponse.includes('Ditemukan')
      });

      return res.json(chatResponse);

    } catch (error: any) {
      console.error('Enhanced Tourism Chat API Error:', error);

      const errorResponse: ChatResponse = {
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
   * Get chat history (unchanged)
   */
  async getHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { sessionId, page = 1, limit = 20 } = req.query;
      const user = req.user as UserAttributes;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentSessionId = (sessionId as string) || `session_${user.id}`;
      const history = await findBySessionId(currentSessionId, Number(limit));
      
      const formattedHistory = history.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.message || msg.response,
        timestamp: msg.timestamp,
        sessionId: msg.sessionId
      }));

      return res.json({
        success: true,
        data: {
          history: formattedHistory,
          sessionId: currentSessionId,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: formattedHistory.length
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Get History Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch chat history'
      });
    }
  }

  /**
   * Get suggestions (unchanged)
   */
  async getSuggestions(req: Request, res: Response): Promise<Response> {
    try {
      const { sessionId } = req.query;
      const user = req.user as UserAttributes;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentSessionId = (sessionId as string) || `session_${user.id}`;
      const recentHistory = await findBySessionId(currentSessionId, 5);
      
      // Generate contextual suggestions based on last response
      const lastResponse = recentHistory[recentHistory.length - 1]?.response || '';
      const suggestions = this.generateContextualSuggestions(lastResponse, {});

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

  /**
   * Clear chat history (unchanged)
   */
  async clearChat(req: Request, res: Response): Promise<Response> {
    try {
      const { sessionId } = req.query;
      const user = req.user as UserAttributes;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentSessionId = (sessionId as string) || `session_${user.id}`;
      
      // Delete all messages in session
      const deletedCount = await ChatMessage.destroy({
        where: { sessionId: currentSessionId }
      });

      return res.json({
        success: true,
        data: {
          message: 'Chat history cleared successfully',
          sessionId: currentSessionId,
          deletedCount,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Clear Chat Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to clear chat history'
      });
    }
  }

  /**
   * Health check for enhanced tourism chat
   */
  async healthCheck(req: Request, res: Response): Promise<Response> {
    try {
      // Test database connection
      await sequelize.authenticate();
      
      return res.status(200).json({
        success: true,
        data: {
          status: 'Healthy',
          service: 'Enhanced Tourism Chat Bot',
          features: [
            'Real-time database queries',
            'Comprehensive tourism data',
            'Contextual responses',
            'Smart search algorithms',
            'Budget-aware recommendations',
            'Location-based suggestions',
            'Multi-language support (Indonesian)',
            'Session management',
            'Chat history'
          ],
          database: 'Connected',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        data: {
          status: 'Unhealthy',
          service: 'Enhanced Tourism Chat Bot',
          timestamp: new Date().toISOString()
        }
      });
    }
  }
}
