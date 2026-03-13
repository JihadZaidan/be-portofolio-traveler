const dotenv = require('dotenv');
dotenv.config();

class EnhancedAIChatbotService {
    constructor() {
        this.geminiApiKey = process.env.GEMINI_API_KEY;
        this.geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        this.temperature = parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7;
        this.maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS) || 500;
        
        // Knowledge base untuk TRAVELLO
        this.knowledgeBase = {
            copywriter: {
                keywords: ['copywriter', 'copywriting', 'jasa copywriter', 'harga copywriter', 'layanan copywriter', 'content writer', 'artikel', 'blog', 'seo content', 'content writing', 'branding', 'marketing content', 'tulisan', 'nulis', 'penulisan', 'konten', 'blog post', 'website content', 'social media', 'iklan', 'deskripsi', 'company profile', 'proposal', 'edit', 'revisi', 'seo', 'keyword', 'branding', 'digital marketing', 'content strategy', 'harga', 'biaya', 'tarif', 'paket'],
                services: {
                    'content writing': {
                        name: 'Content Writing',
                        price: 'Rp 50.000 - Rp 150.000 per artikel',
                        description: 'Artikel blog, website content, artikel SEO friendly'
                    },
                    'seo content': {
                        name: 'SEO Content',
                        price: 'Rp 75.000 - Rp 200.000 per artikel',
                        description: 'Konten optimasi SEO, keyword research, meta descriptions'
                    },
                    'business content': {
                        name: 'Business Content',
                        price: 'Rp 100.000 - Rp 300.000 per dokumen',
                        description: 'Company profile, proposal bisnis, presentasi'
                    },
                    'digital marketing': {
                        name: 'Digital Marketing Content',
                        price: 'Rp 60.000 - Rp 180.000 per campaign',
                        description: 'Social media content, ads copy, email marketing'
                    },
                    'content strategy': {
                        name: 'Content Strategy',
                        price: 'Rp 500.000 - Rp 2.000.000 per project',
                        description: 'Perencanaan konten, editorial calendar, content audit'
                    }
                },
                responses: {
                    pricing: '💰 **Harga Layanan Copywriter TRAVELLO:**\n\n• Content Writing: Rp 50.000 - Rp 150.000/artikel\n• SEO Content: Rp 75.000 - Rp 200.000/artikel\n• Business Content: Rp 100.000 - Rp 300.000/dokumen\n• Digital Marketing: Rp 60.000 - Rp 180.000/campaign\n• Content Strategy: Rp 500.000 - Rp 2.000.000/project\n\nSemua layanan include research, editing, dan revisi!',
                    services: '📝 **Layanan Copywriter TRAVELLO:**\n\n• Content Writing (Artikel, Blog, Web Content)\n• SEO Content (Optimasi Search Engine)\n• Business Content (Company Profile, Proposal)\n• Digital Marketing (Social Media, Ads)\n• Content Strategy (Perencanaan Konten)\n\nSemua layanan sudah termasuk research, editing, dan revisi gratis!',
                    process: '🔄 **Proses Pengerjaan:**\n\n1. Konsultasi kebutuhan (Free)\n2. Research dan brief\n3. Draft pertama (2-3 hari)\n4. Revisi (maks 3x)\n5. Final delivery\n\n📞 Hubungi kami untuk konsultasi gratis!',
                    portfolio: '🏆 **Portfolio Copywriter:**\n\nKerjasama dengan 500+ client dari berbagai industri:\n• Travel & Tourism\n• E-commerce\n• Startup\n• Corporate\n• Personal Brand\n\nDapatkan hasil terbaik untuk bisnis Anda!'
                }
            },
            travel: {
                keywords: ['travel', 'wisata', 'destinasi', 'liburan', 'trip', 'tour', 'hotel', 'akomodasi', 'transportasi', 'kuliner', 'budget travel', 'paket wisata', 'tempat wisata', 'pantai', 'gunung', 'pulau', 'kota', 'museum', 'taman', 'alam', 'budaya', 'sejarah', 'belanja', 'oleh-oleh', 'foto', 'spot', 'instagrammable', 'viral', 'hits', 'populer', 'terkenal', 'indah', 'menarik', 'rekomen', 'bagus', 'keren', 'murah', 'hemat', 'luxury', 'mewah', 'keluarga', 'anak', 'pasangan', 'romantis', 'petualangan', 'adventure', 'diving', 'snorkeling', 'hiking', 'camping', 'backpacker', 'backpacking', 'solo traveling', 'group tour', 'family trip', 'honeymoon', 'bulanan', 'tahunan', 'musiman', 'festival', 'event', 'acara', 'tradisi', 'upacara', 'ceremonial', 'local', 'tradisional', 'modern', 'kontemporer'],
                destinations: {
                    'bali': {
                        name: 'Bali',
                        highlights: ['Pantai Kuta', 'Ubud', 'Tanah Lot', 'Seminyak', 'Nusa Dua'],
                        budget: 'Rp 2.000.000 - Rp 5.000.000 (3 hari)',
                        description: 'Pulau Dewata dengan budaya dan pantai menakjubkan'
                    },
                    'yogyakarta': {
                        name: 'Yogyakarta',
                        highlights: ['Candi Borobudur', 'Prambanan', 'Malioboro', 'Keraton'],
                        budget: 'Rp 1.500.000 - Rp 3.500.000 (3 hari)',
                        description: 'Kota budaya dengan sejarah dan kuliner lezat'
                    },
                    'raja ampat': {
                        name: 'Raja Ampat',
                        highlights: ['Diving spots', 'Pianemo', 'Wayag', 'Misool'],
                        budget: 'Rp 8.000.000 - Rp 15.000.000 (5 hari)',
                        description: 'Surga diving dengan keanekaragaman laut luar biasa'
                    },
                    'labuan bajo': {
                        name: 'Labuan Bajo',
                        highlights: ['Komodo Island', 'Pink Beach', 'Kelor Island'],
                        budget: 'Rp 5.000.000 - Rp 10.000.000 (4 hari)',
                        description: 'Gerbang ke Komodo dan destinasi premium'
                    },
                    'lombok': {
                        name: 'Lombok',
                        highlights: ['Gili Trawangan', 'Senggigi', 'Mount Rinjani'],
                        budget: 'Rp 2.500.000 - Rp 6.000.000 (4 hari)',
                        description: 'Pulau seribu masjid dengan pantai eksotis'
                    }
                },
                responses: {
                    destinations: '🌴 **Top 5 Destinasi Wisata Indonesia:**\n\n1. **Bali** - Pantai Kuta, Ubud, Tanah Lot (Budget: Rp 2-5jt)\n2. **Yogyakarta** - Borobudur, Prambanan, Malioboro (Budget: Rp 1.5-3.5jt)\n3. **Raja Ampat** - Diving, Pianemo, Wayag (Budget: Rp 8-15jt)\n4. **Labuan Bajo** - Komodo, Pink Beach (Budget: Rp 5-10jt)\n5. **Lombok** - Gili Islands, Rinjani (Budget: Rp 2.5-6jt)\n\n📞 Kami siap membantu perjalanan impian Anda!',
                    budget: '💵 **Tips Budget Travel:**\n\n• Transportasi: Pilih travel budget atau kereta ekonomi\n• Akomodasi: Guesthouse atau hostel (Rp 100-300k/malam)\n• Makan: Street food atau warung lokal (Rp 20-50k/saji)\n• Destinasi: Banyak destinasi gratis seperti pantai, taman\n\n💡 Budget minimal untuk 3 hari: Rp 1.500.000 - Rp 3.000.000',
                    accommodation: '🏨 **Rekomendasi Akomodasi:**\n\n• Budget: Guesthouse/Hostel (Rp 100-300k)\n• Mid-range: Hotel 3 bintang (Rp 300-700k)\n• Luxury: Resort 4-5 bintang (Rp 700k-2jt)\n\n📍 Lokasi strategis dekat destinasi utama!',
                    food: '🍜 **Kuliner Khas Indonesia:**\n\n• Bali: Nasi campur, babi guling, sate lilit\n• Yogyakarta: Gudeg, bakpia, klatak\n• Lombok: Ayam taliwang, sate rembiga\n• Raja Ampat: Ikan bakar, papeda\n\n💰 Harga makan: Rp 15.000 - Rp 50.000 per porsi'
                }
            },
            general: {
                keywords: ['travello', 'tentang', 'about', 'kontak', 'contact', 'jam buka', 'operasional', 'alamat', 'location', 'pemesanan', 'pesan', 'booking', 'order', 'beli', 'pembelian', 'transaksi', 'bayar', 'payment', 'shop', 'toko', 'store', 'catalog', 'produk', 'package', 'paket'],
                responses: {
                    about: '🏢 **Tentang TRAVELLO:**\n\nPlatform travel & content terintegrasi dengan:\n• 10+ tahun pengalaman\n• 500+ satisfied clients\n• 24/7 customer support\n• Tim profesional dan berpengalaman\n\nKami siap membantu perjalanan dan kebutuhan content Anda!',
                    contact: '📞 **Hubungi TRAVELLO:**\n\n• Phone: +62 812-3456-7890\n• Email: info@travello.id\n• Website: www.travello.id\n• Jam Operasional: Senin-Sabtu, 09:00-18:00\n\n💬 Chat kami sekarang untuk konsultasi gratis!',
                    location: '📍 **Lokasi TRAVELLO:**\n\nJl. Sudirman No. 123, Jakarta Pusat\nDKI Jakarta 10110, Indonesia\n\n🕐 Jam Operasional: Senin-Sabtu, 09:00-18:00\n\n📞 Telepon: +62 812-3456-7890',
                    ordering: '🛒 **Untuk Pemesanan:**\n\nAnda bisa langsung mengunjungi **Shop Page** kami untuk melihat dan memesan semua layanan:\n\n🌐 **www.travello.id/shop**\n\nDi Shop Page tersedia:\n• Paket Wisata Lengkap\n• Layanan Copywriter\n• Tour Guide\n• Akomodasi\n• Transportasi\n\n✨ **Mudah & Aman!** Proses pemesanan cepat dan pembayaran terjamin.\n\n📞 Butuh bantuan? Hubungi kami di +62 812-3456-7890'
                }
            }
        };
    }

    // Detect intent dari pesan user
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        let maxScore = 0;
        let detectedCategory = null;
        let detectedSubcategory = null;

        // Scoring untuk setiap category
        for (const [category, data] of Object.entries(this.knowledgeBase)) {
            let categoryScore = 0;
            
            // Hitung score berdasarkan keywords
            for (const keyword of data.keywords) {
                if (lowerMessage.includes(keyword)) {
                    categoryScore += 1;
                }
            }

            // Check untuk subcategory spesifik
            if (category === 'copywriter' && data.services) {
                for (const [serviceKey, service] of Object.entries(data.services)) {
                    if (lowerMessage.includes(serviceKey) || lowerMessage.includes(service.name.toLowerCase())) {
                        detectedSubcategory = serviceKey;
                        categoryScore += 2; // Extra weight untuk exact match
                    }
                }
            }

            if (category === 'travel' && data.destinations) {
                for (const [destKey, dest] of Object.entries(data.destinations)) {
                    if (lowerMessage.includes(destKey) || lowerMessage.includes(dest.name.toLowerCase())) {
                        detectedSubcategory = destKey;
                        categoryScore += 2;
                    }
                }
            }

            if (categoryScore > maxScore) {
                maxScore = categoryScore;
                detectedCategory = category;
            }
        }

        return {
            category: detectedCategory,
            subcategory: detectedSubcategory,
            confidence: maxScore > 0 ? Math.min(maxScore / 3, 1) : 0
        };
    }

    // Generate response berdasarkan intent
    async generateResponse(message, userName = 'User') {
        try {
            const intent = this.detectIntent(message);
            
            console.log(`Intent detected: ${intent.category} (${intent.confidence})`);
            
            // Enhanced filtering: confidence harus > 0.3 dan category harus valid
            if (intent.confidence < 0.3 || !intent.category || !this.knowledgeBase[intent.category]) {
                return this.generateOutOfTopicResponse();
            }

            // Generate response berdasarkan category
            switch (intent.category) {
                case 'copywriter':
                    return this.generateCopywriterResponse(message, intent.subcategory, userName);
                case 'travel':
                    return this.generateTravelResponse(message, intent.subcategory, userName);
                case 'general':
                    return this.generateGeneralResponse(message, intent.subcategory, userName);
                default:
                    return this.generateOutOfTopicResponse();
            }

        } catch (error) {
            console.error('Error generating response:', error);
            return this.generateErrorResponse();
        }
    }

    generateCopywriterResponse(message, subcategory, userName) {
        const lowerMessage = message.toLowerCase();
        const copywriterData = this.knowledgeBase.copywriter;

        // Check untuk pertanyaan harga
        if (lowerMessage.includes('harga') || lowerMessage.includes('price') || lowerMessage.includes('biaya') || lowerMessage.includes('tarif') || lowerMessage.includes('paket')) {
            return copywriterData.responses.pricing;
        }

        // Check untuk pertanyaan layanan
        if (lowerMessage.includes('layanan') || lowerMessage.includes('service') || lowerMessage.includes('jasa') || lowerMessage.includes('apa saja') || lowerMessage.includes('macam-macam')) {
            return copywriterData.responses.services;
        }

        // Check untuk pertanyaan proses
        if (lowerMessage.includes('proses') || lowerMessage.includes('process') || lowerMessage.includes('cara') || lowerMessage.includes('bagaimana') || lowerMessage.includes('langkah')) {
            return copywriterData.responses.process;
        }

        // Check untuk pertanyaan portfolio
        if (lowerMessage.includes('portfolio') || lowerMessage.includes('karya') || lowerMessage.includes('pengalaman') || lowerMessage.includes('client') || lowerMessage.includes('pernah')) {
            return copywriterData.responses.portfolio;
        }

        // Response untuk subcategory spesifik
        if (subcategory && copywriterData.services[subcategory]) {
            const service = copywriterData.services[subcategory];
            return `💼 **${service.name}**\n\n${service.description}\n\n💰 Harga: ${service.price}\n\n✅ Include: Research, editing, dan revisi gratis!\n\n📞 Hubungi kami untuk detail lebih lanjut!`;
        }

        // Check untuk pertanyaan spesifik tentang copywriting
        if (lowerMessage.includes('artikel') || lowerMessage.includes('blog') || lowerMessage.includes('tulisan') || lowerMessage.includes('nulis') || lowerMessage.includes('konten')) {
            return `📝 **Layanan Penulisan Artikel:**\n\nKami menyediakan jasa penulisan artikel berkualitas:\n• Blog post\n• Website content\n• Artikel SEO friendly\n• Social media content\n\n💰 Harga mulai dari Rp 50.000 per artikel\n\n✅ Include: Research, editing, dan revisi gratis!`;
        }

        if (lowerMessage.includes('seo') || lowerMessage.includes('keyword') || lowerMessage.includes('ranking') || lowerMessage.includes('google')) {
            return `🔍 **Layanan SEO Content:**\n\nKonten yang dioptimasi untuk search engine:\n• Keyword research\n• SEO friendly articles\n• Meta descriptions\n• Content optimization\n\n💰 Harga: Rp 75.000 - Rp 200.000 per artikel\n\n📈 Meningkatkan ranking website Anda!`;
        }

        // Default copywriter response
        return copywriterData.responses.services;
    }

    generateTravelResponse(message, subcategory, userName) {
        const lowerMessage = message.toLowerCase();
        const travelData = this.knowledgeBase.travel;

        // Check untuk pertanyaan destinasi
        if (lowerMessage.includes('destinasi') || lowerMessage.includes('tempat') || lowerMessage.includes('rekomen') || lowerMessage.includes('terbaik') || lowerMessage.includes('populer') || lowerMessage.includes('hits') || lowerMessage.includes('viral')) {
            return travelData.responses.destinations;
        }

        // Check untuk pertanyaan budget
        if (lowerMessage.includes('budget') || lowerMessage.includes('biaya') || lowerMessage.includes('hemat') || lowerMessage.includes('murah') || lowerMessage.includes('irit')) {
            return travelData.responses.budget;
        }

        // Check untuk pertanyaan akomodasi
        if (lowerMessage.includes('hotel') || lowerMessage.includes('penginapan') || lowerMessage.includes('akomodasi') || lowerMessage.includes('menginap') || lowerMessage.includes('stay')) {
            return travelData.responses.accommodation;
        }

        // Check untuk pertanyaan kuliner
        if (lowerMessage.includes('makan') || lowerMessage.includes('kuliner') || lowerMessage.includes('food') || lowerMessage.includes('masakan') || lowerMessage.includes('resto') || lowerMessage.includes('restaurant')) {
            return travelData.responses.food;
        }

        // Response untuk subcategory spesifik
        if (subcategory && travelData.destinations[subcategory]) {
            const dest = travelData.destinations[subcategory];
            return `🏝️ **${dest.name}**\n\n${dest.description}\n\n🌟 Highlights:\n${dest.highlights.map(h => `• ${h}`).join('\n')}\n\n💰 Budget: ${dest.budget}\n\n📞 Kami siap membantu perjalanan Anda ke ${dest.name}!`;
        }

        // Check untuk pertanyaan spesifik tentang travel
        if (lowerMessage.includes('pantai') || lowerMessage.includes('beach') || lowerMessage.includes('laut') || lowerMessage.includes('snorkeling') || lowerMessage.includes('diving')) {
            return `🏖️ **Destinasi Pantai Terbaik:**\n\n• **Bali** - Pantai Kuta, Seminyak, Nusa Dua\n• **Lombok** - Gili Islands, Pink Beach\n• **Raja Ampat** - Diving spots, snorkeling\n• **Labuan Bajo** - Pink Beach, diving\n\n💰 Budget: Rp 2.000.000 - Rp 15.000.000\n\n🤿 Perfect untuk diving dan snorkeling!`;
        }

        if (lowerMessage.includes('gunung') || lowerMessage.includes('mountain') || lowerMessage.includes('hiking') || lowerMessage.includes('pendakian') || lowerMessage.includes('camping')) {
            return `🏔️ **Destinasi Gunung & Adventure:**\n\n• **Lombok** - Mount Rinjani (pendakian)\n• **Bali** - Ubud (hiking trails)\n• **Java** - Berbagai gunung berapi\n\n💰 Budget: Rp 1.500.000 - Rp 5.000.000\n\n⛺ Perfect untuk adventure seekers!`;
        }

        if (lowerMessage.includes('budaya') || lowerMessage.includes('sejarah') || lowerMessage.includes('museum') || lowerMessage.includes('candi') || lowerMessage.includes('tradisional')) {
            return `🏛️ **Wisata Budaya & Sejarah:**\n\n• **Yogyakarta** - Borobudur, Prambanan, Keraton\n• **Bali** - Ubud, pura, tradisi\n• **Jakarta** - Museums, kota tua\n\n💰 Budget: Rp 1.000.000 - Rp 3.000.000\n\n📚 Rich in culture and history!`;
        }

        if (lowerMessage.includes('keluarga') || lowerMessage.includes('anak') || lowerMessage.includes('family') || lowerMessage.includes('kids')) {
            return `👨‍👩‍👧‍👦 **Wisata Keluarga:**\n\n• **Bali** - Waterbom, Bird Park\n• **Jakarta** - Ancol, Taman Mini\n• **Yogyakarta** - Gembira Loka Zoo\n\n💰 Budget family: Rp 2.000.000 - Rp 5.000.000\n\n🎈 Fun untuk seluruh keluarga!`;
        }

        // Default travel response
        return travelData.responses.destinations;
    }

    generateGeneralResponse(message, subcategory, userName) {
        const lowerMessage = message.toLowerCase();
        const generalData = this.knowledgeBase.general;

        // Check untuk pertanyaan pemesanan/pembelian
        if (lowerMessage.includes('pemesanan') || lowerMessage.includes('pesan') || lowerMessage.includes('booking') || lowerMessage.includes('order') || lowerMessage.includes('beli') || lowerMessage.includes('pembelian') || lowerMessage.includes('transaksi') || lowerMessage.includes('bayar') || lowerMessage.includes('payment') || lowerMessage.includes('shop') || lowerMessage.includes('toko') || lowerMessage.includes('store') || lowerMessage.includes('catalog') || lowerMessage.includes('produk') || lowerMessage.includes('package') || lowerMessage.includes('paket') || lowerMessage.includes('dimana') || lowerMessage.includes('cara pesan')) {
            return generalData.responses.ordering;
        }

        // Check untuk pertanyaan tentang
        if (lowerMessage.includes('tentang') || lowerMessage.includes('about')) {
            return generalData.responses.about;
        }

        // Check untuk pertanyaan kontak
        if (lowerMessage.includes('kontak') || lowerMessage.includes('contact') || lowerMessage.includes('hubungi')) {
            return generalData.responses.contact;
        }

        // Check untuk pertanyaan lokasi
        if (lowerMessage.includes('alamat') || lowerMessage.includes('lokasi') || lowerMessage.includes('location')) {
            return generalData.responses.location;
        }

        // Default general response
        return generalData.responses.about;
    }

    generateOutOfTopicResponse() {
        return 'Maaf Kami belum Melayani hal ini';
    }

    generateErrorResponse() {
        return '⚠️ **Maaf, terjadi kesalahan sistem.**\n\nSilakan coba lagi beberapa saat. Jika masalah berlanjut, hubungi support kami di:\n📞 +62 812-3456-7890\n📧 info@travello.id';
    }

    // Optional: Gemini API integration untuk enhancement
    async generateGeminiResponse(message) {
        if (!this.geminiApiKey) {
            console.log('Gemini API key not found, using fallback responses');
            return null;
        }

        try {
            // Implementasi Gemini API call di sini
            // Untuk sekarang menggunakan fallback responses
            return null;
        } catch (error) {
            console.error('Gemini API error:', error);
            return null;
        }
    }
}

module.exports = EnhancedAIChatbotService;
