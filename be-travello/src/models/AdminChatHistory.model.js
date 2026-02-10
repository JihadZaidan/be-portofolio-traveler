const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database.config.js');
const { v4: uuidv4 } = require('uuid');

class AdminChatHistory extends Model {
  toJSON() {
    const values = Object.assign({}, this.get());
    return values;
  }
}

// AdminChatHistory model for storing admin chat history
AdminChatHistory.init(
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    adminId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'admin_id'
    },
    adminName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'admin_name'
    },
    adminEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'admin_email'
    },
    userId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'user_id'
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'user_name'
    },
    userEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'user_email'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    messageType: {
      type: DataTypes.ENUM('admin_to_user', 'user_to_admin', 'system'),
      allowNull: false,
      defaultValue: 'user_to_admin',
      field: 'message_type'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read'
    },
    roomId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'room_id'
    },
    attachmentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'attachment_url'
    },
    attachmentType: {
      type: DataTypes.ENUM('image', 'file', 'video'),
      allowNull: true,
      field: 'attachment_type'
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed'),
      allowNull: false,
      defaultValue: 'sent'
    },
    sessionStart: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'session_start'
    },
    sessionEnd: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'session_end'
    },
    chatDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'chat_duration',
      comment: 'Duration in seconds'
    },
    userRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_rating',
      comment: 'Rating given by user (1-5)'
    },
    resolved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the chat was resolved'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Chat category (support, sales, technical, etc.)'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array of tags',
      get() {
        const value = this.getDataValue('tags');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      }
    }
  },
  {
    sequelize,
    modelName: 'AdminChatHistory',
    tableName: 'admin_chat_history',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Static methods for admin chat history operations
const createAdminChatHistory = async (chatData) => {
  return await AdminChatHistory.create(chatData);
};

const getAdminChatHistory = async (filters = {}, limit = 50, offset = 0) => {
  const whereClause = {};
  
  if (filters.adminId) {
    whereClause.admin_id = filters.adminId;
  }
  
  if (filters.userId) {
    whereClause.user_id = filters.userId;
  }
  
  if (filters.messageType) {
    whereClause.message_type = filters.messageType;
  }
  
  if (filters.dateFrom) {
    whereClause.created_at = {
      [sequelize.Sequelize.Op.gte]: filters.dateFrom
    };
  }
  
  if (filters.dateTo) {
    whereClause.created_at = {
      ...whereClause.created_at,
      [sequelize.Sequelize.Op.lte]: filters.dateTo
    };
  }
  
  if (filters.resolved !== undefined) {
    whereClause.resolved = filters.resolved;
  }
  
  if (filters.category) {
    whereClause.category = filters.category;
  }
  
  if (filters.priority) {
    whereClause.priority = filters.priority;
  }

  return await AdminChatHistory.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

const getAdminChatBySession = async (roomId) => {
  return await AdminChatHistory.findAll({
    where: { roomId },
    order: [['created_at', 'ASC']]
  });
};

const updateChatSession = async (roomId, sessionData) => {
  return await AdminChatHistory.update(
    sessionData,
    { 
      where: { roomId }
    }
  );
};

const markChatAsResolved = async (messageId, rating = null) => {
  const updateData = { resolved: true };
  if (rating) {
    updateData.user_rating = rating;
  }
  
  return await AdminChatHistory.update(
    updateData,
    { where: { id: messageId } }
  );
};

const getAdminChatStats = async (adminId = null) => {
  const whereClause = {};
  if (adminId) {
    whereClause.admin_id = adminId;
  }

  const totalChats = await AdminChatHistory.count({
    where: whereClause
  });

  const resolvedChats = await AdminChatHistory.count({
    where: {
      ...whereClause,
      resolved: true
    }
  });

  const avgRating = await AdminChatHistory.findOne({
    where: {
      ...whereClause,
      user_rating: { [sequelize.Sequelize.Op.not]: null }
    },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('user_rating')), 'avg_rating']
    ],
    raw: true
  });

  const avgDuration = await AdminChatHistory.findOne({
    where: {
      ...whereClause,
      chat_duration: { [sequelize.Sequelize.Op.not]: null }
    },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('chat_duration')), 'avg_duration']
    ],
    raw: true
  });

  return {
    total_chats: totalChats,
    resolved_chats: resolvedChats,
    resolution_rate: totalChats > 0 ? ((resolvedChats / totalChats) * 100).toFixed(2) : 0,
    avg_rating: avgRating?.avg_rating ? parseFloat(avgRating.avg_rating).toFixed(2) : null,
    avg_duration: avgDuration?.avg_duration ? Math.round(avgRating.avg_duration) : null
  };
};

const getAdminChatByDateRange = async (dateFrom, dateTo, adminId = null) => {
  const whereClause = {
    created_at: {
      [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
    }
  };
  
  if (adminId) {
    whereClause.admin_id = adminId;
  }

  return await AdminChatHistory.findAll({
    where: whereClause,
    order: [['created_at', 'DESC']]
  });
};

const initAdminChatHistory = async () => {
  try {
    await AdminChatHistory.sync({ force: false });
    console.log('✅ AdminChatHistory model connected to admin_chat_history table in phpMyAdmin');
  } catch (error) {
    console.error('❌ Failed to connect AdminChatHistory model to admin_chat_history table:', error);
    throw error;
  }
};

module.exports = {
  AdminChatHistory,
  createAdminChatHistory,
  getAdminChatHistory,
  getAdminChatBySession,
  updateChatSession,
  markChatAsResolved,
  getAdminChatStats,
  getAdminChatByDateRange,
  initAdminChatHistory
};
