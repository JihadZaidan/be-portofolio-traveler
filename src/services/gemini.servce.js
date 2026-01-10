import { geminiModel } from "../config/gemini.config.js";

export const chatWithGemini = async (message, history = []) => {
    try {
        if (!message || typeof message !== 'string') {
            throw new Error('Message must be a non-empty string');
        }

        if (!Array.isArray(history)) {
            throw new Error('History must be an array');
        }

        const chat = geminiModel.startChat({
            history,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
            },
        });
        

        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (error) {
        console.error('Gemini API Error:', error.message);
        throw new Error(`Failed to chat with Gemini: ${error.message}`);
    }
}