const { Sequelize } = require('sequelize');
const config = require('../config/database.js');

// Initialize Sequelize for AI Chatbot database
const sequelize = new Sequelize(
  config.aiChatbot?.database || 'ai_chatbot_db',
  config.aiChatbot?.username || config.username,
  config.aiChatbot?.password || config.password,
  {
    host: config.aiChatbot?.host || config.host,
    dialect: config.aiChatbot?.dialect || config.dialect || 'mysql',
    port: config.aiChatbot?.port || config.port || 3306,
    logging: config.aiChatbot?.logging || false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// =====================================================
// AI Chat Session Model
// =====================================================
const AIChatSession = sequelize.define('AIChatSession', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: Sequelize.STRING(255),
    allowNull: false,
    unique: true,
    field: 'session_id'
  },
  userId: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'user_id'
  },
  userName: {
    type: Sequelize.STRING(255),
    field: 'user_name'
  },
  userEmail: {
    type: Sequelize.STRING(255),
    field: 'user_email'
  },
  startedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'started_at'
  },
  lastActivity: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'last_activity'
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  sessionMetadata: {
    type: Sequelize.JSON,
    field: 'session_metadata'
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'ai_chat_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// =====================================================
// AI Chat Message Model
// =====================================================
const AIChatMessage = sequelize.define('AIChatMessage', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'session_id'
  },
  messageId: {
    type: Sequelize.STRING(255),
    allowNull: false,
    unique: true,
    field: 'message_id'
  },
  userId: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'user_id'
  },
  role: {
    type: Sequelize.ENUM('user', 'ai', 'system'),
    allowNull: false
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  contentType: {
    type: Sequelize.ENUM('text', 'markdown', 'html'),
    defaultValue: 'text',
    field: 'content_type'
  },
  messageMetadata: {
    type: Sequelize.JSON,
    field: 'message_metadata'
  },
  processingTimeMs: {
    type: Sequelize.INTEGER,
    field: 'processing_time_ms'
  },
  tokensUsed: {
    type: Sequelize.INTEGER,
    field: 'tokens_used'
  },
  modelUsed: {
    type: Sequelize.STRING(100),
    field: 'model_used'
  },
  intentDetected: {
    type: Sequelize.STRING(100),
    field: 'intent_detected'
  },
  confidenceScore: {
    type: Sequelize.DECIMAL(3, 2),
    field: 'confidence_score'
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'ai_chat_messages',
  timestamps: false
});

// =====================================================
// AI Suggestion Model
// =====================================================
const AISuggestion = sequelize.define('AISuggestion', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'session_id'
  },
  userId: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'user_id'
  },
  suggestionText: {
    type: Sequelize.STRING(500),
    allowNull: false,
    field: 'suggestion_text'
  },
  suggestionCategory: {
    type: Sequelize.ENUM('copywriter', 'travel', 'general', 'custom'),
    allowNull: false,
    field: 'suggestion_category'
  },
  contextKeywords: {
    type: Sequelize.JSON,
    field: 'context_keywords'
  },
  clickCount: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    field: 'click_count'
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'ai_suggestions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// =====================================================
// AI Knowledge Base Model
// =====================================================
const AIKnowledgeBase = sequelize.define('AIKnowledgeBase', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  subcategory: {
    type: Sequelize.STRING(100)
  },
  keywords: {
    type: Sequelize.JSON,
    allowNull: false
  },
  responseTemplate: {
    type: Sequelize.TEXT,
    allowNull: false,
    field: 'response_template'
  },
  responseType: {
    type: Sequelize.ENUM('text', 'markdown', 'html'),
    defaultValue: 'markdown',
    field: 'response_type'
  },
  priority: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  usageCount: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    field: 'usage_count'
  },
  successRating: {
    type: Sequelize.DECIMAL(3, 2),
    defaultValue: 0.00,
    field: 'success_rating'
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'ai_knowledge_base',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// =====================================================
// AI Analytics Model
// =====================================================
const AIAnalytics = sequelize.define('AIAnalytics', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: Sequelize.STRING(255),
    field: 'session_id'
  },
  userId: {
    type: Sequelize.STRING(255),
    field: 'user_id'
  },
  eventType: {
    type: Sequelize.ENUM('message_sent', 'message_received', 'suggestion_clicked', 'session_started', 'session_ended', 'error_occurred'),
    allowNull: false,
    field: 'event_type'
  },
  eventData: {
    type: Sequelize.JSON,
    field: 'event_data'
  },
  processingTimeMs: {
    type: Sequelize.INTEGER,
    field: 'processing_time_ms'
  },
  tokensUsed: {
    type: Sequelize.INTEGER,
    field: 'tokens_used'
  },
  modelVersion: {
    type: Sequelize.STRING(50),
    field: 'model_version'
  },
  userAgent: {
    type: Sequelize.TEXT,
    field: 'user_agent'
  },
  ipAddress: {
    type: Sequelize.STRING(45),
    field: 'ip_address'
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'ai_analytics',
  timestamps: false
});

// =====================================================
// AI Feedback Model
// =====================================================
const AIFeedback = sequelize.define('AIFeedback', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  messageId: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'message_id'
  },
  sessionId: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'session_id'
  },
  userId: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'user_id'
  },
  rating: {
    type: Sequelize.TINYINT,
    validate: {
      min: 1,
      max: 5
    }
  },
  feedbackText: {
    type: Sequelize.TEXT,
    field: 'feedback_text'
  },
  feedbackCategory: {
    type: Sequelize.ENUM('helpful', 'not_helpful', 'inaccurate', 'inappropriate', 'other'),
    field: 'feedback_category'
  },
  isImproved: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    field: 'is_improved'
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'ai_feedback',
  timestamps: false
});

// =====================================================
// AI Training Data Model
// =====================================================
const AITrainingData = sequelize.define('AITrainingData', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: Sequelize.STRING(255),
    field: 'session_id'
  },
  userInput: {
    type: Sequelize.TEXT,
    allowNull: false,
    field: 'user_input'
  },
  aiResponse: {
    type: Sequelize.TEXT,
    allowNull: false,
    field: 'ai_response'
  },
  userFeedbackRating: {
    type: Sequelize.TINYINT,
    field: 'user_feedback_rating'
  },
  userFeedbackText: {
    type: Sequelize.TEXT,
    field: 'user_feedback_text'
  },
  intentDetected: {
    type: Sequelize.STRING(100),
    field: 'intent_detected'
  },
  confidenceScore: {
    type: Sequelize.DECIMAL(3, 2),
    field: 'confidence_score'
  },
  isUsedForTraining: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    field: 'is_used_for_training'
  },
  trainingStatus: {
    type: Sequelize.ENUM('pending', 'approved', 'rejected', 'trained'),
    defaultValue: 'pending',
    field: 'training_status'
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'ai_training_data',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// =====================================================
// MODEL ASSOCIATIONS
// =====================================================

// Session has many messages
AIChatSession.hasMany(AIChatMessage, {
  foreignKey: 'sessionId',
  as: 'messages'
});

AIChatMessage.belongsTo(AIChatSession, {
  foreignKey: 'sessionId',
  as: 'session'
});

// Session has many suggestions
AIChatSession.hasMany(AISuggestion, {
  foreignKey: 'sessionId',
  as: 'suggestions'
});

AISuggestion.belongsTo(AIChatSession, {
  foreignKey: 'sessionId',
  as: 'session'
});

// Session has many analytics
AIChatSession.hasMany(AIAnalytics, {
  foreignKey: 'sessionId',
  as: 'analytics'
});

AIAnalytics.belongsTo(AIChatSession, {
  foreignKey: 'sessionId',
  as: 'session'
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Initialize database connection
const initAIChatbotDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ AI Chatbot database connection established successfully');
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('✅ AI Chatbot database synchronized successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to AI Chatbot database:', error);
    return false;
  }
};

// Create new session
const createAISession = async (sessionData) => {
  try {
    const session = await AIChatSession.create({
      sessionId: sessionData.sessionId,
      userId: sessionData.userId,
      userName: sessionData.userName,
      userEmail: sessionData.userEmail,
      sessionMetadata: sessionData.sessionMetadata || {}
    });
    
    // Log analytics
    await logAnalytics({
      sessionId: sessionData.sessionId,
      userId: sessionData.userId,
      eventType: 'session_started',
      eventData: sessionData.sessionMetadata
    });
    
    return session;
  } catch (error) {
    console.error('Error creating AI session:', error);
    throw error;
  }
};

// Get session by ID
const getAISessionById = async (sessionId) => {
  try {
    const session = await AIChatSession.findOne({
      where: { sessionId },
      include: [
        {
          model: AIChatMessage,
          as: 'messages',
          order: [['createdAt', 'ASC']]
        },
        {
          model: AISuggestion,
          as: 'suggestions',
          where: { isActive: true }
        }
      ]
    });
    
    return session;
  } catch (error) {
    console.error('Error getting AI session:', error);
    throw error;
  }
};

// Create new message
const createAIMessage = async (messageData) => {
  try {
    const message = await AIChatMessage.create({
      sessionId: messageData.sessionId,
      messageId: messageData.messageId,
      userId: messageData.userId,
      role: messageData.role,
      content: messageData.content,
      contentType: messageData.contentType || 'text',
      messageMetadata: messageData.messageMetadata || {},
      processingTimeMs: messageData.processingTimeMs,
      tokensUsed: messageData.tokensUsed,
      modelUsed: messageData.modelUsed,
      intentDetected: messageData.intentDetected,
      confidenceScore: messageData.confidenceScore
    });
    
    // Update session last activity
    await AIChatSession.update(
      { lastActivity: new Date() },
      { where: { sessionId: messageData.sessionId } }
    );
    
    // Log analytics
    await logAnalytics({
      sessionId: messageData.sessionId,
      userId: messageData.userId,
      eventType: messageData.role === 'user' ? 'message_sent' : 'message_received',
      eventData: {
        messageId: messageData.messageId,
        role: messageData.role,
        intentDetected: messageData.intentDetected,
        processingTimeMs: messageData.processingTimeMs
      },
      processingTimeMs: messageData.processingTimeMs
    });
    
    return message;
  } catch (error) {
    console.error('Error creating AI message:', error);
    throw error;
  }
};

// Get messages by session
const getAIMessagesBySession = async (sessionId, limit = 50) => {
  try {
    const messages = await AIChatMessage.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit)
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting AI messages:', error);
    throw error;
  }
};

// Create suggestions
const createAISuggestions = async (suggestionsData) => {
  try {
    const suggestions = await AISuggestion.bulkCreate(suggestionsData);
    return suggestions;
  } catch (error) {
    console.error('Error creating AI suggestions:', error);
    throw error;
  }
};

// Get knowledge base entries
const getKnowledgeBase = async (category = null, isActive = true) => {
  try {
    const whereClause = { isActive };
    if (category) {
      whereClause.category = category;
    }
    
    const entries = await AIKnowledgeBase.findAll({
      where: whereClause,
      order: [['priority', 'DESC'], ['usageCount', 'DESC']]
    });
    
    return entries;
  } catch (error) {
    console.error('Error getting knowledge base:', error);
    throw error;
  }
};

// Log analytics event
const logAnalytics = async (analyticsData) => {
  try {
    await AIAnalytics.create({
      sessionId: analyticsData.sessionId,
      userId: analyticsData.userId,
      eventType: analyticsData.eventType,
      eventData: analyticsData.eventData || {},
      processingTimeMs: analyticsData.processingTimeMs,
      tokensUsed: analyticsData.tokensUsed,
      modelVersion: analyticsData.modelVersion,
      userAgent: analyticsData.userAgent,
      ipAddress: analyticsData.ipAddress
    });
  } catch (error) {
    console.error('Error logging analytics:', error);
    // Don't throw error for analytics logging
  }
};

// Get analytics summary
const getAnalyticsSummary = async (startDate = null, endDate = null) => {
  try {
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Sequelize.Op.between]: [startDate, endDate]
      };
    }
    
    const analytics = await AIAnalytics.findAll({
      where: whereClause,
      attributes: [
        'eventType',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('AVG', Sequelize.col('processing_time_ms')), 'avgProcessingTime'],
        [Sequelize.fn('SUM', Sequelize.col('tokens_used')), 'totalTokens']
      ],
      group: ['eventType']
    });
    
    return analytics;
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw error;
  }
};

// Update knowledge base usage
const updateKnowledgeBaseUsage = async (category) => {
  try {
    await AIKnowledgeBase.increment(
      { usageCount: 1 },
      { where: { category } }
    );
  } catch (error) {
    console.error('Error updating knowledge base usage:', error);
    // Don't throw error for usage tracking
  }
};

module.exports = {
  sequelize,
  AIChatSession,
  AIChatMessage,
  AISuggestion,
  AIKnowledgeBase,
  AIAnalytics,
  AIFeedback,
  AITrainingData,
  initAIChatbotDB,
  createAISession,
  getAISessionById,
  createAIMessage,
  getAIMessagesBySession,
  createAISuggestions,
  getKnowledgeBase,
  logAnalytics,
  getAnalyticsSummary,
  updateKnowledgeBaseUsage
};
