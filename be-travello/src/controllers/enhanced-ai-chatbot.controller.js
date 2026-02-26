/**
 * Enhanced AI Chatbot Controller
 * Advanced features: conversation flows, proactive suggestions, context awareness
 */

const EnhancedAIChatbotService = require('../services/enhanced-ai-chatbot.service.js');
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

class EnhancedAIChatbotController {
  constructor() {
    this.aiService = new EnhancedAIChatbotService();
  }

  /**
   * Enhanced chat endpoint with conversation flows, proactive features, and automatic answers
   */
  async chat(req, res) {
    const startTime = Date.now();
    
    try {
      const { message, sessionId, history, autoTrigger = false } = req.body;
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
      const currentSessionId = sessionId || `enhanced_ai_session_${user.id}_${Date.now()}`;

      // Initialize AI database if needed
      await initAIChatbotDB();

      // Get or create session with enhanced metadata
      let session = await getAISessionById(currentSessionId);
      if (!session) {
        session = await createAISession({
          sessionId: currentSessionId,
          userId: user.id,
          userName: user.username || user.displayName,
          userEmail: user.email,
          sessionMetadata: {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            source: 'enhanced-api',
            enhancedFeatures: true,
            autoTrigger: autoTrigger
          }
        });
      }

      // Get chat history for context
      const dbHistory = await getAIMessagesBySession(currentSessionId, 20); // Increased for better context

      // Check if automatic response should be triggered
      const sessionContext = this.aiService.getSessionContext(currentSessionId);
      let finalResponse;

      if (autoTrigger || this.aiService.shouldTriggerAutoResponse(sessionContext, dbHistory.length)) {
        // Generate automatic response with trending data
        finalResponse = await this.aiService.generateAutomaticResponse(currentSessionId);
      } else {
        // Generate AI response with enhanced features
        const aiResponseStart = Date.now();
        finalResponse = await this.aiService.generateResponse(message, dbHistory, currentSessionId);
        const processingTime = Date.now() - aiResponseStart;
      }

      // Detect intent with enhanced detection
      const intent = this.aiService.detectIntent(message);
      const confidence = intent ? intent.confidence : 0.50;

      // Get enhanced analytics data
      const enhancedAnalytics = this.aiService.getAnalytics();

      // Save user message with enhanced metadata
      await createAIMessage({
        sessionId: currentSessionId,
        messageId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        role: 'user',
        content: message,
        contentType: 'text',
        messageMetadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
          enhancedFeatures: true,
          intentDetected: intent?.category || 'unknown',
          autoTrigger: autoTrigger
        }
      });

      // Save AI response with enhanced metadata
      await createAIMessage({
        sessionId: currentSessionId,
        messageId: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'enhanced_ai_system',
        role: 'ai',
        content: finalResponse,
        contentType: 'markdown',
        messageMetadata: {
          model: 'travello-enhanced-ai-v3',
          version: '3.0.0',
          enhancedFeatures: true,
          hasFlow: this.aiService.getSessionContext(currentSessionId).currentFlow !== null,
          autoResponse: autoTrigger || this.aiService.shouldTriggerAutoResponse(sessionContext, dbHistory.length),
          trendingDataIncluded: true
        },
        processingTimeMs: Date.now() - startTime,
        modelUsed: 'travello-enhanced-ai-v3',
        intentDetected: intent?.category || 'general',
        confidenceScore: confidence
      });

      // Update knowledge base usage
      if (intent) {
        await updateKnowledgeBaseUsage(intent.category);
      }

      // Generate enhanced contextual suggestions
      const suggestions = this.aiService.generateContextualSuggestions(finalResponse, dbHistory, currentSessionId);

      // Save suggestions to database with enhanced categorization
      const suggestionsData = suggestions.map((text, index) => ({
        sessionId: currentSessionId,
        userId: user.id,
        suggestionText: text,
        suggestionCategory: this.categorizeSuggestion(text, intent),
        contextKeywords: [message.toLowerCase(), ...(intent?.matchedKeywords || [])]
      }));

      if (suggestionsData.length > 0) {
        await createAISuggestions(suggestionsData);
      }

      // Log enhanced analytics
      await this.logEnhancedAnalytics(currentSessionId, user.id, 'message_sent', {
        messageLength: message.length,
        intent: intent?.category,
        confidence,
        hasFlow: this.aiService.getSessionContext(currentSessionId).currentFlow !== null,
        suggestionsCount: suggestions.length,
        autoResponse: autoTrigger || this.aiService.shouldTriggerAutoResponse(sessionContext, dbHistory.length),
        trendingDataIncluded: true
      });

      const totalProcessingTime = Date.now() - startTime;

      const chatResponse = {
        success: true,
        data: {
          response: finalResponse,
          timestamp: new Date().toISOString(),
          sessionId: currentSessionId,
          suggestions,
          service: 'enhanced-ai-chatbot',
          processingTime: totalProcessingTime,
          intent: intent?.category || 'general',
          confidence: confidence,
          autoResponse: autoTrigger || this.aiService.shouldTriggerAutoResponse(sessionContext, dbHistory.length),
          analytics: {
            totalSessions: enhancedAnalytics.totalSessions,
            activeFlows: enhancedAnalytics.activeFlows,
            popularIntents: enhancedAnalytics.popularIntents,
            averageMessagesPerSession: enhancedAnalytics.averageMessagesPerSession
          },
          features: {
            hasConversationFlow: this.aiService.getSessionContext(currentSessionId).currentFlow !== null,
            hasProactiveSuggestions: suggestions.length > 0,
            hasContextAwareness: true,
            hasMemorySupport: true,
            hasTrendingData: true,
            hasAutoResponse: true
          }
        }
      };

      // Enhanced logging
      console.log(`[${new Date().toISOString()}] Enhanced AI Chatbot Success:`, {
        userId: user.id,
        sessionId: currentSessionId,
        messageLength: message.length,
        responseLength: finalResponse.length,
        processingTime: totalProcessingTime,
        intent: intent?.category,
        confidence: confidence,
        hasFlow: this.aiService.getSessionContext(currentSessionId).currentFlow !== null,
        suggestionsCount: suggestions.length,
        autoResponse: autoTrigger || this.aiService.shouldTriggerAutoResponse(sessionContext, dbHistory.length),
        enhancedFeatures: true
      });

      return res.json(chatResponse);

    } catch (error) {
      console.error('Enhanced AI Chatbot API Error:', error);

      // Log enhanced error analytics
      try {
        await this.logEnhancedAnalytics(req.body.sessionId, req.user?.id, 'error_occurred', {
          error: error.message,
          message: req.body.message,
          enhancedFeatures: true
        });
      } catch (analyticsError) {
        console.error('Failed to log enhanced error analytics:', analyticsError);
      }

      const errorResponse = {
        success: false,
        error: 'Gagal menghasilkan respons AI yang ditingkatkan. Silakan coba lagi.',
        data: {
          response: '',
          timestamp: new Date().toISOString(),
          sessionId: req.body.sessionId || '',
          enhancedFeatures: true
        }
      };

      return res.status(500).json(errorResponse);
    }
  }

  /**
   * Enhanced history with context analysis
   */
  async getHistory(req, res) {
    try {
      const { sessionId, page = 1, limit = 20, includeAnalytics = false } = req.query;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentSessionId = sessionId || `enhanced_ai_session_${user.id}`;
      const history = await getAIMessagesBySession(currentSessionId, Number(limit));
      
      const formattedHistory = history.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
        sessionId: msg.sessionId,
        metadata: msg.messageMetadata,
        processingTime: msg.processingTimeMs,
        intent: msg.intentDetected,
        confidence: msg.confidenceScore
      }));

      const response = {
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
      };

      // Include analytics if requested
      if (includeAnalytics === 'true') {
        const sessionContext = this.aiService.getSessionContext(currentSessionId);
        response.data.sessionAnalytics = {
          messageCount: formattedHistory.length,
          hasActiveFlow: sessionContext.currentFlow !== null,
          currentFlow: sessionContext.currentFlow,
          currentStep: sessionContext.currentStep,
          lastIntent: sessionContext.lastIntent
        };
      }

      return res.json(response);

    } catch (error) {
      console.error('Get Enhanced AI Chat History Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch enhanced AI chat history'
      });
    }
  }

  /**
   * Enhanced suggestions with personalization
   */
  async getSuggestions(req, res) {
    try {
      const { sessionId, category, personalized = true } = req.query;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentSessionId = sessionId || `enhanced_ai_session_${user.id}`;
      
      // Get session context for personalization
      const sessionContext = this.aiService.getSessionContext(currentSessionId);
      
      // Generate personalized suggestions
      let suggestions = [];
      
      if (personalized === 'true' && sessionContext.lastIntent) {
        suggestions = this.aiService.generateContextualSuggestions(
          '', 
          await getAIMessagesBySession(currentSessionId, 5), 
          currentSessionId
        );
      } else {
        // Get generic suggestions by category
        suggestions = this.getGenericSuggestions(category);
      }

      return res.json({
        success: true,
        data: {
          suggestions,
          sessionId: currentSessionId,
          category: category || 'personalized',
          personalized: personalized === 'true',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Get Enhanced Suggestions Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch enhanced suggestions'
      });
    }
  }

  /**
   * Clear chat history with enhanced cleanup
   */
  async clearHistory(req, res) {
    try {
      const { sessionId } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentSessionId = sessionId || `enhanced_ai_session_${user.id}`;
      
      // Clear enhanced session context
      this.aiService.clearSessionFlow(currentSessionId);
      
      // Log cleanup analytics
      await this.logEnhancedAnalytics(currentSessionId, user.id, 'session_ended', {
        clearedBy: 'user_request',
        enhancedFeatures: true
      });

      return res.json({
        success: true,
        data: {
          message: 'Enhanced chat history cleared successfully',
          sessionId: currentSessionId,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Clear Enhanced History Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to clear enhanced chat history'
      });
    }
  }

  /**
   * Get automatic welcome message with trending data
   */
  async getWelcomeMessage(req, res) {
    try {
      const { sessionId } = req.query;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentSessionId = sessionId || `enhanced_ai_session_${user.id}_${Date.now()}`;
      
      // Generate welcome message with trending data
      const welcomeMessage = await this.aiService.generateWelcomeMessage(currentSessionId);

      return res.json({
        success: true,
        data: {
          welcomeMessage,
          sessionId: currentSessionId,
          timestamp: new Date().toISOString(),
          service: 'enhanced-ai-chatbot',
          features: {
            hasTrendingData: true,
            hasAutoResponse: true,
            hasContextAwareness: true
          }
        }
      });

    } catch (error) {
      console.error('Get Welcome Message Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate welcome message'
      });
    }
  }

  /**
   * Trigger automatic response based on context
   */
  async triggerAutoResponse(req, res) {
    try {
      const { sessionId } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentSessionId = sessionId || `enhanced_ai_session_${user.id}_${Date.now()}`;
      
      // Generate automatic response with trending data
      const autoResponse = await this.aiService.generateAutomaticResponse(currentSessionId);

      return res.json({
        success: true,
        data: {
          response: autoResponse,
          sessionId: currentSessionId,
          timestamp: new Date().toISOString(),
          service: 'enhanced-ai-chatbot',
          autoResponse: true,
          features: {
            hasTrendingData: true,
            hasAutoResponse: true,
            hasContextAwareness: true
          }
        }
      });

    } catch (error) {
      console.error('Trigger Auto Response Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate automatic response'
      });
    }
  }

  /**
   * Enhanced health check with analytics
   */
  async healthCheck(req, res) {
    try {
      const analytics = this.aiService.getAnalytics();
      
      return res.json({
        success: true,
        data: {
          status: 'healthy',
          service: 'enhanced-ai-chatbot',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          features: {
            conversationFlows: true,
            proactiveSuggestions: true,
            contextAwareness: true,
            memorySupport: true,
            enhancedAnalytics: true
          },
          analytics: analytics,
          uptime: process.uptime()
        }
      });

    } catch (error) {
      console.error('Enhanced Health Check Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Enhanced AI Chatbot service unavailable'
      });
    }
  }

  /**
   * Get service information with enhanced features
   */
  async getServiceInfo(req, res) {
    try {
      return res.json({
        success: true,
        data: {
          service: 'enhanced-ai-chatbot',
          version: '3.0.0',
          description: 'Advanced AI Chatbot with conversation flows, proactive suggestions, context awareness, and automatic trending responses',
          features: [
            'Multi-turn conversation flows',
            'Proactive suggestion system',
            'Context-aware responses',
            'Session memory management',
            'Enhanced analytics',
            'Personalized recommendations',
            'Intent detection with confidence scoring',
            'Dynamic response generation',
            'Real-time trending news integration',
            'Automatic answer generation',
            'Time-based contextual responses',
            'Travel-focused trending topics'
          ],
          supportedCategories: ['copywriter', 'travel', 'general'],
          supportedLanguages: ['id', 'en'],
          trendingDataSources: [
            'NewsAPI.org (Indonesian news)',
            'Google Trends simulation',
            'Travel-specific news feeds',
            'Social media trending topics'
          ],
          endpoints: {
            chat: 'POST /api/enhanced-ai-chatbot/chat',
            welcome: 'GET /api/enhanced-ai-chatbot/welcome',
            auto: 'POST /api/enhanced-ai-chatbot/auto',
            history: 'GET /api/enhanced-ai-chatbot/history',
            suggestions: 'GET /api/enhanced-ai-chatbot/suggestions',
            clear: 'DELETE /api/enhanced-ai-chatbot/clear',
            health: 'GET /api/enhanced-ai-chatbot/health',
            info: 'GET /api/enhanced-ai-chatbot/info'
          },
          autoResponseFeatures: {
            timeBasedGreetings: true,
            trendingNewsIntegration: true,
            contextualSuggestions: true,
            proactiveTriggers: true,
            sessionAwareness: true,
            travelFocus: true
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Get Enhanced Service Info Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get enhanced service information'
      });
    }
  }

  /**
   * Helper method to categorize suggestions
   */
  categorizeSuggestion(text, intent) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('copywriter') || lowerText.includes('konten') || lowerText.includes('tulisan')) {
      return 'copywriter';
    }
    
    if (lowerText.includes('travel') || lowerText.includes('wisata') || lowerText.includes('liburan')) {
      return 'travel';
    }
    
    if (lowerText.includes('harga') || lowerText.includes('biaya') || lowerText.includes('bayar')) {
      return 'pricing';
    }
    
    return 'general';
  }

  /**
   * Helper method to get generic suggestions
   */
  getGenericSuggestions(category) {
    const suggestions = {
      copywriter: [
        'Lihat portfolio copywriter',
        'Dapatkan penawaran khusus',
        'Konsultasi gratis konten',
        'Proses pengerjaan copywriting'
      ],
      travel: [
        'Destinasi populer bulan ini',
        'Paket hemat traveling',
        'Tips liburan keluarga',
        'Custom itinerary planning'
      ],
      pricing: [
        'Bandingkan paket harga',
        'Dapatkan diskon spesial',
        'Cek promo terbaru',
        'Pembayaran cicilan'
      ]
    };

    return suggestions[category] || [
      'Cara kerja layanan kami',
      'Hubungi customer service',
      'Lihat testimonial klien',
      'FAQ lengkap'
    ];
  }

  /**
   * Demo chat endpoint without authentication for testing
   */
  async chatDemo(req, res) {
    const startTime = Date.now();
    
    try {
      const { message, sessionId, history, autoTrigger = false } = req.body;

      // Validate input
      if (!message || message.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Pesan tidak boleh kosong'
        });
      }

      // Generate session ID for demo
      const currentSessionId = sessionId || `demo_session_${Date.now()}`;

      // Initialize AI database if needed
      await initAIChatbotDB();

      // Get chat history for context
      let dbHistory = [];
      try {
        dbHistory = await getAIMessagesBySession(currentSessionId, 20);
      } catch (error) {
        console.log('Session not found, starting fresh session');
        dbHistory = [];
      }

      // Generate AI response with enhanced features
      const aiResponseStart = Date.now();
      const finalResponse = await this.aiService.generateResponse(message, dbHistory, currentSessionId);
      const processingTime = Date.now() - aiResponseStart;

      // Detect intent with enhanced detection
      const intent = this.aiService.detectIntent(message);
      const confidence = intent ? intent.confidence : 0.50;

      // Get enhanced analytics data
      const enhancedAnalytics = this.aiService.getAnalytics();

      // Generate contextual suggestions
      const suggestions = this.aiService.getContextualSuggestions(finalResponse, dbHistory, currentSessionId);

      // Calculate total processing time
      const totalProcessingTime = Date.now() - startTime;

      // Log for monitoring with enhanced data
      console.log(`[${new Date().toISOString()}] Enhanced AI Chatbot Demo Success:`, {
        sessionId: currentSessionId,
        messageLength: message.length,
        responseLength: finalResponse.length,
        processingTime: totalProcessingTime,
        intent: intent?.service || 'general',
        confidence: confidence,
        hasFlow: enhancedAnalytics.activeFlows > 0,
        suggestionsCount: suggestions.length
      });

      const chatResponse = {
        success: true,
        data: {
          response: finalResponse,
          timestamp: new Date().toISOString(),
          sessionId: currentSessionId,
          suggestions,
          service: 'enhanced-ai-chatbot-demo',
          processingTime: totalProcessingTime,
          intent: intent?.service || 'general',
          confidence: confidence,
          analytics: {
            totalSessions: enhancedAnalytics.totalSessions,
            activeFlows: enhancedAnalytics.activeFlows,
            popularIntents: enhancedAnalytics.popularIntents
          }
        }
      };

      res.status(200).json(chatResponse);

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Enhanced AI Chatbot Demo Error:`, {
        error: error.message,
        stack: error.stack,
        sessionId: req.body.sessionId
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        data: {
          response: '❌ Maaf, terjadi kesalahan pada server. Silakan coba lagi.',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Helper method to log enhanced analytics
   */
  async logEnhancedAnalytics(sessionId, userId, eventType, eventData) {
    try {
      await logAnalytics({
        sessionId,
        userId,
        eventType,
        eventData: {
          ...eventData,
          enhancedFeatures: true,
          service: 'enhanced-ai-chatbot'
        },
        modelVersion: 'travello-enhanced-ai-v2'
      });
    } catch (error) {
      console.error('Failed to log enhanced analytics:', error);
    }
  }
}

module.exports = EnhancedAIChatbotController;
