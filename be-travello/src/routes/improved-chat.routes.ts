import { Router, Request, Response } from 'express';
import ImprovedChatController from '../controllers/improved-chat.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();
const chatController = new ImprovedChatController();

/**
 * @route   POST /api/chat
 * @desc    Main chat endpoint with enhanced error handling
 * @access   Public (for testing)
 * @body     { message: string, userId?: string, sessionId?: string, history?: Array }
 */
router.post('/', async (req: Request, res: Response) => {
  return await chatController.chat(req, res);
});

/**
 * @route   POST /api/chat/stream
 * @desc    Streaming chat endpoint for better UX
 * @access   Public (for testing)
 * @body     { message: string, userId?: string, sessionId?: string, history?: Array }
 */
router.post('/stream', async (req: Request, res: Response) => {
  return await chatController.chatStream(req, res);
});

/**
 * @route   GET /api/chat/health
 * @desc    Health check endpoint for monitoring
 * @access   Public
 */
router.get('/health', async (req: Request, res: Response) => {
  return await chatController.healthCheck(req, res);
});

/**
 * @route   GET /api/chat/stats
 * @desc    Get chat statistics for monitoring
 * @access   Public
 */
router.get('/stats', async (req: Request, res: Response) => {
  return await chatController.getStats(req, res);
});

/**
 * @route   GET /api/chat/history
 * @desc    Get chat history from database with pagination
 * @access   Private
 * @query    sessionId: string, page: number, limit: number
 */
router.get('/history', isAuthenticated, async (req: Request, res: Response) => {
  return await chatController.getHistory(req, res);
});

/**
 * @route   GET /api/chat/suggestions
 * @desc    Get auto-suggestions based on chat history
 * @access   Private
 * @query    sessionId: string
 */
router.get('/suggestions', isAuthenticated, async (req: Request, res: Response) => {
  return await chatController.getSuggestions(req, res);
});

/**
 * @route   DELETE /api/chat/clear
 * @desc    Clear chat history from database
 * @access   Private
 * @query    sessionId: string
 */
router.delete('/clear', isAuthenticated, async (req: Request, res: Response) => {
  return await chatController.clearChat(req, res);
});

export default router;
