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

class AIChatbotController {
  constructor() {
    this.aiService = new EnhancedAIChatbotService();
  }

  /**
   * Main AI chatbot endpoint with auto answer for copywriter and travel
   */
  async chat(req, res) {
    const startTime = Date.now();
    
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
      const currentSessionId = sessionId || `ai_session_${user.id}_${Date.now()}`;

      // Initialize AI database if needed
      await initAIChatbotDB();

      // Get or create session
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
            source: 'api'
          }
        });
      }

      // Get chat history for context
      const dbHistory = await getAIMessagesBySession(currentSessionId, 10);

      // Generate AI response with timing and enhanced features
      const aiResponseStart = Date.now();
      const aiResponse = this.aiService.generateResponse(message, dbHistory, currentSessionId);
      const processingTime = Date.now() - aiResponseStart;

      // Detect intent for analytics with enhanced detection
      const intent = this.aiService.detectIntent(message);
      const confidence = intent ? intent.confidence : 0.50;

      // Get enhanced analytics data
      const enhancedAnalytics = this.aiService.getAnalytics();

      // Save user message
      await createAIMessage({
        sessionId: currentSessionId,
        messageId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        role: 'user',
        content: message,
        contentType: 'text',
        messageMetadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip
        }
      });

      // Save AI response
      await createAIMessage({
        sessionId: currentSessionId,
        messageId: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'ai_system',
        role: 'ai',
        content: aiResponse,
        contentType: 'markdown',
        messageMetadata: {
          model: 'travello-ai-v1',
          version: '1.0.0'
        },
        processingTimeMs: processingTime,
        modelUsed: 'travello-ai-v1',
        intentDetected: intent?.service || 'general',
        confidenceScore: confidence
      });

      // Update knowledge base usage
      if (intent) {
        await updateKnowledgeBaseUsage(intent.service);
      }

      // Generate enhanced contextual suggestions
      const suggestions = this.aiService.generateContextualSuggestions(aiResponse, dbHistory, currentSessionId);

      // Save suggestions to database
      const suggestionsData = suggestions.map((text, index) => ({
        sessionId: currentSessionId,
        userId: user.id,
        suggestionText: text,
        suggestionCategory: text.toLowerCase().includes('copywriter') ? 'copywriter' : 
                           text.toLowerCase().includes('travel') ? 'travel' : 'general',
        contextKeywords: [message.toLowerCase()]
      }));

      if (suggestionsData.length > 0) {
        await createAISuggestions(suggestionsData);
      }

      const totalProcessingTime = Date.now() - startTime;

      const chatResponse = {
        success: true,
        data: {
          response: aiResponse,
          timestamp: new Date().toISOString(),
          sessionId: currentSessionId,
          suggestions,
          service: 'enhanced-ai-chatbot',
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

      // Log for monitoring with enhanced data
      console.log(`[${new Date().toISOString()}] Enhanced AI Chatbot Success:`, {
        userId: user.id,
        sessionId: currentSessionId,
        messageLength: message.length,
        responseLength: aiResponse.length,
        processingTime: totalProcessingTime,
        intent: intent?.service || 'general',
        confidence: confidence,
        hasFlow: enhancedAnalytics.activeFlows > 0,
        suggestionsCount: suggestions.length
      });

      return res.json(chatResponse);

    } catch (error) {
      console.error('AI Chatbot API Error:', error);

      // Log error to analytics
      try {
        await logAnalytics({
          sessionId: req.body.sessionId,
          userId: req.user?.id,
          eventType: 'error_occurred',
          eventData: {
            error: error.message,
            message: req.body.message
          }
        });
      } catch (analyticsError) {
        console.error('Failed to log error analytics:', analyticsError);
      }

      const errorResponse = {
        success: false,
        error: 'Gagal menghasilkan respons AI. Silakan coba lagi.',
        data: {
          response: '',
          timestamp: new Date().toISOString(),
          sessionId: req.body.sessionId || ''
        }
      };

      return res.status(500).json(errorResponse);
    }
  }

  /**
   * Get chat history
   */
  async getHistory(req, res) {
    try {
      const { sessionId, page = 1, limit = 20 } = req.query;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentSessionId = sessionId || `ai_session_${user.id}`;
      const history = await getAIMessagesBySession(currentSessionId, Number(limit));
      
      const formattedHistory = history.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
        sessionId: msg.sessionId,
        metadata: msg.messageMetadata
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
      console.error('Get AI Chat History Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch AI chat history'
      });
    }
  }

  /**
   * Get contextual suggestions
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

      const currentSessionId = sessionId || `ai_session_${user.id}`;
      const recentHistory = await findBySessionId(currentSessionId, 5);
      
      const suggestions = this.aiService.generateContextualSuggestions(recentHistory);

      return res.json({
        success: true,
        data: {
          suggestions,
          sessionId: currentSessionId,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Get AI Suggestions Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate AI suggestions'
      });
    }
  }

  /**
   * Clear chat history
   */
  async clearChat(req, res) {
    try {
      const { sessionId } = req.query;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const currentSessionId = sessionId || `ai_session_${user.id}`;
      
      // Delete all messages in session
      const deletedCount = await ChatMessage.destroy({
        where: { sessionId: currentSessionId }
      });

      return res.json({
        success: true,
        data: {
          message: 'AI chat history cleared successfully',
          sessionId: currentSessionId,
          deletedCount,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Clear AI Chat Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to clear AI chat history'
      });
    }
  }

  /**
   * Health check for AI chatbot
   */
  async healthCheck(req, res) {
    try {
      return res.status(200).json({
        success: true,
        data: {
          status: 'Healthy',
          service: 'AI Chatbot - Copywriter & Travel Assistant',
          features: [
            'Auto-answer for copywriter services',
            'Auto-answer for travel consultation',
            'Contextual suggestions',
            'Session management',
            'Chat history',
            'Intent detection',
            'Knowledge base integration'
          ],
          services: [
            'Copywriter Services',
            'Travel Consultation',
            'Bundle Packages'
          ],
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Health check failed',
        data: {
          status: 'Unhealthy',
          service: 'AI Chatbot',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get service information
   */
  async getServiceInfo(req, res) {
    try {
      return res.json({
        success: true,
        data: {
          service: 'AI Chatbot Assistant',
          version: '1.0.0',
          description: 'Intelligent chatbot for copywriter services and travel consultation',
          capabilities: {
            copywriter: [
              'Content writing services',
              'Pricing information',
              'Process explanation',
              'Portfolio showcase'
            ],
            travel: [
              'Destination recommendations',
              'Package information',
              'Travel tips',
              'Budget planning'
            ],
            combined: [
              'Bundle packages',
              'Business solutions',
              'Content creation for travel business'
            ]
          },
          responseTime: '< 2 seconds',
          languages: ['Indonesian'],
          availability: '24/7',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Get Service Info Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get service information'
      });
    }
  }
}

module.exports = new AIChatbotController();
