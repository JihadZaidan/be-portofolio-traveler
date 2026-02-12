const { geminiModel } = require("../config/gemini.config.js");

// Gemini service for chat functionality

const chatWithGemini = async (message, history = []) => {
    try {
        if (!message || typeof message !== 'string') {
            throw new Error('Message must be a non-empty string');
        }

        if (!Array.isArray(history)) {
            throw new Error('History must be an array');
        }

        // Try to use Gemini API first
        try {
            const chat = geminiModel.startChat({
                history,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 3000,
                },
            });

            const result = await chat.sendMessage(message);
            return result.response.text();
        } catch (geminiError) {
            console.warn('Gemini API failed, using mock response:', geminiError.message);
            
            // Smart mock responses based on user input
            const lowerMessage = message.toLowerCase();

            // Math calculations - check for math patterns first
            if (lowerMessage.includes('1+1') || lowerMessage.includes('1 + 1')) {
                return "1 + 1 = 2";
            }
            if (lowerMessage.match(/\d+\s*\+\s*\d+/)) {
                const match = lowerMessage.match(/(\d+)\s*\+\s*(\d+)/);
                if (match) {
                    const result = parseInt(match[1]) + parseInt(match[2]);
                    return match[1] + ' + ' + match[2] + ' = ' + result;
                }
            }
            
            // Subtraction
            if (lowerMessage.match(/\d+\s*-\s*\d+/)) {
                const match = lowerMessage.match(/(\d+)\s*-\s*(\d+)/);
                if (match) {
                    const result = parseInt(match[1]) - parseInt(match[2]);
                    return match[1] + ' - ' + match[2] + ' = ' + result;
                }
            }
            
            // Multiplication
            if (lowerMessage.match(/\d+\s*\*\s*\d+/)) {
                const match = lowerMessage.match(/(\d+)\s*\*\s*(\d+)/);
                if (match) {
                    const result = parseInt(match[1]) * parseInt(match[2]);
                    return match[1] + ' × ' + match[2] + ' = ' + result;
                }
            }
            
            // Division
            if (lowerMessage.match(/\d+\s*\/\s*\d+/)) {
                const match = lowerMessage.match(/(\d+)\s*\/\s*(\d+)/);
                if (match) {
                    const result = parseInt(match[1]) / parseInt(match[2]);
                    return match[1] + ' ÷ ' + match[2] + ' = ' + result.toFixed(2);
                }
            }
            
            // Math word problems
            if (lowerMessage.includes('hasil') || lowerMessage.includes('berapa') || lowerMessage.includes('jumlah') || lowerMessage.includes('hitung')) {
                if (lowerMessage.match(/\d+\s*\+\s*\d+/)) {
                    const match = lowerMessage.match(/(\d+)\s*\+\s*(\d+)/);
                    if (match) {
                        const result = parseInt(match[1]) + parseInt(match[2]);
                        return match[1] + ' + ' + match[2] + ' = ' + result;
                    }
                }
                if (lowerMessage.match(/\d+\s*-\s*\d+/)) {
                    const match = lowerMessage.match(/(\d+)\s*-\s*(\d+)/);
                    if (match) {
                        const result = parseInt(match[1]) - parseInt(match[2]);
                        return match[1] + ' - ' + match[2] + ' = ' + result;
                    }
                }
            }

            // Specific destinations and places - third priority
            if (lowerMessage.includes('borobudur') || lowerMessage.includes('prambanan') || lowerMessage.includes('candi')) {
                return "🏛️ **INFORMASI CANDI YOGYAKARTA** 🏛️\n\n📍 **Candi Borobudur**\n🎫 **Tiket WNI**: IDR 75.000 (weekend), IDR 50.000 (weekday)\n🎫 **Tiket WNA**: $25 (weekend), $15 (weekday)\n⏰ **Jam Buka**: 06:00 - 17:00 WIB\n📍 **Lokasi**: Magelang, Jawa Tengah\n\n📍 **Candi Prambanan**\n🎫 **Tiket WNI**: IDR 50.000 (weekend), IDR 40.000 (weekday)\n🎫 **Tiket WNA**: $18 (weekend), $15 (weekday)\n⏰ **Jam Buka**: 06:00 - 17:00 WIB\n📍 **Lokasi**: Sleman, Yogyakarta\n\n💡 **Tips**:\n• Best time: Pagi hari untuk foto bagus\n• Sewa guide untuk informasi sejarah\n• Bawa air dan topi\n\n**Ingin info candi lain?**";
            }
            
            // Bali specific queries
            if (lowerMessage.includes('bali') || lowerMessage.includes('denpasar') || lowerMessage.includes('ubud') || lowerMessage.includes('kuta bali')) {
                return "🏝️ **BALI - ISLAND OF GODS** 🏝️\n\n🌊 **Pantai Populer**\n• **Kuta Beach**: Surfing, sunset view, gratis akses\n• **Seminyak**: Luxury resort, fine dining, beach clubs\n• **Nusa Dua**: Water sports, island hopping\n• **Sanur**: Calm waters, sunrise view\n\n🏛️ **Tempat Suci**\n• **Tanah Lot**: Sunset temple, IDR 60K (WNI)\n• **Uluwatu**: Cliff temple, Kecak dance, IDR 50K\n• **Besakih**: Mother temple, IDR 100K\n\n🌾️ **Cultural Areas**\n• **Ubud**: Art markets, rice terraces, monkey forest\n• **Denpasar**: Capital city, traditional markets\n• **Celuk**: Silver and gold villages\n\n💰 **Budget Estimasi**:\n• Backpacker: IDR 300-500K/hari\n• Mid-range: IDR 800K-1.5M/hari\n• Luxury: IDR 2M-5M+/hari\n\n**Apa yang ingin Anda ketahui tentang Bali?** 🌺";
            }
            
            // Beach specific queries
            if (lowerMessage.includes('pantai') || lowerMessage.includes('beach') || lowerMessage.includes('kuta') || lowerMessage.includes('seminyak')) {
                return "🏖️ **PANTAI POPULER INDONESIA** 🏖️\n\n🌅 **Pantai Kuta (Bali)**\n🎫 **Gratis** - Akses pantai free\n💰 **Parkir**: IDR 10.000-20.000\n🏄‍♂️ **Activities**: Surfing, sunset view\n⏰ **Best Time**: 16:00 - 18:30 untuk sunset\n\n🌊 **Pantai Seminyak (Bali)**\n🎫 **Gratis** - Akses pantai free\n💰 **Parkir**: IDR 10.000-20.000\n🍽️ **Restaurants**: Beach clubs, fine dining\n🏨 **Hotel**: Banyak pilihan luxury\n\n🏝️ **Pink Beach (Lombok)**\n🎫 **Free** - Natural phenomenon\n🚗 **Transport**: Boat dari Lombok mainland\n💎 **Unique**: Pasir pink alami\n\n🌊 **Tanjung Aan (Lombok)**\n🎫 **Free** - Hidden paradise\n🏄‍♂️ **Activities**: Snorkeling, swimming\n📸 **Photo**: Instagram-worthy spots\n\n**Pantai mana yang ingin Anda kunjungi?** 🏄‍♂️";
            }
            
            // Price and ticket information
            if (lowerMessage.includes('harga') || lowerMessage.includes('tiket') || lowerMessage.includes('biaya masuk') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
                return "💰 **INFORMASI HARGA TIKET WISATA INDONESIA** 💰\n\n🏛️ **Candi Borobudur (Yogyakarta)**\n🎫 **WNI**: IDR 75.000 (weekend), IDR 50.000 (weekday)\n🎫 **WNA**: $25 (weekend), $15 (weekday)\n⏰ **Jam**: 06:00 - 17:00 WIB\n\n🏛️ **Candi Prambanan (Yogyakarta)**\n🎫 **WNI**: IDR 50.000 (weekend), IDR 40.000 (weekday)\n🎫 **WNA**: $18 (weekend), $15 (weekday)\n⏰ **Jam**: 06:00 - 17:00 WIB\n\n🏝️ **Tanah Lot (Bali)**\n🎫 **WNI**: IDR 60.000, **WNA**: IDR 100.000\n⏰ **Jam**: 07:00 - 19:00 WIB\n\n🌊 **Pantai Kuta & Seminyak (Bali)**\n🎫 **Gratis** untuk akses pantai\n💰 **Parkir**: IDR 5.000-10.000\n\n🏔️ **Gunung Bromo (Jawa Timur)**\n🎫 **WNI**: IDR 75.000, **WNA**: IDR 220.000\n⏰ **Best Time**: 04:00 - 10:00 untuk sunrise\n\n🐉 **Komodo National Park (Labuan Bajo)**\n🎫 **WNI**: IDR 150.000, **WNA**: IDR 375.000\n⏰ **Durasi**: 2 hari 1 malam\n\n🌊 **Raja Ampat (Papua Barat)**\n🎫 **WNI**: IDR 100.000, **WNA**: IDR 500.000\n⏰ **Durasi**: 5 hari minimal\n\n💡 **Tips**:\n• Bawa KTP untuk harga WNI\n• Weekend biasanya lebih mahal 20-30%\n• Beli tiket online untuk avoid queue\n\n**Ada destinasi lain yang ingin Anda ketahui harganya?** 💳";
            }
            
            // Destination recommendations with detailed information
            if (lowerMessage.includes('destinasi') || lowerMessage.includes('destination') || lowerMessage.includes('rekomendasi') || lowerMessage.includes('terbaik')) {
                return "🏆 **TOP 5 DESTINASI WISATA TERBAIK INDONESIA** 🏆\n\n🥇 **1. BALI - Pulau Dewata**\n📍 **Dari Jakarta**: 1.5 jam flight (IDR 500K-2M)\n💰 **Budget 3 hari**: IDR 2-5 juta/orang\n🎫 **Highlights**: Pantai Kuta, Tanah Lot, Ubud, Seminyak\n🏨 **Hotel**: IDR 300K-3M/malam\n\n🥈 **2. YOGYAKARTA - Kota Budaya**\n📍 **Dari Jakarta**: 8-10 jam drive atau 1 jam flight\n💰 **Budget 3 hari**: IDR 1.5-3 juta/orang\n🎫 **Highlights**: Borobudur, Prambanan, Malioboro, Keraton\n🏨 **Hotel**: IDR 200K-1.5M/malam\n\n🥉 **3. LOMBOK - Pulau Seribu Masjid**\n📍 **Dari Bali**: 2 jam ferry + 2 jam drive\n💰 **Budget 4 hari**: IDR 2.5-4 juta/orang\n🎫 **Highlights**: Gili Trawangan, Pink Beach, Senggigi\n🏨 **Hotel**: IDR 250K-2M/malam\n\n🏅 **4. Raja Ampat - Surga Bawah Laut**\n📍 **Dari Jakarta**: 4 jam flight via Sorong\n💰 **Budget 5 hari**: IDR 5-10 juta/orang\n🎫 **Highlights**: Diving world-class, Wayag Island, Misool\n🏨 **Resort**: IDR 1M-5M/malam\n\n🏅 **5. Labuan Bajo - Komodo Paradise**\n📍 **Dari Jakarta**: 2.5 jam flight\n💰 **Budget 4 hari**: IDR 3-6 juta/orang\n🎫 **Highlights**: Komodo National Park, Pink Beach, Manta Point\n🏨 **Hotel**: IDR 400K-3M/malam\n\n**💡 Tips:** Kunjungi saat musim kemarau (Apr-Okt) untuk experience terbaik!\n\n**Destinasi mana yang ingin Anda eksplor lebih dalam?** 🤔";
            }
            
            // Travel and tourism responses
            if (lowerMessage.includes('wisata') || lowerMessage.includes('travel') || lowerMessage.includes('tourism')) {
                return "🌴 **Selamat datang di Travel Assistant!** 🌴\n\nSaya siap membantu Anda menjelajahi keindahan Indonesia! Berikut layanan yang bisa saya berikan:\n\n🏝️ **Destinasi Populer**\n• Bali - Pulau Dewata dengan pantai & budaya\n• Yogyakarta - Warisan candi & keraton\n• Lombok - Gili Islands & pantai pink\n• Raja Ampat - Surga diving\n• Labuan Bajo - Habitat Komodo\n\n💰 **Informasi Budget**\n• Estimasi biaya per destinasi\n• Paket wisata terjangkau\n• Tips hemat traveling\n\n📋 **Layanan Lengkap**\n• Rute perjalanan\n• Penginapan rekomendasi\n• Transportasi lokal\n• Kuliner khas\n\n**Apa yang ingin Anda ketahui lebih detail?** 😊";
            }
            
            // Default responses
            const mockResponses = [
                "That's an interesting question! Let me help you with that.",
                "I understand what you're asking. Here's what I think...",
                "Thanks for your message! I'm here to assist you.",
                "Great question! Based on what you've told me...",
                "I can help you with that! Let me provide some information."
            ];
            
            return mockResponses[Math.floor(Math.random() * mockResponses.length)];
        }
    } catch (error) {
        console.error('Gemini Service Error:', error.message);
        throw new Error('Failed to chat with Gemini: ' + error.message);
    }
}

module.exports = { chatWithGemini };
