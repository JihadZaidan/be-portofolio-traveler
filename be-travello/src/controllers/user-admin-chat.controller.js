const { 
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
  getConversationsWithUnreadCount
} = require('../models/UserAdminChatMessage.model.js');

class UserAdminChatController {
  // Get all conversations for admin
  static async getConversations(req, res) {
    try {
      const conversations = await getConversationsWithUnreadCount();
      
      res.json({
        success: true,
        data: conversations
      });
    } catch (error) {
      console.error('❌ Error getting conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversations',
        error: error.message
      });
    }
  }

  // Get messages for a specific room
  static async getRoomMessages(req, res) {
    try {
      const { roomId } = req.params;
      const { limit = 50 } = req.query;
      
      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        });
      }

      const messages = await getMessagesByRoom(roomId, parseInt(limit));
      
      res.json({
        success: true,
        data: {
          roomId,
          messages
        }
      });
    } catch (error) {
      console.error('❌ Error getting room messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get room messages',
        error: error.message
      });
    }
  }

  // Get messages for a specific user
  static async getUserMessages(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const messages = await getMessagesByUser(userId, parseInt(limit));
      
      res.json({
        success: true,
        data: {
          userId,
          messages
        }
      });
    } catch (error) {
      console.error('❌ Error getting user messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user messages',
        error: error.message
      });
    }
  }

  // Send message (REST API fallback)
  static async sendMessage(req, res) {
    try {
      const { 
        senderId, 
        senderName, 
        senderEmail, 
        receiverId, 
        receiverName, 
        message, 
        messageType = 'user_to_admin',
        roomId,
        attachmentUrl,
        attachmentType
      } = req.body;

      if (!senderId || !senderName || !senderEmail || !message) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: senderId, senderName, senderEmail, message'
        });
      }

      const messageData = {
        senderId,
        senderName,
        senderEmail,
        receiverId,
        receiverName,
        message,
        messageType,
        roomId: roomId || (messageType === 'user_to_admin' ? `user_${senderId}_admin` : `user_${receiverId}_admin`),
        attachmentUrl,
        attachmentType
      };

      const newMessage = await createUserAdminMessage(messageData);
      
      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: newMessage.toJSON()
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
      });
    }
  }

  // Mark messages as read
  static async markMessagesRead(req, res) {
    try {
      const { messageIds } = req.body;
      
      if (!messageIds || !Array.isArray(messageIds)) {
        return res.status(400).json({
          success: false,
          message: 'Message IDs array is required'
        });
      }

      await markMessagesAsRead(messageIds);
      
      res.json({
        success: true,
        message: 'Messages marked as read successfully',
        data: { messageIds }
      });
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark messages as read',
        error: error.message
      });
    }
  }

  // Get unread messages count
  static async getUnreadCount(req, res) {
    try {
      const { userId, role } = req.query;
      
      let unreadCount;
      if (role === 'admin') {
        unreadCount = await getUnreadCountForAdmin();
      } else if (userId) {
        unreadCount = await getUnreadCountForUser(userId);
      } else {
        unreadCount = await getUnreadCount();
      }
      
      res.json({
        success: true,
        data: { count: unreadCount }
      });
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count',
        error: error.message
      });
    }
  }

  // Get unread messages
  static async getUnreadMessages(req, res) {
    try {
      const { role } = req.query;
      
      if (role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const unreadMessages = await getAllUnreadMessages();
      
      res.json({
        success: true,
        data: { messages: unreadMessages }
      });
    } catch (error) {
      console.error('❌ Error getting unread messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread messages',
        error: error.message
      });
    }
  }

  // Get latest message for room
  static async getLatestMessage(req, res) {
    try {
      const { roomId } = req.params;
      
      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        });
      }

      const latestMessage = await getLatestMessageForRoom(roomId);
      
      res.json({
        success: true,
        data: { 
          roomId,
          latestMessage 
        }
      });
    } catch (error) {
      console.error('❌ Error getting latest message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get latest message',
        error: error.message
      });
    }
  }
}

module.exports = UserAdminChatController;
