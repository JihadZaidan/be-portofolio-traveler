import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
/**
 * Konfigurasi API Gemini dengan persona chatbot profesional
 */
class GeminiService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
            systemInstruction: `Anda adalah asisten chatbot profesional yang cerdas, ramah, dan solutif. 
        Gunakan bahasa Indonesia yang baik dan benar namun tetap santai. 
        Berikan jawaban yang jelas, ringkas, dan membantu.
        
        Persona:
        - Nama: AI Assistant
        - Gaya: Profesional namun ramah
        - Bahasa: Indonesia
        - Fokus: Memberikan solusi yang praktis dan berguna
        
        Jika tidak tahu jawabannya, katakan dengan jujur dan sarankan alternatif jika memungkinkan.
        Hindari memberikan informasi yang berbahaya atau menyesatkan.`,
        });
    }
    /**
     * Enhanced chat with auto-context and smart responses
     */
    async chatWithGemini(userInput, history = [], maxRetries = 3, context) {
        if (!userInput || userInput.trim() === '') {
            throw new Error('Input pesan tidak boleh kosong');
        }
        // Enhanced system instruction dengan context awareness
        let systemInstruction = this.getBaseSystemInstruction();
        if (context?.previousTopics && context.previousTopics.length > 0) {
            systemInstruction += `\n\nKonteks Percakapan Sebelumnya:\nTopik yang telah dibahas: ${context.previousTopics.join(', ')}\n`;
            systemInstruction += 'Gunakan informasi ini untuk memberikan respons yang lebih relevan dan kontekstual.';
        }
        // Create model dengan dynamic system instruction
        const model = this.genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
            systemInstruction
        });
        const chat = model.startChat({
            history,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
            },
        });
        // Implementasi Exponential Backoff untuk menangani error API
        let retries = maxRetries;
        let baseDelay = 1000;
        while (retries > 0) {
            try {
                console.log(`Mencoba mengirim pesan... (sisa ${retries} percobaan)`);
                const result = await Promise.race([
                    chat.sendMessage(userInput),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 30000))
                ]);
                const response = await result.response;
                const text = response.text();
                console.log('✅ Berhasil mendapatkan respons');
                // Extract topics untuk context future
                const topics = this.extractTopics(text);
                if (context?.previousTopics) {
                    context.previousTopics = [...new Set([...context.previousTopics, ...topics])].slice(-5);
                }
                return text;
            }
            catch (error) {
                console.error(`❌ Error (sisa ${retries} percobaan):`, error.message);
                if (error.status === 429) {
                    const waitTime = baseDelay * (maxRetries - retries + 1);
                    console.log(`⏳ Rate limit tercapai, menunggu ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    retries--;
                    continue;
                }
                else if (error.status === 500 || error.status === 503) {
                    const waitTime = baseDelay * (maxRetries - retries + 1);
                    console.log(`🔄 Server error, mencoba lagi dalam ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    retries--;
                    continue;
                }
                else if (error.message?.includes('timeout')) {
                    const waitTime = baseDelay * 2;
                    console.log(`⏰ Timeout, mencoba lagi dalam ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    retries--;
                    continue;
                }
                else {
                    console.error('💥 Fatal error:', error);
                    return this.generateErrorResponse(error);
                }
            }
        }
        return '❌ Koneksi sedang sibuk. Silakan coba beberapa saat lagi.';
    }
    /**
     * Get base system instruction
     */
    getBaseSystemInstruction() {
        return `Anda adalah asisten chatbot profesional yang cerdas, ramah, dan solutif. 
        Gunakan bahasa Indonesia yang baik dan benar namun tetap santai. 
        Berikan jawaban yang jelas, ringkas, dan membantu.
        
        Persona:
        - Nama: AI Assistant
        - Gaya: Profesional namun ramah
        - Bahasa: Indonesia
        - Fokus: Memberikan solusi yang praktis dan berguna
        
        Panduan Respons:
        1. Selalu perhatikan konteks percakapan sebelumnya
        2. Berikan jawaban yang relevan dengan topik yang sedang dibahas
        3. Jika topik berubah, berikan transisi yang smooth
        4. Gunakan contoh nyata jika memungkinkan
        5. Jika tidak tahu jawabannya, katakan dengan jujur dan sarankan alternatif
        
        Hindari memberikan informasi yang berbahaya atau menyesatkan.`;
    }
    /**
     * Extract topics dari response untuk context management
     */
    extractTopics(text) {
        const topics = [];
        // Keywords yang menandakan topik
        const topicKeywords = [
            'pemrograman', 'programming', 'coding', 'developer',
            'bisnis', 'business', 'entrepreneur', 'startup',
            'kesehatan', 'health', 'medis', 'medical',
            'pendidikan', 'education', 'belajar', 'learning',
            'teknologi', 'technology', 'ai', 'artificial intelligence',
            'keuangan', 'finance', 'investasi', 'investment',
            'marketing', 'digital marketing', 'seo'
        ];
        const lowerText = text.toLowerCase();
        topicKeywords.forEach(keyword => {
            if (lowerText.includes(keyword)) {
                topics.push(keyword);
            }
        });
        return topics.slice(0, 3); // Maksimal 3 topik
    }
    /**
     * Generate error response yang user-friendly
     */
    generateErrorResponse(error) {
        if (error.message?.includes('quota')) {
            return 'Maaf, kuota API telah habis. Silakan coba lagi nanti.';
        }
        else if (error.message?.includes('invalid')) {
            return 'Maaf, format permintaan tidak valid. Silakan periksa kembali pesan Anda.';
        }
        else if (error.message?.includes('blocked')) {
            return 'Maaf, permintaan Anda diblokir karena melanggar kebijakan.';
        }
        else {
            return 'Maaf, terjadi gangguan pada sistem kami. Mohon coba beberapa saat lagi.';
        }
    }
    /**
     * Format history untuk Gemini API
     */
    formatHistory(history) {
        return history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.parts[0]?.text || '' }]
        }));
    }
    /**
     * Validasi input pengguna
     */
    validateInput(input) {
        if (!input || input.trim() === '') {
            return { isValid: false, error: 'Pesan tidak boleh kosong' };
        }
        if (input.length > 4000) {
            return { isValid: false, error: 'Pesan terlalu panjang (maksimal 4000 karakter)' };
        }
        if (input.length < 2) {
            return { isValid: false, error: 'Pesan terlalu pendek (minimal 2 karakter)' };
        }
        return { isValid: true };
    }
}
export default GeminiService;
