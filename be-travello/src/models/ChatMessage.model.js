const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database.config.js');
const { v4: uuidv4 } = require('uuid');

class ChatMessage extends Model {
  toJSON() {
    const values = Object.assign({}, this.get());
    return values;
  }
}

// ChatMessage model connected to chat_messages table in phpMyAdmin
ChatMessage.init(
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    senderId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'sender_id'
    },
    senderName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'sender_name'
    },
    senderEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'sender_email'
    },
    receiverId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'receiver_id'
    },
    receiverName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'receiver_name'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    messageType: {
      type: DataTypes.ENUM('user_to_admin', 'admin_to_user', 'system'),
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
    }
  },
  {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'chat_messages',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Static methods for chat messages operations
const createMessage = async (messageData) => {
  return await ChatMessage.create(messageData);
};

const getMessagesByRoom = async (roomId, limit = 50) => {
  return await ChatMessage.findAll({
    where: { roomId },
    order: [['created_at', 'ASC']],
    limit
  });
};

const getMessagesByUser = async (userId, limit = 50) => {
  return await ChatMessage.findAll({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    order: [['created_at', 'DESC']],
    limit
  });
};

const getAllUnreadMessages = async () => {
  return await ChatMessage.findAll({
    where: { isRead: false, messageType: 'user_to_admin' },
    order: [['created_at', 'DESC']]
  });
};

const markMessagesAsRead = async (messageIds) => {
  const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
  return await ChatMessage.update(
    { isRead: true, status: 'read' },
    { 
      where: { 
        id: ids 
      } 
    }
  );
};

const getUnreadCount = async () => {
  return await ChatMessage.count({
    where: { isRead: false, messageType: 'user_to_admin' }
  });
};

const initChatMessage = async () => {
  try {
    await ChatMessage.sync({ force: false });
    console.log('✅ ChatMessage model connected to chat_messages table in phpMyAdmin');
  } catch (error) {
    console.error('❌ Failed to connect ChatMessage model to chat_messages table:', error);
    throw error;
  }
};

module.exports = { 
  ChatMessage, 
  createMessage, 
  getMessagesByRoom, 
  getMessagesByUser, 
  getAllUnreadMessages, 
  markMessagesAsRead, 
  getUnreadCount,
  initChatMessage 
};
