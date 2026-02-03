import { Router } from 'express';
import { EnhancedTourismChatController } from '../controllers/enhanced-tourism-chat.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();
const tourismChatController = new EnhancedTourismChatController();

/**
 * @route   POST /api/tourism-chat/chat
 * @desc    Enhanced tourism chat with database integration
 * @access  Private
 */
router.post('/chat', isAuthenticated, tourismChatController.chat);

/**
 * @route   GET /api/tourism-chat/history
 * @desc    Get chat history
 * @access  Private
 */
router.get('/history', isAuthenticated, tourismChatController.getHistory);

/**
 * @route   GET /api/tourism-chat/suggestions
 * @desc    Get contextual suggestions
 * @access  Private
 */
router.get('/suggestions', isAuthenticated, tourismChatController.getSuggestions);

/**
 * @route   DELETE /api/tourism-chat/clear
 * @desc    Clear chat history
 * @access  Private
 */
router.delete('/clear', isAuthenticated, tourismChatController.clearChat);

/**
 * @route   GET /api/tourism-chat/health
 * @desc    Health check for tourism chat service
 * @access  Public
 */
router.get('/health', tourismChatController.healthCheck);

export default router;
