const {
  AdminChatHistory,
  createAdminChatHistory,
  getAdminChatHistory,
  getAdminChatBySession,
  updateChatSession,
  markChatAsResolved,
  getAdminChatStats,
  getAdminChatByDateRange
} = require('../models/AdminChatHistory.model.js');

class AdminChatHistoryController {
  // Get admin chat history with filters
  static async getAdminChatHistory(req, res) {
    try {
      const {
        adminId,
        userId,
        messageType,
        dateFrom,
        dateTo,
        resolved,
        category,
        priority,
        limit = 50,
        offset = 0
      } = req.query;

      const filters = {};
      if (adminId) filters.adminId = adminId;
      if (userId) filters.userId = userId;
      if (messageType) filters.messageType = messageType;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (resolved !== undefined) filters.resolved = resolved === 'true';
      if (category) filters.category = category;
      if (priority) filters.priority = priority;

      const result = await getAdminChatHistory(
        filters,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({
        success: true,
        data: {
          history: result.rows,
          total: result.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          totalPages: Math.ceil(result.count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get admin chat history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get admin chat history',
        error: error.message
      });
    }
  }

  // Get chat session by room ID
  static async getChatSession(req, res) {
    try {
      const { roomId } = req.params;
      
      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        });
      }

      const messages = await getAdminChatBySession(roomId);

      res.json({
        success: true,
        data: {
          roomId,
          messages
        }
      });
    } catch (error) {
      console.error('Get chat session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat session',
        error: error.message
      });
    }
  }

  // Update chat session (mark as resolved, add rating, etc.)
  static async updateChatSession(req, res) {
    try {
      const { roomId } = req.params;
      const { sessionEnd, chatDuration, resolved, userRating, category, priority, tags } = req.body;

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        });
      }

      const updateData = {};
      if (sessionEnd) updateData.session_end = sessionEnd;
      if (chatDuration) updateData.chat_duration = chatDuration;
      if (resolved !== undefined) updateData.resolved = resolved;
      if (userRating) updateData.user_rating = userRating;
      if (category) updateData.category = category;
      if (priority) updateData.priority = priority;
      if (tags) updateData.tags = tags;

      const result = await updateChatSession(roomId, updateData);

      res.json({
        success: true,
        message: 'Chat session updated successfully',
        data: { updated: result[0] }
      });
    } catch (error) {
      console.error('Update chat session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update chat session',
        error: error.message
      });
    }
  }

  // Mark chat as resolved with optional rating
  static async markChatAsResolved(req, res) {
    try {
      const { messageId } = req.params;
      const { rating } = req.body;

      if (!messageId) {
        return res.status(400).json({
          success: false,
          message: 'Message ID is required'
        });
      }

      const result = await markChatAsResolved(messageId, rating);

      res.json({
        success: true,
        message: 'Chat marked as resolved successfully',
        data: { updated: result[0] }
      });
    } catch (error) {
      console.error('Mark chat as resolved error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark chat as resolved',
        error: error.message
      });
    }
  }

  // Get admin chat statistics
  static async getAdminChatStats(req, res) {
    try {
      const { adminId } = req.query;

      const stats = await getAdminChatStats(adminId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get admin chat stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get admin chat statistics',
        error: error.message
      });
    }
  }

  // Get chat history by date range
  static async getChatByDateRange(req, res) {
    try {
      const { dateFrom, dateTo, adminId } = req.query;

      if (!dateFrom || !dateTo) {
        return res.status(400).json({
          success: false,
          message: 'Both dateFrom and dateTo are required'
        });
      }

      const chats = await getAdminChatByDateRange(dateFrom, dateTo, adminId);

      res.json({
        success: true,
        data: {
          chats,
          dateFrom,
          dateTo,
          total: chats.length
        }
      });
    } catch (error) {
      console.error('Get chat by date range error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat by date range',
        error: error.message
      });
    }
  }

  // Create new admin chat history entry
  static async createAdminChatHistory(req, res) {
    try {
      const chatData = req.body;

      const newChat = await createAdminChatHistory(chatData);

      res.status(201).json({
        success: true,
        message: 'Admin chat history created successfully',
        data: newChat
      });
    } catch (error) {
      console.error('Create admin chat history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create admin chat history',
        error: error.message
      });
    }
  }

  // Get chat categories for filtering
  static async getChatCategories(req, res) {
    try {
      const categories = [
        { value: 'support', label: 'Customer Support' },
        { value: 'sales', label: 'Sales Inquiry' },
        { value: 'technical', label: 'Technical Support' },
        { value: 'billing', label: 'Billing & Payment' },
        { value: 'account', label: 'Account Management' },
        { value: 'feedback', label: 'Feedback & Suggestions' },
        { value: 'complaint', label: 'Complaint' },
        { value: 'general', label: 'General Inquiry' }
      ];

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get chat categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat categories',
        error: error.message
      });
    }
  }

  // Export chat history to CSV
  static async exportChatHistory(req, res) {
    try {
      const {
        adminId,
        dateFrom,
        dateTo,
        format = 'csv'
      } = req.query;

      const filters = {};
      if (adminId) filters.adminId = adminId;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      const result = await getAdminChatHistory(filters, 10000, 0); // Large limit for export

      if (format === 'csv') {
        // Convert to CSV
        const csv = [
          'ID,Admin Name,User Name,Message,Message Type,Status,Resolved,Created At,Duration,Rating'
        ];

        result.rows.forEach(chat => {
          csv.push([
            chat.id,
            `"${chat.adminName}"`,
            `"${chat.userName}"`,
            `"${chat.message.replace(/"/g, '""')}"`,
            chat.messageType,
            chat.status,
            chat.resolved ? 'Yes' : 'No',
            chat.createdAt,
            chat.chatDuration || '',
            chat.userRating || ''
          ].join(','));
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="admin-chat-history-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv.join('\n'));
      } else {
        res.json({
          success: true,
          data: result.rows
        });
      }
    } catch (error) {
      console.error('Export chat history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export chat history',
        error: error.message
      });
    }
  }
}

module.exports = AdminChatHistoryController;
