import { Router } from 'express';
import { AutoChatController } from '../controllers/auto-chat.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
const router = Router();
const autoChatController = new AutoChatController();
/**
 * @route   POST /api/auto-chat
 * @desc    Auto chat bot with intelligent responses
 * @access  Private
 * @body    message: string, sessionId?: string, history?: array
 */
router.post('/', isAuthenticated, async (req, res) => {
    return await autoChatController.chat(req, res);
});
/**
 * @route   GET /api/auto-chat/health
 * @desc    Health check for auto chat service
 * @access  Public
 */
router.get('/health', async (req, res) => {
    return await autoChatController.healthCheck(req, res);
});
/**
 * @route   GET /api/auto-chat/history
 * @desc    Get chat history from database
 * @access  Private
 * @query   sessionId: string, page: number, limit: number
 */
router.get('/history', isAuthenticated, async (req, res) => {
    return await autoChatController.getHistory(req, res);
});
/**
 * @route   GET /api/auto-chat/suggestions
 * @desc    Get contextual suggestions based on chat
 * @access  Private
 * @query   sessionId: string
 */
router.get('/suggestions', isAuthenticated, async (req, res) => {
    return await autoChatController.getSuggestions(req, res);
});
/**
 * @route   DELETE /api/auto-chat/clear
 * @desc    Clear chat history
 * @access  Private
 * @query   sessionId: string
 */
router.delete('/clear', isAuthenticated, async (req, res) => {
    return await autoChatController.clearChat(req, res);
});
export default router;
