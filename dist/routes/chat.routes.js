import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
const router = Router();
// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
// Chat endpoint
router.post('/', async (req, res) => {
    try {
        const { message, userId, sessionId } = req.body;
        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }
        // Generate AI response
        const result = await model.generateContent(message);
        const response = result.response.text();
        const chatResponse = {
            success: true,
            data: {
                response,
                timestamp: new Date().toISOString(),
                sessionId: sessionId || 'default'
            }
        };
        return res.json(chatResponse);
    }
    catch (error) {
        console.error('Chat API Error:', error);
        const errorResponse = {
            success: false,
            error: 'Failed to generate response',
            data: {
                response: '',
                timestamp: new Date().toISOString()
            }
        };
        return res.status(500).json(errorResponse);
    }
});
// Chat history endpoint
router.get('/history', async (req, res) => {
    try {
        const { sessionId } = req.query;
        // TODO: Implement chat history from database
        const historyResponse = {
            success: true,
            data: {
                response: 'Chat history feature coming soon',
                timestamp: new Date().toISOString(),
                sessionId: sessionId || 'default'
            }
        };
        return res.json(historyResponse);
    }
    catch (error) {
        console.error('Chat History Error:', error);
        const errorResponse = {
            success: false,
            error: 'Failed to fetch chat history',
            data: {
                response: '',
                timestamp: new Date().toISOString()
            }
        };
        return res.status(500).json(errorResponse);
    }
});
// Clear chat endpoint
router.delete('/clear', async (req, res) => {
    try {
        const { sessionId } = req.query;
        // TODO: Implement clear chat from database
        const clearResponse = {
            success: true,
            data: {
                response: 'Chat cleared successfully',
                timestamp: new Date().toISOString(),
                sessionId: sessionId || 'default'
            }
        };
        return res.json(clearResponse);
    }
    catch (error) {
        console.error('Clear Chat Error:', error);
        const errorResponse = {
            success: false,
            error: 'Failed to clear chat',
            data: {
                response: '',
                timestamp: new Date().toISOString()
            }
        };
        return res.status(500).json(errorResponse);
    }
});
export default router;
