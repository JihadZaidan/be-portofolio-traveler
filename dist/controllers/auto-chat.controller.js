import { createMessage, findBySessionId, ChatMessage } from '../models/ChatMessage.model.js';
import GeminiService from '../services/gemini.service.js';
export class AutoChatController {
    constructor() {
        this.geminiService = new GeminiService();
        this.travelKnowledgeBase = new Map();
        this.initializeTravelKnowledgeBase();
    }
    /**
     * Initialize travel knowledge base for auto-responses
     */
    initializeTravelKnowledgeBase() {
        this.travelKnowledgeBase = new Map([
            ['wisata', [
                    'Bali memiliki banyak destinasi menarik seperti Pantai Kuta, Ubud, Tanah Lot',
                    'Yogyakarta terkenal dengan Candi Borobudur, Prambanan, dan Malioboro',
                    'Raja Ampat di Papua adalah surga diving dengan keindahan bawah laut yang luar biasa',
                    'Labuan Bajo adalah gerbang menuju Komodo Island dan Pink Beach'
                ]],
            ['hotel', [
                    'Untuk budget-friendly, coba hotel bintang 3 di area Kuta atau Seminyak',
                    'Resort mewah di Ubud menawarkan pengalaman spa dan pemandangan sawah',
                    'Villa di Seminyak cocok untuk keluarga dengan fasilitas lengkap',
                    'Hostel di area Gili Trawangan untuk backpacker dengan harga terjangkau'
                ]],
            ['transportasi', [
                    'Go-Jek dan Grab adalah transportasi online paling populer di Indonesia',
                    'Kereta api adalah pilihan terbaik untuk Jakarta-Surabaya dengan harga terjangkau',
                    'Pesawat adalah pilihan tercepat untuk jarak jauh, banyak promo dari maskapai lokal',
                    'Sewa mobil dengan sopir direkomendasikan untuk explore Bali'
                ]],
            ['makanan', [
                    'Nasi Goreng adalah hidangan nasional Indonesia yang wajib dicoba',
                    'Rendang dari Padang adalah salah satu makanan terenak di dunia',
                    'Sate Ayam dengan bumbu kacang adalah street food favorit',
                    'Gado-gado adalah salad Indonesia dengan saus kacang yang lezat'
                ]],
            ['budget', [
                    'Budget backpacker Indonesia bisa Rp 500.000/hari termasuk hostel dan makanan',
                    'Mid-range budget Rp 1.000.000/hari untuk hotel bintang 3 dan restoran',
                    'Luxury travel Rp 3.000.000+/hari untuk resort dan fine dining',
                    'Transportasi menggunakan bus ekonomi bisa hemat 50% biaya perjalanan'
                ]]
        ]);
    }
    /**
     * Auto-generate response based on keywords and context
     */
    generateAutoResponse(message, history) {
        const lowerMessage = message.toLowerCase();
        // Check for travel keywords
        for (const [keyword, responses] of this.travelKnowledgeBase) {
            if (lowerMessage.includes(keyword)) {
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                return this.formatTravelResponse(randomResponse, keyword);
            }
        }
        // Check for greetings
        if (lowerMessage.match(/^(halo|hi|hello|hai|selamat|pagi|sore|malam)/)) {
            return this.generateGreetingResponse(lowerMessage);
        }
        // Check for questions about recommendations
        if (lowerMessage.includes('recom') || lowerMessage.includes('rekomendasi') ||
            lowerMessage.includes('saran') || lowerMessage.includes('suggest')) {
            return this.generateRecommendationResponse(lowerMessage, history);
        }
        // Check for help requests
        if (lowerMessage.includes('bantuan') || lowerMessage.includes('help') ||
            lowerMessage.includes('tolong')) {
            return this.generateHelpResponse();
        }
        // Default response
        return this.generateDefaultResponse();
    }
    /**
     * Format travel response with helpful information
     */
    formatTravelResponse(response, category) {
        const categoryEmojis = {
            'wisata': '🏝️',
            'hotel': '🏨',
            'transportasi': '🚗',
            'makanan': '🍜',
            'budget': '💰'
        };
        const emoji = categoryEmojis[category] || '✈️';
        return `${emoji} ${response}\n\n` +
            `💡 *Tips tambahan:*\n` +
            `• Selalu cek review terbaru sebelum booking\n` +
            `• Bandingkan harga di multiple platform\n` +
            `• Pertimbangkan musim wisata untuk pengalaman terbaik\n\n` +
            `Apakah Anda ingin informasi lebih detail tentang ${category}?`;
    }
    /**
     * Generate contextual greeting response
     */
    generateGreetingResponse(message) {
        const hour = new Date().getHours();
        let greeting = 'Halo!';
        if (hour < 12)
            greeting = 'Selamat pagi! ☀️';
        else if (hour < 15)
            greeting = 'Selamat siang! 🌤️';
        else if (hour < 18)
            greeting = 'Selamat sore! 🌅';
        else
            greeting = 'Selamat malam! 🌙';
        return `${greeting} Saya adalah TRAVELLO, asisten travel pintar Anda.\n\n` +
            `🎯 *Saya bisa membantu Anda dengan:*\n` +
            `• 📍 Destinasi wisata terbaik di Indonesia\n` +
            `• 🏨 Rekomendasi hotel dan akomodasi\n` +
            `• 🚗 Info transportasi dan rute perjalanan\n` +
            `• 🍜 Kuliner khas daerah\n` +
            `• 💰 Tips budget traveling\n\n` +
            `Apa yang ingin Anda ketahui tentang traveling di Indonesia?`;
    }
    /**
     * Generate recommendation response based on context
     */
    generateRecommendationResponse(message, history) {
        const recentTopics = history.slice(-3).map(msg => (msg.message || msg.response).toLowerCase()).join(' ');
        let recommendations = '🎯 *Rekomendasi Travel untuk Anda:*\n\n';
        if (recentTopics.includes('bali') || recentTopics.includes('pantai')) {
            recommendations += `🏝️ **Bali** - Pulau Dewata\n` +
                `• Pantai Kuta, Seminyak, Nusa Dua\n` +
                `• Ubud untuk culture dan nature\n` +
                `• Budget: Rp 1-3 juta untuk 3 hari\n\n`;
        }
        if (recentTopics.includes('gunung') || recentTopics.includes('hiking')) {
            recommendations += `⛰️ **Gunung Bromo** - Sunrise terbaik\n` +
                `• Trekking mudah untuk pemula\n` +
                `• Best time: April-Oktober\n` +
                `• Budget: Rp 500-800 ribu\n\n`;
        }
        if (recommendations === '🎯 *Rekomendasi Travel untuk Anda:*\n\n') {
            recommendations += `🌟 **Top Destinations 2024:**\n\n` +
                `1. **Raja Ampat** - Paradise diving\n` +
                `2. **Labuan Bajo** - Komodo adventure\n` +
                `3. **Yogyakarta** - Cultural heritage\n` +
                `4. **Bali** - Classic favorite\n` +
                `5. **Lombok** - Hidden gems\n\n` +
                `Mau detail tentang destinasi mana?`;
        }
        return recommendations;
    }
    /**
     * Generate help response
     */
    generateHelpResponse() {
        return `🤝 *Saya siap membantu perjalanan Anda!*\n\n` +
            `**Cara menggunakan saya:**\n` +
            `1. Ketik destinasi yang Anda minati (contoh: "Bali", "Yogyakarta")\n` +
            `2. Tanya tentang kategori (contoh: "hotel murah", "makanan khas")\n` +
            `3. Minta rekomendasi (contoh: "recom wisata keluarga")\n` +
            `4. Diskusi budget (contoh: "budget 1 juta")\n\n` +
            `**Keywords yang saya pahami:**\n` +
            `• 🏝️ Wisata, destinasi, pantai, gunung\n` +
            `• 🏨 Hotel, penginapan, villa, hostel\n` +
            `• 🚗 Transportasi, travel, rental mobil\n` +
            `• 🍜 Makanan, kuliner, resto\n` +
            `• 💰 Budget, hemat, promo\n\n` +
            `Silakan mulai dengan pertanyaan Anda! 😊`;
    }
    /**
     * Generate default response
     */
    generateDefaultResponse() {
        return `🤔 Saya belum paham pertanyaan Anda. Mari saya bantu!\n\n` +
            `**Coba tanya seperti ini:**\n` +
            `• "Rekomendasi wisata di Bali"\n` +
            `• "Hotel murah di Yogyakarta"\n` +
            `• "Transportasi ke Labuan Bajo"\n` +
            `• "Makanan khas Padang"\n` +
            `• "Budget traveling 2 juta"\n\n` +
            `Atau ketik "bantuan" untuk panduan lengkap! 🎯`;
    }
    /**
     * Main chat endpoint with auto-responses
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
            // Validate input
            if (!message || message.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'Pesan tidak boleh kosong'
                });
            }
            // Generate session ID
            const currentSessionId = sessionId || `session_${user.id}_${Date.now()}`;
            // Get chat history for context
            const dbHistory = await findBySessionId(currentSessionId, 10);
            // Generate auto-response
            const autoResponse = this.generateAutoResponse(message, dbHistory);
            // Save user message
            await createMessage({
                sessionId: currentSessionId,
                userId: user.id,
                message: message,
                response: '',
                role: 'user',
                timestamp: new Date()
            });
            // Save auto-response
            await createMessage({
                sessionId: currentSessionId,
                userId: user.id,
                message: '',
                response: autoResponse,
                role: 'ai',
                timestamp: new Date()
            });
            // Generate suggestions based on response
            const suggestions = this.generateContextualSuggestions(autoResponse);
            const chatResponse = {
                success: true,
                data: {
                    response: autoResponse,
                    timestamp: new Date().toISOString(),
                    sessionId: currentSessionId,
                    suggestions
                }
            };
            // Log for monitoring
            console.log(`[${new Date().toISOString()}] Auto Chat Success:`, {
                userId: user.id,
                sessionId: currentSessionId,
                messageLength: message.length,
                responseLength: autoResponse.length,
                isAutoResponse: true
            });
            return res.json(chatResponse);
        }
        catch (error) {
            console.error('Auto Chat API Error:', error);
            const errorResponse = {
                success: false,
                error: 'Gagal menghasilkan respons. Silakan coba lagi.',
                data: {
                    response: '',
                    timestamp: new Date().toISOString(),
                    sessionId: ''
                }
            };
            return res.status(500).json(errorResponse);
        }
    }
    /**
     * Generate contextual suggestions based on response
     */
    generateContextualSuggestions(response) {
        const lowerResponse = response.toLowerCase();
        const suggestions = [];
        if (lowerResponse.includes('bali')) {
            suggestions.push('Hotel murah di Bali', 'Transportasi di Bali', 'Makanan khas Bali');
        }
        else if (lowerResponse.includes('yogyakarta') || lowerResponse.includes('jogja')) {
            suggestions.push('Candi Borobudur', 'Malioboro shopping', 'Hotel dekat Malioboro');
        }
        else if (lowerResponse.includes('hotel')) {
            suggestions.push('Hotel bintang 3', 'Villa untuk keluarga', 'Hostel backpacker');
        }
        else if (lowerResponse.includes('budget')) {
            suggestions.push('Budget 1 juta', 'Tips hemat traveling', 'Promo terbaru');
        }
        else if (lowerResponse.includes('transportasi')) {
            suggestions.push('Sewa mobil', 'Transportasi online', 'Tiket pesawat murah');
        }
        else {
            suggestions.push('Rekomendasi wisata', 'Hotel terdekat', 'Budget traveling');
        }
        return suggestions.slice(0, 3);
    }
    /**
     * Get chat history
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
            const history = await findBySessionId(currentSessionId, Number(limit));
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
     * Get suggestions based on context
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
            const recentHistory = await findBySessionId(currentSessionId, 5);
            const suggestions = this.generateContextualSuggestions(recentHistory[recentHistory.length - 1]?.response || '');
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
     * Clear chat history
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
            // Delete all messages in session
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
    /**
     * Health check for auto chat
     */
    async healthCheck(req, res) {
        return res.status(200).json({
            success: true,
            data: {
                status: 'Healthy',
                service: 'Auto Chat Bot',
                features: [
                    'Auto-responses based on keywords',
                    'Travel knowledge base',
                    'Contextual suggestions',
                    'Session management',
                    'Chat history'
                ],
                timestamp: new Date().toISOString()
            }
        });
    }
}
