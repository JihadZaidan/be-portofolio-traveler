import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface ChatResponse {
  success: boolean;
  data: {
    response: string;
    timestamp: string;
    sessionId?: string;
  };
  error?: string;
}

/**
 * Konfigurasi API Gemini dengan persona chatbot profesional
 */
class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
      systemInstruction: `Anda adalah Travello Assistant, asisten chatbot profesional yang cerdas, ramah, dan ahli dalam bidang pariwisata. 
        Gunakan bahasa Indonesia yang baik dan benar namun tetap santai dan menarik. 
        Berikan jawaban yang jelas, ringkas, dan membantu khususnya untuk kebutuhan perjalanan dan wisata.
        
        Persona:
        - Nama: Travello Assistant
        - Gaya: Profesional namun ramah dan antusias tentang traveling
        - Bahasa: Indonesia
        - Fokus: Memberikan solusi perjalanan yang praktis, tips wisata, dan rekomendasi destinasi
        - Keahlian: Destinasi wisata Indonesia dan internasional, tips perjalanan, akomodasi, kuliner, budaya lokal
        
        Panduan Respons:
        1. Fokus pada informasi pariwisata, perjalanan, dan pengalaman travel
        2. Berikan rekomendasi destinasi yang relevan dengan preferensi user
        3. Sertakan tips praktis untuk perjalanan yang aman dan nyaman
        4. Berikan informasi tentang kuliner lokal, budaya, dan atraksi wisata
        5. Sarankan akomodasi dan transportasi yang sesuai budget
        6. Jika ditanya tentang hal selain travel, arahkan kembali dengan cara yang ramah
        
        Contoh topik yang bisa dibahas:
        - Destinasi wisata populer dan tersembunyi
        - Tips packing dan persiapan perjalanan
        - Rekomendasi hotel, hostel, atau penginapan
        - Kuliner khas daerah/tempat tujuan
        - Transportasi lokal dan cara navigasi
        - Budaya lokal dan etika berwisata
        - Aktivitas wisata yang bisa dilakukan
        - Tips hemat saat traveling
        - Musim terbaik untuk berkunjung ke suatu tempat
        
        Jika tidak tahu jawabannya, katakan dengan jujur dan sarankan alternatif jika memungkinkan.
        Hindari memberikan informasi yang berbahaya atau menyesatkan.`,
    });
  }

  /**
   * Enhanced chat with auto-context and smart responses
   */
  async chatWithGemini(
    userInput: string, 
    history: ChatMessage[] = [], 
    maxRetries: number = 3,
    context?: {
      sessionId?: string;
      userId?: string;
      previousTopics?: string[];
    }
  ): Promise<string> {
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
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 30000)
          )
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
        
      } catch (error: any) {
        console.error(`❌ Error (sisa ${retries} percobaan):`, error.message);
        
        if (error.status === 429) {
          const waitTime = baseDelay * (maxRetries - retries + 1);
          console.log(`⏳ Rate limit tercapai, menunggu ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries--;
          continue;
          
        } else if (error.status === 500 || error.status === 503) {
          const waitTime = baseDelay * (maxRetries - retries + 1);
          console.log(`🔄 Server error, mencoba lagi dalam ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries--;
          continue;
          
        } else if (error.message?.includes('timeout')) {
          const waitTime = baseDelay * 2;
          console.log(`⏰ Timeout, mencoba lagi dalam ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries--;
          continue;
          
        } else {
          console.error('💥 Fatal error:', error);
          return this.generateErrorResponse(error);
        }
      }
    }

    return '❌ Koneksi sedang sibuk. Silakan coba beberapa saat lagi.';
  }

  /**
   * Streaming chat response for better UX
   */
  async *chatWithGeminiStream(
    userInput: string, 
    history: ChatMessage[] = [],
    context?: {
      sessionId?: string;
      userId?: string;
      previousTopics?: string[];
    }
  ): AsyncGenerator<string, void, unknown> {
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

    try {
      console.log('🚀 Memulai streaming response...');
      
      const result = await chat.sendMessageStream(userInput);
      let fullResponse = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullResponse += chunkText;
          yield chunkText;
        }
      }
      
      // Extract topics untuk context future
      const topics = this.extractTopics(fullResponse);
      if (context?.previousTopics) {
        context.previousTopics = [...new Set([...context.previousTopics, ...topics])].slice(-5);
      }
      
      console.log('✅ Streaming response selesai');
      
    } catch (error: any) {
      console.error('❌ Streaming error:', error.message);
      yield this.generateErrorResponse(error);
    }
  }

  /**
   * Get base system instruction
   */
  private getBaseSystemInstruction(): string {
    return `Anda adalah Travello Assistant, asisten chatbot profesional yang cerdas, ramah, dan ahli dalam bidang pariwisata. 
        Gunakan bahasa Indonesia yang baik dan benar namun tetap santai dan menarik. 
        Berikan jawaban yang jelas, ringkas, dan membantu khususnya untuk kebutuhan perjalanan dan wisata.
        
        Persona:
        - Nama: Travello Assistant
        - Gaya: Profesional namun ramah dan antusias tentang traveling
        - Bahasa: Indonesia
        - Fokus: Memberikan solusi perjalanan yang praktis, tips wisata, dan rekomendasi destinasi
        - Keahlian: Destinasi wisata Indonesia dan internasional, tips perjalanan, akomodasi, kuliner, budaya lokal
        
        Panduan Respons:
        1. Selalu perhatikan konteks percakapan sebelumnya
        2. Fokus pada informasi pariwisata, perjalanan, dan pengalaman travel
        3. Berikan rekomendasi destinasi yang relevan dengan preferensi user
        4. Sertakan tips praktis untuk perjalanan yang aman dan nyaman
        5. Berikan informasi tentang kuliner lokal, budaya, dan atraksi wisata
        6. Sarankan akomodasi dan transportasi yang sesuai budget
        7. Jika topik berubah dari travel, arahkan kembali dengan cara yang ramah
        8. Gunakan contoh nyata dan pengalaman praktis jika memungkinkan
        9. Jika tidak tahu jawabannya, katakan dengan jujur dan sarankan alternatif
        
        Hindari memberikan informasi yang berbahaya atau menyesatkan.`;
  }

  /**
   * Extract topics dari response untuk context management
   */
  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    
    // Travel-related keywords yang menandakan topik
    const topicKeywords = [
      // Destinasi
      'bali', 'jakarta', 'yogyakarta', 'bandung', 'surabaya', 'malang', 'lombok', 'riau', 'medan', 'makassar',
      'pantai', 'gunung', 'danau', 'air terjun', 'pulau', 'kota', 'desa', 'wisata', 'destinasi',
      
      // Aktivitas Travel
      'traveling', 'liburan', 'vacation', 'trip', 'jalan-jalan', 'wisata', 'petualangan', 'ekspedisi',
      'snorkeling', 'diving', 'hiking', 'climbing', 'camping', 'surfing', 'photography',
      
      // Akomodasi & Transportasi
      'hotel', 'hostel', 'guesthouse', 'villa', 'resort', 'penginapan', 'homestay',
      'pesawat', 'kereta', 'bus', 'kapal', 'mobil', 'motor', 'transportasi',
      
      // Kuliner
      'kuliner', 'makanan', 'minuman', 'restoran', 'cafe', 'warung', 'street food', 'khas',
      
      // Tips & Persiapan
      'packing', 'persiapan', 'tips', 'budget', 'hemat', 'aman', 'nyaman', 'cuaca', 'musim',
      
      // Budaya & Alam
      'budaya', 'tradisi', 'sejarah', 'alam', 'pemandangan', 'sunset', 'sunrise', 'festival',
      'museum', 'candi', 'kuil', 'masjid', 'gereja', 'monumen',
      
      // General Travel
      'pariwisata', 'turis', 'wisatawan', 'guide', 'pemandu', 'itinerary', 'rute', 'petualangan'
    ];
    
    const lowerText = text.toLowerCase();
    
    topicKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        topics.push(keyword);
      }
    });
    
    return topics.slice(0, 5); // Maksimal 5 topik untuk travel context
  }

  /**
   * Generate error response yang user-friendly dengan travel context
   */
  private generateErrorResponse(error: any): string {
    if (error.message?.includes('quota')) {
      return 'Maaf, kuota Travello Assistant telah habis. Silakan coba lagi nanti atau hubungi admin untuk informasi lebih lanjut.';
    } else if (error.message?.includes('invalid')) {
      return 'Maaf, format permintaan tidak valid. Pastikan pesan Anda jelas dan terkait dengan informasi perjalanan.';
    } else if (error.message?.includes('blocked')) {
      return 'Maaf, permintaan Anda diblokir karena melanggar kebijakan. Travello Assistant siap membantu informasi perjalanan yang aman dan positif.';
    } else if (error.message?.includes('timeout')) {
      return 'Maaf, respons Travello Assistant terlalu lama. Silakan coba lagi dengan pertanyaan yang lebih singkat.';
    } else if (error.message?.includes('network') || error.message?.includes('connection')) {
      return 'Maaf, terjadi masalah koneksi. Pastikan Anda terhubung ke internet dan coba lagi.';
    } else if (error.message?.includes('rate limit')) {
      return 'Maaf, terlalu banyak permintaan dalam waktu singkat. Silakan tunggu beberapa saat sebelum bertanya lagi.';
    } else {
      return 'Maaf, Travello Assistant sedang mengalami gangguan. Mohon coba beberapa saat lagi atau hubungi support jika masalah berlanjut.';
    }
  }

  /**
   * Format history untuk Gemini API
   */
  formatHistory(history: ChatMessage[]): ChatMessage[] {
    return history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts[0]?.text || '' }]
    }));
  }

  /**
   * Validasi input pengguna
   */
  validateInput(input: string): { isValid: boolean; error?: string } {
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
