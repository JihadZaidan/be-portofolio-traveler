// Enhanced AI Chatbot Controller
const EnhancedAIChatbotService = require('../services/enhanced-ai-chatbot.service');
const aiService = new EnhancedAIChatbotService();

const chat = async (req, res) => {
    try {
        const { message, userName, userEmail } = req.body;

        console.log('AI Chat request:', { message, userName, userEmail });

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Generate response using enhanced AI service
        const response = await aiService.generateResponse(message, userName || 'User');

        console.log('AI Response generated successfully');

        res.status(200).json({
            success: true,
            data: {
                response: response,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: {
                response: 'Maaf, terjadi kesalahan sistem. Silakan coba lagi beberapa saat. Jika masalah berlanjut, hubungi support kami!'
            }
        });
    }
};

module.exports = {
    chat
};