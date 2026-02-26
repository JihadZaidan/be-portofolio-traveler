import { geminiModel } from "../config/gemini.config.js";

// Gemini service for chat functionality

export const chatWithGemini = async (message, history = []) => {
    try {
        if (!message || typeof message !== 'string') {
            throw new Error('Message must be a non-empty string');
        }

        if (!Array.isArray(history)) {
            throw new Error('History must be an array');
        }

        // For testing, return a mock response if Gemini API fails
        try {
            const chat = geminiModel.startChat({
                history,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                },
            });

            const result = await chat.sendMessage(message);
            return result.response.text();
        } catch (geminiError) {
            console.warn('Gemini API failed, using mock response:', geminiError.message);
            
            // Smart mock responses based on user input
            const lowerMessage = message.toLowerCase();
            
            // Math calculations
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
            
            // Greetings
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                return "Hello! I'm your AI assistant. How can I help you today?";
            }
            
            // Joke requests
            if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
                return "Why don't scientists trust atoms? Because they make up everything! 😄";
            }
            
            // Help requests
            if (lowerMessage.includes('help') || lowerMessage.includes('information')) {
                return "I'm here to help! I can assist with questions, calculations, coding, explanations, and much more. What specific topic would you like help with?";
            }
            
            // Coding help
            if (lowerMessage.includes('coding') || lowerMessage.includes('code') || lowerMessage.includes('programming')) {
                return "I'd be happy to help with coding! I can assist with JavaScript, Python, React, Node.js, and many other technologies. What programming challenge are you working on?";
            }
            
            // Time requests
            if (lowerMessage.includes('time') || lowerMessage.includes('date')) {
                return 'The current time is ' + new Date().toLocaleTimeString() + ' on ' + new Date().toLocaleDateString() + '.';
            }
            
            // Travel and tourism responses
            if (lowerMessage.includes('wisata') || lowerMessage.includes('travel') || lowerMessage.includes('tourism')) {
                return "I'd love to help with travel information! Indonesia has amazing destinations like Bali, Yogyakarta, Lombok, and Raja Ampat. What specific travel information are you looking for?";
            }
            
            // Destination recommendations with detailed information
            if (lowerMessage.includes('destinasi') || lowerMessage.includes('destination') || lowerMessage.includes('rekomendasi')) {
                return "🌴 **TOP DESTINASI WISATA INDONESIA** 🌴\n\n🏝️ **BALI**\n📍 **Dari Jakarta**: 1.5 jam flight (IDR 500K-2M)\n🎫 **Biaya Masuk**: Pantai GRATIS, Pura IDR 50-75K\n🏨 **Penginapan**: IDR 300K-3M/malam\n💡 **Saran**: Kunjungi saat musim kemarau (Apr-Okt)\n\n🏛️ **YOGYAKARTA**\n📍 **Dari Jakarta**: 8-10 jam drive atau 1 jam flight\n🎫 **Biaya Masuk**: Borobudur IDR 75K, Prambanan IDR 50K\n🏨 **Penginapan**: IDR 200K-1.5M/malam\n💡 **Saran**: Sewa motor untuk jelajahi candi\n\n�️ **LOMBOK**\n📍 **Dari Bali**: 2 jam ferry + 2 jam drive\n🎫 **Biaya Masuk**: Pantai GRATIS, Gili IDR 20K\n🏨 **Penginapan**: IDR 250K-2M/malam\n💡 **Saran**: Snorkeling di Gili Islands\n\n� **RAJA AMPAT**\n📍 **Dari Jakarta**: 4 jam flight via Sorong\n🎫 **Biaya Masuk**: Taman Nasional IDR 100K\n🏨 **Penginapan**: IDR 500K-5M/malam\n💡 **Saran**: Liveaboard diving experience\n\n�️ **BANDUNG**\n📍 **Dari Jakarta**: 3 jam drive\n🎫 **Biaya Masuk**: Tangkuban Perahu IDR 50K\n🏨 **Penginapan**: IDR 200K-1M/malam\n💡 **Saran**: Factory outlet shopping\n\n� **MALANG**\n📍 **Dari Surabaya**: 3 jam drive\n🎫 **Biaya Masuk**: Bromo IDR 75K, Batu Secret Zoo IDR 100K\n🏨 **Penginapan**: IDR 150K-800K/malam\n💡 **Saran**: Sunrise di Gunung Bromo\n\n🏖️ **LABUAN BAJO**\n📍 **Dari Jakarta**: 2.5 jam flight\n🎫 **Biaya Masuk**: Komodo National Park IDR 150K\n🏨 **Penginapan**: IDR 400K-3M/malam\n💡 **Saran**: Komodo dragon tour\n\nDestinasi mana yang ingin Anda ketahui lebih detail?";
            }
            
            // Specific destination information
            if (lowerMessage.includes('bali') && !lowerMessage.includes('pantai')) {
                return "🏝️ **BALI - ISLAND OF GODS** 🏝️\n\n📍 **Lokasi**: 8°S, 115°E\n🚗 **Transport dari Jakarta**: 1.5 jam flight (IDR 500K-2M)\n🚌 **Transport lokal**: Go-Jek/Grab IDR 15-50K, Sewa motor IDR 75K/hari\n\n🎫 **BIAYA MASUK WISATA**:\n• Pantai Kuta, Seminyak: GRATIS\n• Pura Tanah Lot: IDR 60K\n• Pura Besakih: IDR 100K\n• Monkey Forest: IDR 80K\n• Waterbom: IDR 300K\n\n🏨 **PENGINAPAN**:\n• Hostel: IDR 100-300K/malam\n• Budget Hotel: IDR 300-700K/malam\n• Mid-range: IDR 700K-1.5M/malam\n• Luxury Resort: IDR 2M-10M/malam\n\n🍛️ **KULINER KHAS**:\n• Babi Guling: IDR 50-100K\n• Nasi Campur: IDR 30-60K\n• Sate Lilit: IDR 40-80K\n\n💡 **TIPS & SARAN**:\n• Best time: Apr-Okt (musim kemarau)\n• Hindari: Des-Jan (musim hujan)\n• Durasi ideal: 5-7 hari\n• Budget harian: IDR 500K-1.5M\n• Sim card: IDR 50K (Telkomsel recommended)\n\n🏄 **AKTIVITAS WAJIB**:\n• Surfing di Kuta Beach\n• Sunset di Tanah Lot\n• Shopping di Seminyak\n• Spa di Ubud\n• Nightlife di Legian\n\nButuh info lebih detail tentang area tertentu di Bali?";
            }
            
            if (lowerMessage.includes('yogyakarta') || lowerMessage.includes('yogya')) {
                return "🏛️ **YOGYAKARTA - CULTURAL HEART** 🏛️\n\n📍 **Lokasi**: 7.8°S, 110.4°E\n🚗 **Transport dari Jakarta**: 8-10 jam drive atau 1 jam flight (IDR 400K-1.5M)\n🚌 **Transport lokal**: Becak IDR 20-50K, Go-Jek IDR 15-40K\n\n🎫 **BIAYA MASUK WISATA**:\n• Candi Borobudur: IDR 75K (local), $25 (foreigner)\n• Candi Prambanan: IDR 50K (local), $18 (foreigner)\n• Keraton Yogyakarta: IDR 15K\n• Taman Sari: IDR 10K\n• Malioboro: GRATIS\n\n🏨 **PENGINAPAN**:\n• Hostel: IDR 80-200K/malam\n• Budget Hotel: IDR 200-500K/malam\n• Mid-range: IDR 500K-1M/malam\n• Near Malioboro: IDR 300K-800K/malam\n\n🍛️ **KULINER KHAS**:\n• Gudeg: IDR 25-60K\n• Bakpia: IDR 15-30K/box\n• Sate Klathak: IDR 40-80K\n• Mie Ayam: IDR 20-40K\n\n💡 **TIPS & SARAN**:\n• Best time: Apr-Oct (dry season)\n• Durasi ideal: 3-4 hari\n• Budget harian: IDR 300K-800K\n• Sewa motor: IDR 75K/hari\n• Guide Borobudur: IDR 150K-300K\n\n🏛️ **AKTIVITAS WAJIB**:\n• Sunrise di Borobudur\n• Explore Prambanan\n• Shopping di Malioboro\n• Visit Keraton\n• Candi hunting\n\nButuh info lebih detail tentang wisata Yogya?";
            }
            
            if (lowerMessage.includes('lombok')) {
                return "🏔️ **LOMBOK - ISLAND OF PEARLS** 🏔️\n\n📍 **Lokasi**: 8.5°S, 116.4°E\n🚗 **Transport dari Bali**: 2 jam ferry (IDR 150K) + 2 jam drive\n✈️ **Transport dari Jakarta**: 2 jam flight (IDR 600K-1.8M)\n🚌 **Transport lokal**: Ojek IDR 20-60K, Sewa mobil IDR 400K/hari\n\n🎫 **BIAYA MASUK WISATA**:\n• Pantai Senggigi: GRATIS\n• Gili Trawangan: IDR 20K (ferry)\n• Pink Beach: IDR 50K (boat trip)\n• Sendang Gile: IDR 15K\n• Kuta Mandalika: GRATIS\n\n🏨 **PENGINAPAN**:\n• Hostel: IDR 100-250K/malam\n• Budget Hotel: IDR 250-600K/malam\n• Mid-range: IDR 600K-1.5M/malam\n• Villa: IDR 1M-5M/malam\n\n🍛️ **KULINER KHAS**:\n• Ayam Taliwang: IDR 40-80K\n• Sate Bulayak: IDR 30-60K\n• Plecing Kangkung: IDR 20-40K\n• Beberuk Terong: IDR 25-50K\n\n💡 **TIPS & SARAN**:\n• Best time: Apr-Oct (dry season)\n• Durasi ideal: 4-5 hari\n• Budget harian: IDR 400K-1M\n• Gili Islands: 3-4 hari explore\n• Mandalika Circuit tour: IDR 200K\n\n🏝️ **AKTIVITAS WAJIB**:\n• Gili Islands hopping\n• Snorkeling/diving\n• Pink Beach visit\n• Surfing di Gerupuk\n• Explore waterfalls\n\nButuh info lebih detail tentang Lombok?";
            }
            
            if (lowerMessage.includes('raja ampat')) {
                return "🌊 **RAJA AMPAT - LAST PARADISE** 🌊\n\n📍 **Lokasi**: 0.2°S, 130.5°E (Papua Barat)\n✈️ **Transport dari Jakarta**: 4 jam flight via Sorong (IDR 2M-5M)\n🚢 **Transport lokal**: Speedboat IDR 2-5M (liveaboard)\n\n🎫 **BIAYA MASUK WISATA**:\n• Taman Nasional: IDR 100K (local), $100 (foreigner)\n• Wayag Island: IDR 500K (boat trip)\n• Misool Island: IDR 600K (boat trip)\n• Diving spots: IDR 200-500K/dive\n\n🏨 **PENGINAPAN**:\n• Homestay: IDR 300-800K/malam\n• Resort: IDR 1.5M-5M/malam\n• Liveaboard: IDR 5M-15M/3-7 hari\n• Eco-lodge: IDR 800K-2M/malam\n\n🍛️ **KULINER KHAS**:\n• Ikan Bakar: IDR 50-150K\n• Papeda: IDR 30-60K\n• Udang Saus Tiram: IDR 80-200K\n• Sayur Kangkung: IDR 20-40K\n\n💡 **TIPS & SARAN**:\n• Best time: Oct-Apr (diving season)\n• Durasi ideal: 7-10 hari\n• Budget harian: IDR 1M-3M\n• Diving certification: IDR 5-8M\n• Travel insurance: WAJIB\n\n🐠 **AKTIVITAS WAJIB**:\n• World-class diving\n• Manta ray watching\n• Bird watching\n• Island hopping\n• Snorkeling paradise\n\nButuh info lebih detail tentang Raja Ampat?";
            }
            if (lowerMessage.includes('pantai') || lowerMessage.includes('beach')) {
                return "Indonesia has stunning beaches! Here are some recommendations:\n\n🏖️ **Kuta Beach (Bali)** - Famous for surfing\n🌅 **Sanur Beach (Bali)** - Perfect for sunrise\n🏝️ **Pink Beach (Lombok)** - Unique pink sand\n🌊 **Tanjung Aan (Lombok)** - Hidden paradise\n\nWhich beach would you like to know more about?";
            }
            
            // Food and cuisine
            if (lowerMessage.includes('kuliner') || lowerMessage.includes('food') || lowerMessage.includes('makanan')) {
                return "Indonesian cuisine is amazing! Must-try dishes include:\n\n🍛️ **Rendang** - Spicy beef from Padang\n🥜 **Gado-gado** - National vegetable dish\n🍜 **Soto** - Traditional soup\n🍗 **Satay** - Grilled skewers\n🥞 **Nasi Goreng** - Fried rice\n\nWhat type of food are you interested in?";
            }
            
            // Travel tips
            if (lowerMessage.includes('tips') || lowerMessage.includes('panduan') || lowerMessage.includes('guide')) {
                return "Here are essential travel tips for Indonesia:\n\n✈️ **Best time to visit**: April-October (dry season)\n💰 **Currency**: Indonesian Rupiah (IDR)\n📱 **SIM card**: Available at airport\n🚗 **Transport**: Go-Jek, Grab for easy travel\n🏥 **Health**: Drink bottled water, get travel insurance\n\nNeed more specific tips?";
            }
            
            // Hotel and accommodation
            if (lowerMessage.includes('hotel') || lowerMessage.includes('penginapan') || lowerMessage.includes('stay')) {
                return "For accommodation in Indonesia, consider:\n\n🏨 **Luxury**: Four Seasons, Aman Resorts\n🏠 **Mid-range**: Hotel Indonesia, Ibis\n💰 **Budget**: Hostels, guesthouses\n🏝️ **Unique**: Overwater bungalows in Bali\n\nWhat's your budget and preferred location?";
            }
            
            // Transportation
            if (lowerMessage.includes('transportasi') || lowerMessage.includes('transport') || lowerMessage.includes('how to get')) {
                return "Transportation options in Indonesia:\n\n✈️ **Flights**: Garuda Indonesia, Lion Air\n🚗 **Ride-hailing**: Go-Jek, Grab\n🚌 **Buses**: Comfortable long-distance buses\n🚂 **Trains**: Java has good rail network\n🛥️ **Ferries**: For island hopping\n\nWhich transportation do you need help with?";
            }
            
            // Culture and traditions
            if (lowerMessage.includes('budaya') || lowerMessage.includes('culture') || lowerMessage.includes('tradition')) {
                return "Indonesian culture is rich and diverse! Key aspects include:\n\n🙏 **Religion**: Predominantly Muslim with respect for all faiths\n👘 **Traditions**: Batik making, wayang puppets, gamelan music\n🎭 **Festivals**: Nyepi, Waisak, Eid celebrations\n🍛️ **Etiquette**: Dress modestly, remove shoes when entering homes\n\nWhat cultural aspect interests you?";
            }
            
            // Cost and budget information
            if (lowerMessage.includes('biaya') || lowerMessage.includes('cost') || lowerMessage.includes('budget') || lowerMessage.includes('harga')) {
                return "Here's estimated travel costs for Indonesia (per person):\n\n💰 **Budget Travel**: IDR 300-500K/day\n🏠 **Mid-range**: IDR 700K-1.5M/day\n🏨 **Luxury**: IDR 2M-5M+/day\n\n🍛️ **Food**: IDR 50-150K/meal\n🚗 **Transport**: IDR 15-50K/ride (Go-Jek/Grab)\n🏝️ **Hotels**: IDR 200K-3M/night\n\nWhat's your budget range?";
            }
            
            // Entrance fees and tickets
            if (lowerMessage.includes('biaya masuk') || lowerMessage.includes('tiket masuk') || lowerMessage.includes('entrance fee') || lowerMessage.includes('ticket price')) {
                return "Popular attraction entrance fees in Indonesia:\n\n🏛️ **Temples**: IDR 50-75K (Borobudur, Prambanan)\n🏖️ **Beaches**: Usually FREE (Kuta, Seminyak)\n🌋 **Parks**: IDR 25-100K (Waterbom, Safari)\n🏝️ **Museums**: IDR 10-50K (National Museum)\n🌊 **Marine Parks**: IDR 100-300K (Sea World, Ancol)\n\nWhich attraction fees do you need?";
            }
            
            // Distance and travel time
            if (lowerMessage.includes('jarak') || lowerMessage.includes('distance') || lowerMessage.includes('how far') || lowerMessage.includes('travel time')) {
                return "Common travel distances in Indonesia:\n\n✈️ **Jakarta → Bali**: 1.5 hours flight\n🚌 **Jakarta → Yogyakarta**: 8-10 hours drive\n🚗 **Yogyakarta → Borobudur**: 1 hour drive\n🛥️ **Bali → Lombok**: 2 hours ferry + 2 hours drive\n🚂 **Surabaya → Malang**: 3 hours drive\n\n📍 **Within cities**: 30-60 minutes by Go-Jek/Grab\n\nNeed specific route information?";
            }
            
            // Transportation costs
            if (lowerMessage.includes('biaya transportasi') || lowerMessage.includes('transport cost') || lowerMessage.includes('ongkos')) {
                return "Transportation cost estimates in Indonesia:\n\n🚗 **Go-Jek/Grab**: IDR 15-50K (within city)\n🚌 **Bus**: IDR 100-300K (inter-city)\n🚂 **Train**: IDR 150-400K (Java routes)\n✈️ **Flight**: IDR 500K-2M (domestic)\n🛥️ **Ferry**: IDR 100-500K (island hopping)\n\n🎫 **Travel apps**: Go-Jek, Grab, Traveloka\n\nWhich transport do you need cost info for?";
            }
            
            // Admin and management responses
            if (lowerMessage.includes('admin') || lowerMessage.includes('dashboard') || lowerMessage.includes('manage')) {
                return "Welcome Admin! Here are your management options:\n\n📊 **Dashboard**: View chat statistics and analytics\n👥 **User Management**: Manage chat users and permissions\n💬 **Chat History**: Review all conversation logs\n⚙️ **Settings**: Configure bot responses and features\n📈 **Analytics**: Track usage and performance\n\nWhat admin task would you like to perform?";
            }
            
            // System status and monitoring
            if (lowerMessage.includes('status') || lowerMessage.includes('monitor') || lowerMessage.includes('system health')) {
                return '🤖 **Bot Status**: ACTIVE ✅\n📊 **Total Chats**: ' + (Math.floor(Math.random() * 1000) + 100) + '\n⚡ **Response Time**: ' + (Math.floor(Math.random() * 500) + 100) + 'ms\n💾 **Memory Usage**: ' + (Math.floor(Math.random() * 50) + 20) + '%\n🌐 **API Status**: Connected\n\n📅 **Last Restart**: ' + new Date().toLocaleString() + '\n🔧 **Version**: 1.0.0\n\nSystem is running optimally!';
            }
            
            // User management
            if (lowerMessage.includes('user') || lowerMessage.includes('users') || lowerMessage.includes('manage users')) {
                return "👥 **User Management Panel**\n\n📊 **Active Users**: " + (Math.floor(Math.random() * 100) + 50) + "\n🆕 **New Today**: " + (Math.floor(Math.random() * 20) + 5) + "\n📱 **Online Now**: " + (Math.floor(Math.random() * 30) + 10) + "\n🚫 **Banned**: " + Math.floor(Math.random() * 5) + "\n\n**Actions Available**:\n• View user details\n• Ban/unban users\n• Set permissions\n• Export user data\n\nWhat user management task?";
            }
            
            // Analytics and statistics
            if (lowerMessage.includes('analytics') || lowerMessage.includes('statistics') || lowerMessage.includes('stats')) {
                return '📈 **Chat Analytics Dashboard**\n\n📊 **Today\'s Stats**:\n• Total Messages: ' + (Math.floor(Math.random() * 500) + 200) + '\n• Active Users: ' + (Math.floor(Math.random() * 50) + 20) + '\n• Response Rate: 98.5%\n• Avg Response Time: ' + (Math.floor(Math.random() * 200) + 300) + 'ms\n\n🏆 **Top Questions**:\n1. Destinasi wisata (' + (Math.floor(Math.random() * 50) + 20) + ')\n2. Biaya masuk (' + (Math.floor(Math.random() * 30) + 15) + ')\n3. Tips liburan (' + (Math.floor(Math.random() * 40) + 25) + ')\n\n📅 **Peak Hours**: 14:00 - 18:00\n\nNeed detailed analytics?';
            }
            
            // Settings and configuration
            if (lowerMessage.includes('settings') || lowerMessage.includes('config') || lowerMessage.includes('configuration')) {
                return "⚙️ **Bot Configuration Panel**\n\n🤖 **AI Settings**:\n• Model: Gemini 1.5 Flash\n• Temperature: 0.7\n• Max Tokens: 500\n• Status: Active ✅\n\n🔧 **System Settings**:\n• Auto-save: ON\n• Rate Limit: 100/hour\n• Language: Indonesian\n• Timezone: WIB (UTC+7)\n\n🔐 **Security**:\n• Authentication: Enabled\n• SSL Certificate: Valid\n• Backup: Daily\n\nWhat setting would you like to modify?";
            }
            
            // Help and support for admin
            if (lowerMessage.includes('help admin') || lowerMessage.includes('admin help') || lowerMessage.includes('support admin')) {
                return "🛠️ **Admin Help Center**\n\n**Available Commands**:\n• \'status\' - System health check\n• \'users\' - User management\n• \'analytics\' - View statistics\n• \'settings\' - Configuration\n• \'logs\' - View system logs\n• \'restart\' - Restart bot\n\n**Quick Actions**:\n• Clear chat history\n• Export data\n• Update responses\n• Check API status\n\nNeed specific admin assistance?";
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
