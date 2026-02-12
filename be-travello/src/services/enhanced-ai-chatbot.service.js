/**
 * Enhanced AI Chatbot Service
 * Advanced features: conversation flows, proactive suggestions, context awareness
 * Integration with Google Gemini API for intelligent responses
 */

const { chatWithGemini } = require('./gemini.servce.js');
const { 
  createAIMessage,
  getAIMessagesBySession,
  createAISession,
  getAISessionById,
  createAISuggestions,
  getKnowledgeBase,
  logAnalytics,
  updateKnowledgeBaseUsage,
  initAIChatbotDB
} = require('../models/AIChatbot.model.js');

class EnhancedAIChatbotService {
  constructor() {
    this.contextMemory = new Map(); // Session-based memory
    this.userProfiles = new Map(); // User preference memory
    this.conversationFlows = this.initializeConversationFlows();
    this.proactiveTriggers = this.initializeProactiveTriggers();
    this.responseTemplates = this.initializeResponseTemplates();
    this.trendingCache = null;
    this.lastTrendingUpdate = 0;
    this.trendingUpdateInterval = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Generate AI response using Gemini API with enhanced context
   */
  async generateResponse(userMessage, history = [], sessionId) {
    try {
      console.log('🤖 Generating enhanced AI response using Gemini API');
      
      // Format history for Gemini
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Get session context
      const sessionContext = this.getSessionContext(sessionId);
      
      // Build enhanced prompt with context
      let enhancedPrompt = this.buildEnhancedPrompt(userMessage, sessionContext);
      
      // Use Gemini service for response
      const response = await chatWithGemini(enhancedPrompt, formattedHistory);

      // Extract topics for context
      const topics = this.extractTopics(response);
      this.updateSessionContext(sessionId, {
        lastMessage: userMessage,
        lastResponse: response,
        previousTopics: [...(sessionContext.previousTopics || []), ...topics].slice(-5)
      });

      console.log('✅ Enhanced AI response generated successfully');
      return response;

    } catch (error) {
      console.error('❌ Error generating enhanced AI response:', error);
      return this.generateFallbackResponse(userMessage);
    }
  }

  /**
   * Generate automatic response with trending data
   */
  async generateAutomaticResponse(sessionId) {
    try {
      const sessionContext = this.getSessionContext(sessionId);
      const timeSinceLastMessage = Date.now() - (sessionContext.lastMessageTime || 0);
      
      // Only trigger auto-response if no activity for 5 minutes
      if (timeSinceLastMessage < 5 * 60 * 1000) {
        return null;
      }

      const autoPrompt = `Berdasarkan konteks percakapan kita, berikan respons yang proaktif dan membantu. 
        Topik terakhir: ${sessionContext.lastTopic || 'Tidak ada'}
        Waktu tunggu: ${Math.round(timeSinceLastMessage / 60000)} menit`;

      const response = await chatWithGemini(autoPrompt, []);

      console.log('✅ Automatic response generated');
      return response;

    } catch (error) {
      console.error('❌ Error generating automatic response:', error);
      return null;
    }
  }

  /**
   * Generate welcome message with trending data
   */
  async generateWelcomeMessage(sessionId) {
    try {
      const welcomePrompt = `Selamat datang di Travello Assistant! 
        Saya adalah asisten AI cerdas yang siap membantu perjalanan Anda.
        Berikan informasi tentang diri Anda dan apa yang bisa saya bantu hari ini.`;

      const response = await chatWithGemini(welcomePrompt, []);

      // Initialize session context
      this.updateSessionContext(sessionId, {
        isWelcome: true,
        startTime: Date.now()
      });

      return response;

    } catch (error) {
      console.error('❌ Error generating welcome message:', error);
      return '🤖 Selamat datang di Travello Assistant! Saya siap membantu perjalanan Anda dengan informasi terpercaya dan rekomendasi terbaik.';
    }
  }

  /**
   * Build enhanced prompt with context
   */
  buildEnhancedPrompt(userMessage, sessionContext) {
    let prompt = `Anda adalah Travello Assistant, asisten AI profesional untuk pariwisata.`;

    if (sessionContext.previousTopics && sessionContext.previousTopics.length > 0) {
      prompt += `\n\nKonteks percakapan sebelumnya: ${sessionContext.previousTopics.join(', ')}`;
    }

    if (sessionContext.userProfile) {
      prompt += `\n\nPreferensi pengguna: ${JSON.stringify(sessionContext.userProfile)}`;
    }

    prompt += `\n\nPesan pengguna: ${userMessage}`;
    prompt += `\n\nBerikan respons yang membantu, informatif, dan sesuai dengan kebutuhan perjalanan.`;

    return prompt;
  }

  /**
   * Get session context
   */
  getSessionContext(sessionId) {
    if (!this.contextMemory.has(sessionId)) {
      this.contextMemory.set(sessionId, {
        sessionId,
        userId: null,
        startTime: Date.now(),
        previousTopics: [],
        currentFlow: null,
        currentStep: 0,
        lastIntent: null,
        messageCount: 0
      });
    }
    return this.contextMemory.get(sessionId);
  }

  /**
   * Update session context
   */
  updateSessionContext(sessionId, updates) {
    const context = this.getSessionContext(sessionId);
    Object.assign(context, updates);
    context.messageCount = (context.messageCount || 0) + 1;
    this.contextMemory.set(sessionId, context);
  }

  /**
   * Clear session flow
   */
  clearSessionFlow(sessionId) {
    const context = this.getSessionContext(sessionId);
    context.currentFlow = null;
    context.currentStep = 0;
    this.contextMemory.set(sessionId, context);
  }

  /**
   * Detect intent from message
   */
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Travel-related intents
    if (lowerMessage.includes('destinasi') || lowerMessage.includes('wisata') || lowerMessage.includes('liburan')) {
      return { category: 'travel', confidence: 0.9, matchedKeywords: ['destinasi', 'wisata'] };
    }
    
    // Copywriter intents
    if (lowerMessage.includes('copywriter') || lowerMessage.includes('konten') || lowerMessage.includes('tulisan')) {
      return { category: 'copywriter', confidence: 0.9, matchedKeywords: ['copywriter', 'konten'] };
    }
    
    // Pricing intents
    if (lowerMessage.includes('harga') || lowerMessage.includes('biaya') || lowerMessage.includes('tarif')) {
      return { category: 'pricing', confidence: 0.8, matchedKeywords: ['harga', 'biaya'] };
    }
    
    return { category: 'general', confidence: 0.5, matchedKeywords: [] };
  }

  /**
   * Generate contextual suggestions
   */
  generateContextualSuggestions(response, history, sessionId) {
    const sessionContext = this.getSessionContext(sessionId);
    const intent = this.detectIntent(response);
    
    // Generate suggestions based on intent
    switch (intent.category) {
      case 'travel':
        return [
          'Destinasi populer bulan ini',
          'Paket hemat traveling',
          'Tips liburan keluarga',
          'Custom itinerary planning'
        ];
      
      case 'copywriter':
        return [
          'Lihat portfolio copywriter',
          'Dapatkan penawaran khusus',
          'Konsultasi gratis konten',
          'Proses pengerjaan copywriting'
        ];
      
      case 'pricing':
        return [
          'Bandingkan paket harga',
          'Dapatkan diskon spesial',
          'Cek promo terbaru',
          'Pembayaran cicilan'
        ];
      
      default:
        return [
          'Cara kerja layanan kami',
          'Hubungi customer service',
          'Lihat testimonial klien',
          'FAQ lengkap'
        ];
    }
  }

  /**
   * Check if should trigger auto response
   */
  shouldTriggerAutoResponse(sessionContext, messageCount) {
    // Trigger auto response after 3 messages with no response for 2 minutes
    return messageCount >= 3 && 
           (Date.now() - (sessionContext.lastMessageTime || 0)) > 2 * 60 * 1000;
  }

  /**
   * Get analytics data
   */
  getAnalytics() {
    return {
      totalSessions: this.contextMemory.size,
      activeFlows: Array.from(this.contextMemory.values()).filter(ctx => ctx.currentFlow !== null).length,
      popularIntents: this.getPopularIntents(),
      averageMessagesPerSession: this.getAverageMessagesPerSession()
    };
  }

  /**
   * Get popular intents
   */
  getPopularIntents() {
    const intents = {};
    Array.from(this.contextMemory.values()).forEach(context => {
      if (context.lastIntent) {
        intents[context.lastIntent] = (intents[context.lastIntent] || 0) + 1;
      }
    });
    return intents;
  }

  /**
   * Get average messages per session
   */
  getAverageMessagesPerSession() {
    const sessions = Array.from(this.contextMemory.values());
    if (sessions.length === 0) return 0;
    
    const totalMessages = sessions.reduce((sum, session) => sum + (session.messageCount || 0), 0);
    return Math.round(totalMessages / sessions.length);
  }

  /**
   * Extract topics from response
   */
  extractTopics(text) {
    const topics = [];
    const topicKeywords = [
      'bali', 'jakarta', 'yogyakarta', 'hotel', 'pesawat', 'wisata',
      'copywriter', 'konten', 'harga', 'paket', 'liburan'
    ];
    
    const lowerText = text.toLowerCase();
    topicKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        topics.push(keyword);
      }
    });
    
    return topics.slice(0, 5);
  }

  /**
   * Generate fallback response
   */
  generateFallbackResponse(message) {
    return `Maaf, saya sedang mengalami gangguan. Namun, saya siap membantu Anda dengan informasi perjalanan. Silakan coba lagi atau hubungi customer service kami untuk bantuan lebih lanjut.`;
  }

  /**
   * Initialize conversation flows
   */
  initializeConversationFlows() {
    return {
      booking: [
        'ask_destination',
        'ask_dates',
        'ask_budget',
        'confirm_booking'
      ],
      inquiry: [
        'ask_topic',
        'provide_info',
        'offer_help'
      ]
    };
  }

  /**
   * Initialize proactive triggers
   */
  initializeProactiveTriggers() {
    return {
      timeBased: ['greeting_morning', 'greeting_afternoon', 'greeting_evening'],
      inactivity: ['proactive_help', 'suggestion_offer'],
      context: ['topic_follow_up', 'clarification_request']
    };
  }

  /**
   * Initialize response templates
   */
  initializeResponseTemplates() {
    return {
      greeting: 'Selamat {time_of_day}! Saya Travello Assistant, siap membantu perjalanan Anda.',
      help: 'Bagaimana saya bisa membantu perjalanan Anda hari ini?',
      error: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
      closing: 'Terima kasih telah menggunakan Travello Assistant!'
    };
  }
}

module.exports = EnhancedAIChatbotService;
