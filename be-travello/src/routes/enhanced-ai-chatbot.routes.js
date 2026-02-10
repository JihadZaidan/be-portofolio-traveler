/**
 * Enhanced AI Chatbot Routes
 * Advanced features: conversation flows, proactive suggestions, context awareness
 */

const express = require('express');
const EnhancedAIChatbotController = require('../controllers/enhanced-ai-chatbot.controller.js');
const { authenticateToken } = require('../middlewares/auth.middleware.js');

const router = express.Router();
const controller = new EnhancedAIChatbotController();

/**
 * @swagger
 * components:
 *   schemas:
 *     EnhancedChatRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: User message to AI
 *         sessionId:
 *           type: string
 *           description: Session identifier for conversation continuity
 *         history:
 *           type: array
 *           description: Chat history for context
 *           items:
 *             type: object
 *     EnhancedChatResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             response:
 *               type: string
 *               description: AI response with enhanced features
 *             sessionId:
 *               type: string
 *             suggestions:
 *               type: array
 *               items:
 *                 type: string
 *             intent:
 *               type: string
 *             confidence:
 *               type: number
 *             analytics:
 *               type: object
 *             features:
 *               type: object
 *             processingTime:
 *               type: number
 */

/**
 * @swagger
 * /api/enhanced-ai-chatbot/chat:
 *   post:
 *     summary: Enhanced AI chat with conversation flows and proactive suggestions
 *     tags: [Enhanced AI Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnhancedChatRequest'
 *     responses:
 *       200:
 *         description: Enhanced AI response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnhancedChatResponse'
 *       401:
 *         description: User not authenticated
 *       400:
 *         description: Invalid request (empty message)
 *       500:
 *         description: Internal server error
 */
router.post('/chat', authenticateToken, controller.chat.bind(controller));

/**
 * @swagger
 * /api/enhanced-ai-chatbot/chat-demo:
 *   post:
 *     summary: Enhanced AI chat without authentication (for demo/testing)
 *     tags: [Enhanced AI Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnhancedChatRequest'
 *     responses:
 *       200:
 *         description: Enhanced AI response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnhancedChatResponse'
 *       400:
 *         description: Invalid request (empty message)
 *       500:
 *         description: Internal server error
 */
router.post('/chat-demo', controller.chatDemo.bind(controller));

/**
 * @swagger
 * /api/enhanced-ai-chatbot/welcome:
 *   get:
 *     summary: Get automatic welcome message with trending data
 *     tags: [Enhanced AI Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Session identifier
 *     responses:
 *       200:
 *         description: Welcome message with trending data generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     welcomeMessage:
 *                       type: string
 *                     sessionId:
 *                       type: string
 *                     features:
 *                       type: object
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Internal server error
 */
router.get('/welcome', authenticateToken, controller.getWelcomeMessage.bind(controller));

/**
 * @swagger
 * /api/enhanced-ai-chatbot/auto:
 *   post:
 *     summary: Trigger automatic response based on context
 *     tags: [Enhanced AI Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session identifier
 *     responses:
 *       200:
 *         description: Automatic response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: string
 *                     sessionId:
 *                       type: string
 *                     autoResponse:
 *                       type: boolean
 *                     features:
 *                       type: object
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Internal server error
 */
router.post('/auto', authenticateToken, controller.triggerAutoResponse.bind(controller));

/**
 * @swagger
 * /api/enhanced-ai-chatbot/history:
 *   get:
 *     summary: Get enhanced chat history with analytics
 *     tags: [Enhanced AI Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Session identifier
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of messages per page
 *       - in: query
 *         name: includeAnalytics
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include session analytics
 *     responses:
 *       200:
 *         description: Enhanced chat history retrieved successfully
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Internal server error
 */
router.get('/history', authenticateToken, controller.getHistory.bind(controller));

/**
 * @swagger
 * /api/enhanced-ai-chatbot/suggestions:
 *   get:
 *     summary: Get enhanced contextual suggestions with personalization
 *     tags: [Enhanced AI Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Session identifier
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [copywriter, travel, pricing, general]
 *         description: Suggestion category
 *       - in: query
 *         name: personalized
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Generate personalized suggestions
 *     responses:
 *       200:
 *         description: Enhanced suggestions generated successfully
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Internal server error
 */
router.get('/suggestions', authenticateToken, controller.getSuggestions.bind(controller));

/**
 * @swagger
 * /api/enhanced-ai-chatbot/clear:
 *   delete:
 *     summary: Clear enhanced chat history with session cleanup
 *     tags: [Enhanced AI Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session identifier to clear
 *     responses:
 *       200:
 *         description: Enhanced chat history cleared successfully
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Internal server error
 */
router.delete('/clear', authenticateToken, controller.clearHistory.bind(controller));

/**
 * @swagger
 * /api/enhanced-ai-chatbot/health:
 *   get:
 *     summary: Enhanced health check with analytics
 *     tags: [Enhanced AI Chatbot]
 *     responses:
 *       200:
 *         description: Enhanced AI Chatbot service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     service:
 *                       type: string
 *                     version:
 *                       type: string
 *                     features:
 *                       type: object
 *                     analytics:
 *                       type: object
 *                     uptime:
 *                       type: number
 *       500:
 *         description: Service unavailable
 */
router.get('/health', controller.healthCheck.bind(controller));

/**
 * @swagger
 * /api/enhanced-ai-chatbot/info:
 *   get:
 *     summary: Get enhanced service information
 *     tags: [Enhanced AI Chatbot]
 *     responses:
 *       200:
 *         description: Enhanced service information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: string
 *                     version:
 *                       type: string
 *                     description:
 *                       type: string
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *                     supportedCategories:
 *                       type: array
 *                       items:
 *                         type: string
 *                     endpoints:
 *                       type: object
 *       500:
 *         description: Internal server error
 */
router.get('/info', controller.getServiceInfo.bind(controller));

module.exports = router;
