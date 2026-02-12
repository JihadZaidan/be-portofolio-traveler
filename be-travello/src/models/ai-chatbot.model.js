const { DataTypes, sequelize } = require('../config/database.config.js');

// AI Chat Sessions Model
const AIChatSession = sequelize.define('AIChatSession', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    session_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    user_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    user_email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    started_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_activity: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    session_metadata: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'ai_chat_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// AI Chat Messages Model
const AIChatMessage = sequelize.define('AIChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    session_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'ai', 'system'),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    content_type: {
        type: DataTypes.ENUM('text', 'markdown', 'html'),
        defaultValue: 'text'
    },
    message_metadata: {
        type: DataTypes.JSON,
        allowNull: true
    },
    processing_time_ms: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tokens_used: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    model_used: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    intent_detected: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    confidence_score: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    }
}, {
    tableName: 'ai_chat_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// AI Suggestions Model
const AISuggestion = sequelize.define('AISuggestion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    session_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    user_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    suggestion_text: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    suggestion_category: {
        type: DataTypes.ENUM('copywriter', 'travel', 'general', 'custom'),
        allowNull: false
    },
    context_keywords: {
        type: DataTypes.JSON,
        allowNull: true
    },
    click_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'ai_suggestions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// AI Analytics Model
const AIAnalytics = sequelize.define('AIAnalytics', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    session_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    user_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    event_type: {
        type: DataTypes.ENUM('message_sent', 'message_received', 'suggestion_clicked', 'session_started', 'session_ended', 'error_occurred'),
        allowNull: false
    },
    event_data: {
        type: DataTypes.JSON,
        allowNull: true
    },
    processing_time_ms: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tokens_used: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    model_version: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    }
}, {
    tableName: 'ai_analytics',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Define associations
AIChatSession.hasMany(AIChatMessage, { foreignKey: 'session_id', as: 'messages' });
AIChatMessage.belongsTo(AIChatSession, { foreignKey: 'session_id', as: 'session' });

AIChatSession.hasMany(AISuggestion, { foreignKey: 'session_id', as: 'suggestions' });
AISuggestion.belongsTo(AIChatSession, { foreignKey: 'session_id', as: 'session' });

AIChatSession.hasMany(AIAnalytics, { foreignKey: 'session_id', as: 'analytics' });
AIAnalytics.belongsTo(AIChatSession, { foreignKey: 'session_id', as: 'session' });

module.exports = {
    AIChatSession,
    AIChatMessage,
    AISuggestion,
    AIAnalytics
};
