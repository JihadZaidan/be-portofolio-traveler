const express = require('express');
const { EnhancedTourismChatController } = require('../controllers/enhanced-tourism-chat-fixed.js');
const { authenticateToken } = require('../middlewares/auth.middleware.js');

const router = express.Router();
const chatController = new EnhancedTourismChatController();

// Main chat endpoint
router.post('/chat', authenticateToken, chatController.chat.bind(chatController));

// Health check endpoint
router.get('/health', chatController.healthCheck.bind(chatController));

// Get suggestions endpoint
router.get('/suggestions', authenticateToken, chatController.getSuggestions.bind(chatController));

module.exports = router;
