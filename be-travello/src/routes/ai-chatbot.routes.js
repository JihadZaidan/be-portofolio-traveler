const express = require('express');
const router = express.Router();
const aiChatbotController = require('../controllers/ai-chatbot.controller.js');
const { authenticateToken } = require('../middlewares/auth.middleware.js');

/**
 * AI Chatbot Routes
 * Routes for AI-powered chatbot with auto-answer for copywriter and travel services
 */

// Main chat endpoint
router.post('/chat', authenticateToken, aiChatbotController.chat);

// Get chat history
router.get('/history', authenticateToken, aiChatbotController.getHistory);

// Get contextual suggestions
router.get('/suggestions', authenticateToken, aiChatbotController.getSuggestions);

// Clear chat history
router.delete('/clear', authenticateToken, aiChatbotController.clearChat);

// Health check
router.get('/health', aiChatbotController.healthCheck);

// Service information
router.get('/info', aiChatbotController.getServiceInfo);

module.exports = router;
