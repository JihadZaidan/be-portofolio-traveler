import GeminiService from '../services/gemini.service.js';
import { ChatMessage, createMessage, findBySessionId, findByUserId } from '../models/ChatMessage.model.js';
class ImprovedChatController {
    constructor() {
        this.geminiService = new GeminiService();
    }
    /**
     * Main chat endpoint with auto-save and context management
     */
    async chat(req, res) {
        try {
            const { message, sessionId, history } = req.body;
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated',
                    data: { response: '', timestamp: new Date().toISOString() }
                });
            }
            // Validasi input
            if (!message || message.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'Pesan tidak boleh kosong'
                });
            }
            const validation = this.geminiService.validateInput(message);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: validation.error
                });
            }
            // Generate session ID jika tidak ada
            const currentSessionId = sessionId || `session_${user.id}_${Date.now()}`;
            // Ambil chat history dari database untuk context
            const dbHistory = await findBySessionId(currentSessionId, 10); // 10 pesan terakhir
            // Format history untuk Gemini (prioritaskan database history)
            let formattedHistory = [];
            if (dbHistory.length > 0) {
                // Gunakan history dari database
                formattedHistory = dbHistory.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.message || msg.response }]
                }));
            }
            else if (history) {
                // Fallback ke history dari request body
                formattedHistory = this.geminiService.formatHistory(history.map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.parts[0]?.text || '' }]
                })));
            }
            // Generate AI response dengan retry logic
            const response = await this.geminiService.chatWithGemini(message, formattedHistory);
            // Simpan pesan user ke database
            await createMessage({
                sessionId: currentSessionId,
                userId: user.id,
                message: message,
                response: '', // Akan diisi setelah AI response
                role: 'user',
                timestamp: new Date()
            });
            // Simpan AI response ke database
            await createMessage({
                sessionId: currentSessionId,
                userId: user.id,
                message: '',
                response: response,
                role: 'ai',
                timestamp: new Date()
            });
            const chatResponse = {
                success: true,
                data: {
                    response,
                    timestamp: new Date().toISOString(),
                    sessionId: currentSessionId
                }
            };
            // Log untuk monitoring
            console.log(`[${new Date().toISOString()}] Chat Success:`, {
                userId: user.id,
                sessionId: currentSessionId,
                messageLength: message.length,
                responseLength: response.length,
                historyCount: dbHistory.length
            });
            return res.json(chatResponse);
        }
        catch (error) {
            console.error('Chat API Error:', {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            const errorResponse = {
                success: false,
                error: 'Gagal menghasilkan respons. Silakan coba lagi.',
                data: {
                    response: '',
                    timestamp: new Date().toISOString()
                }
            };
            return res.status(500).json(errorResponse);
        }
    }
    /**
     * Health check endpoint
     */
    async healthCheck(req, res) {
        try {
            // Test koneksi ke Gemini API
            const testResponse = await this.geminiService.chatWithGemini('Test', []);
            return res.status(200).json({
                success: true,
                data: {
                    status: 'Healthy',
                    timestamp: new Date().toISOString(),
                    testResponse: testResponse.substring(0, 100) + '...' // Truncate untuk privacy
                }
            });
        }
        catch (error) {
            return res.status(503).json({
                success: false,
                error: 'Service unavailable',
                data: {
                    status: 'Unhealthy',
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    /**
     * Get chat statistics from database
     */
    async getStats(req, res) {
        try {
            const user = req.user;
            let stats = {
                totalChats: 0,
                totalSessions: 0,
                averageResponseTime: 0,
                uptime: process.uptime()
            };
            if (user) {
                // Ambil statistik user dari database
                const userChats = await findByUserId(user.id, 1000);
                stats.totalChats = userChats.length;
                // Hitung sesi unik
                const uniqueSessions = new Set(userChats.map(chat => chat.sessionId));
                stats.totalSessions = uniqueSessions.size;
                // Hitung average response time (mock untuk sekarang)
                stats.averageResponseTime = Math.random() * 1000 + 500; // 500-1500ms
            }
            return res.status(200).json({
                success: true,
                data: {
                    ...stats,
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error('Get Stats Error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get statistics'
            });
        }
    }
    /**
     * Get chat history from database with pagination
     */
    async getHistory(req, res) {
        try {
            const { sessionId, page = 1, limit = 20 } = req.query;
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            const currentSessionId = sessionId || `session_${user.id}`;
            // Ambil history dari database
            const history = await findBySessionId(currentSessionId, Number(limit));
            // Format untuk response
            const formattedHistory = history.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.message || msg.response,
                timestamp: msg.timestamp,
                sessionId: msg.sessionId
            }));
            return res.json({
                success: true,
                data: {
                    history: formattedHistory,
                    sessionId: currentSessionId,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: formattedHistory.length
                    },
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error('Get History Error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch chat history'
            });
        }
    }
    /**
     * Get auto-suggestions based on user's chat history
     */
    async getSuggestions(req, res) {
        try {
            const { sessionId } = req.query;
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            const currentSessionId = sessionId || `session_${user.id}`;
            // Ambil recent history untuk analisis
            const recentHistory = await findBySessionId(currentSessionId, 5);
            // Generate suggestions berdasarkan pattern
            const suggestions = this.generateSuggestions(recentHistory);
            return res.json({
                success: true,
                data: {
                    suggestions,
                    sessionId: currentSessionId,
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error('Get Suggestions Error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to generate suggestions'
            });
        }
    }
    /**
     * Generate smart suggestions based on chat patterns
     */
    generateSuggestions(history) {
        const suggestions = [];
        // Default suggestions
        const defaultSuggestions = [
            "Bisakah kamu menjelaskan lebih detail?",
            "Apa contoh nyata dari ini?",
            "Bagaimana cara menerapkannya?",
            "Apa keuntungan dan kerugiannya?",
            "Apakah ada alternatif lain?"
        ];
        // Analisis pattern dari history
        if (history.length > 0) {
            const lastMessages = history.slice(-3);
            const topics = lastMessages.map(msg => msg.message || msg.response).join(' ').toLowerCase();
            // Pattern-based suggestions
            if (topics.includes('bagaimana') || topics.includes('cara')) {
                suggestions.push("Apakah ada langkah-langkah spesifik yang harus saya ikuti?");
                suggestions.push("Apa saja yang perlu disiapkan?");
            }
            if (topics.includes('apa') || topics.includes('mengapa')) {
                suggestions.push("Bisakah berikan contoh konkrit?");
                suggestions.push("Apa implikasi dari ini?");
            }
            if (topics.includes('bantuan') || topics.includes('tolong')) {
                suggestions.push("Apa masalah spesifik yang Anda hadapi?");
                suggestions.push("Saya siap membantu, jelaskan lebih detail.");
            }
        }
        // Tambahkan default suggestions jika belum ada
        if (suggestions.length < 3) {
            suggestions.push(...defaultSuggestions.slice(0, 3 - suggestions.length));
        }
        return suggestions.slice(0, 5); // Maksimal 5 suggestions
    }
    /**
     * Clear chat history from database
     */
    async clearChat(req, res) {
        try {
            const { sessionId } = req.query;
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            const currentSessionId = sessionId || `session_${user.id}`;
            // Hapus history dari database
            const deletedCount = await ChatMessage.destroy({
                where: { sessionId: currentSessionId }
            });
            return res.json({
                success: true,
                data: {
                    message: 'Chat history cleared successfully',
                    sessionId: currentSessionId,
                    deletedCount,
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error('Clear Chat Error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to clear chat history'
            });
        }
    }
}
export default ImprovedChatController;
