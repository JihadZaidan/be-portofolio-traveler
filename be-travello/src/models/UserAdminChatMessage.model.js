const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database.config.js');
const { v4: uuidv4 } = require('uuid');

class UserAdminChatMessage extends Model {
  toJSON() {
    const values = Object.assign({}, this.get());
    return values;
  }
}

// User-Admin Chat Message model
UserAdminChatMessage.init(
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
    roomId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'room_id'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read'
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
    modelName: 'UserAdminChatMessage',
    tableName: 'user_admin_chat_messages',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Static methods for user-admin chat messages operations
const createUserAdminMessage = async (messageData) => {
  return await UserAdminChatMessage.create(messageData);
};

const getMessagesByRoom = async (roomId, limit = 50) => {
  return await UserAdminChatMessage.findAll({
    where: { roomId },
    order: [['created_at', 'ASC']],
    limit
  });
};

const getMessagesByUser = async (userId, limit = 50) => {
  return await UserAdminChatMessage.findAll({
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
  return await UserAdminChatMessage.findAll({
    where: { isRead: false, messageType: 'user_to_admin' },
    order: [['created_at', 'DESC']]
  });
};

const markMessagesAsRead = async (messageIds) => {
  const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
  return await UserAdminChatMessage.update(
    { isRead: true, status: 'read' },
    { 
      where: { 
        id: ids 
      } 
    }
  );
};

const getUnreadCount = async () => {
  return await UserAdminChatMessage.count({
    where: { isRead: false, messageType: 'user_to_admin' }
  });
};

const getUnreadCountForAdmin = async () => {
  return await UserAdminChatMessage.count({
    where: { 
      isRead: false, 
      messageType: 'user_to_admin' 
    }
  });
};

const getUnreadCountForUser = async (userId) => {
  return await UserAdminChatMessage.count({
    where: { 
      isRead: false, 
      messageType: 'admin_to_user',
      receiverId: userId
    }
  });
};

const getLatestMessageForRoom = async (roomId) => {
  return await UserAdminChatMessage.findOne({
    where: { roomId },
    order: [['created_at', 'DESC']]
  });
};

const getConversationsWithUnreadCount = async () => {
  const [results] = await sequelize.query(`
    SELECT 
      u.id as user_id,
      u.username as user_name,
      u.email as user_email,
      MAX(cm.created_at) as last_message_at,
      cm.message as last_message_preview,
      COUNT(CASE WHEN cm.message_type = 'user_to_admin' AND cm.is_read = false THEN 1 END) as unread_count_for_admin,
      COUNT(CASE WHEN cm.message_type = 'admin_to_user' AND cm.is_read = false THEN 1 END) as unread_count_for_user,
      cm.room_id
    FROM users u
    INNER JOIN user_admin_chat_messages cm ON (
      u.id = cm.sender_id OR u.id = cm.receiver_id
    )
    WHERE u.role = 'user'
    GROUP BY u.id, u.username, u.email, cm.room_id
    ORDER BY last_message_at DESC
  `);
  
  return results;
};

const initUserAdminChatMessage = async () => {
  try {
    await UserAdminChatMessage.sync({ force: false });
    console.log('✅ UserAdminChatMessage model connected to user_admin_chat_messages table');
  } catch (error) {
    console.error('❌ Failed to connect UserAdminChatMessage model:', error);
    throw error;
  }
};

module.exports = { 
  UserAdminChatMessage, 
  createUserAdminMessage, 
  getMessagesByRoom, 
  getMessagesByUser, 
  getAllUnreadMessages, 
  markMessagesAsRead, 
  getUnreadCount,
  getUnreadCountForAdmin,
  getUnreadCountForUser,
  getLatestMessageForRoom,
  getConversationsWithUnreadCount,
  initUserAdminChatMessage 
};
