const { v4: uuidv4 } = require('uuid');

class AIChatbotService {
  constructor() {
    this.knowledgeBase = new Map();
    this.initializeKnowledgeBase();
  }

  /**
   * Initialize comprehensive knowledge base for copywriter and travel services
   */
  initializeKnowledgeBase() {
    // Copywriter Services Knowledge Base
    this.knowledgeBase.set('copywriter', {
      keywords: ['copywriter', 'copywriting', 'tulisan', 'konten', 'artikel', 'blog', 'deskripsi', 'sales letter', 'ads', 'iklan'],
      responses: [
        {
          category: 'jasa',
          response: '📝 **Jasa Copywriter Professional**\n\n' +
                   'Kami menyediakan berbagai layanan copywriting:\n' +
                   '• **Artikel Blog** - SEO friendly, engaging, 1000-2000 kata\n' +
                   '• **Deskripsi Produk** - Persuasive, detail, conversion-focused\n' +
                   '• **Sales Letter** - High-converting, emotional triggers\n' +
                   '• **Social Media Content** - Viral-worthy, platform-specific\n' +
                   '• **Website Content** - Professional, user-friendly\n' +
                   '• **Email Marketing** - Open-rate optimization\n\n' +
                   '💰 **Harga Mulai:** Rp 50.000 - Rp 500.000 per project\n' +
                   '⏱️ **Pengerjaan:** 1-7 hari tergantung kompleksitas'
        },
        {
          category: 'harga',
          response: '💰 **Paket Harga Copywriter**\n\n' +
                   '🥉 **Paket Bronze** - Rp 50.000/artikel\n' +
                   '• 500-800 kata\n' +
                   '• Basic SEO\n' +
                   '• 1x revisi\n\n' +
                   '🥈 **Paket Silver** - Rp 100.000/artikel\n' +
                   '• 1000-1500 kata\n' +
                   '• Advanced SEO\n' +
                   '• 2x revisi\n' +
                   '• Research mendalam\n\n' +
                   '🥇 **Paket Gold** - Rp 200.000/artikel\n' +
                   '• 2000+ kata\n' +
                   '• Premium SEO\n' +
                   '• Unlimited revisi\n' +
                   '• Market analysis\n' +
                   '• Fast delivery (3 hari)'
        },
        {
          category: 'proses',
          response: '🔄 **Proses Kerja Copywriter**\n\n' +
                   '1. **Briefing Client** - Diskusi kebutuhan dan target\n' +
                   '2. **Research** - Market research dan competitor analysis\n' +
                   '3. **Drafting** - Pembuatan konten pertama\n' +
                   '4. **Review** - Internal quality check\n' +
                   '5. **Revisi** - Sesuai feedback client\n' +
                   '6. **Final Delivery** - File siap publish\n\n' +
                   '📋 **Dokumentasi:**\n' +
                   '• Brief form detail\n' +
                   '• Progress report\n' +
                   '• plagiarism check\n' +
                   '• SEO score report'
        }
      ]
    });

    // Travel Services Knowledge Base
    this.knowledgeBase.set('travel', {
      keywords: ['travel', 'wisata', 'liburan', 'trip', 'tour', 'destinasi', 'hotel', 'penginapan', 'transportasi', 'paket'],
      responses: [
        {
          category: 'destinasi',
          response: '🏝️ **Destinasi Wisata Populer**\n\n' +
                   '🌟 **Bali** - Island of Gods\n' +
                   '• Pantai Kuta, Seminyak, Nusa Dua\n' +
                   '• Ubud (culture & nature)\n' +
                   '• Tanah Lot, Uluwatu Temple\n' +
                   '• Budget: Rp 1-3 juta/3 hari\n\n' +
                   '🏛️ **Yogyakarta** - Cultural Heritage\n' +
                   '• Candi Borobudur & Prambanan\n' +
                   '• Malioboro shopping street\n' +
                   '• Keraton Yogyakarta\n' +
                   '• Budget: Rp 800ribu-2 juta/3 hari\n\n' +
                   '🐉 **Labuan Bajo** - Komodo Adventure\n' +
                   '• Komodo National Park\n' +
                   '• Pink Beach, Manta Point\n' +
                   '• Island hopping\n' +
                   '• Budget: Rp 3-5 juta/4 hari'
        },
        {
          category: 'paket',
          response: '🎒 **Paket Wisata Terbaik**\n\n' +
                   '🏖️ **Paket Bali Family**\n' +
                   '• 4H3M untuk 4 orang\n' +
                   '• Hotel + breakfast\n' +
                   '• Private transport\n' +
                   '• Tiket masuk 3 destinasi\n' +
                   '• Harga: Rp 6 juta\n\n' +
                   '🏛️ **Paket Jogja Heritage**\n' +
                   '• 3H2M untuk 2 orang\n' +
                   '• Hotel dekat Malioboro\n' +
                   '• Tour guide\n' +
                   '• All-inclusive tiket\n' +
                   '• Harga: Rp 3.5 juta\n\n' +
                   '🐉 **Paket Komodo Explorer**\n' +
                   '• 4H3M untuk 2 orang\n' +
                   '• Resort + full board\n' +
                   '• Private boat\n' +
                   '• Diving equipment\n' +
                   '• Harga: Rp 8 juta'
        },
        {
          category: 'tips',
          response: '💡 **Tips Traveling Hemat**\n\n' +
                   '🎯 **Planning:**\n' +
                   '• Booking tiket 1-2 bulan sebelumnya\n' +
                   '• Pilih weekday daripada weekend\n' +
                   '• Bandingkan harga di multiple platform\n\n' +
                   '🏨 **Akomodasi:**\n' +
                   '• Guesthouse/hotel bintang 2-3\n' +
                   '• Cari promo di Agoda/Traveloka\n' +
                   '• Pertimbangkan Airbnb untuk long stay\n\n' +
                   '🍜 **Makanan:**\n' +
                   '• Coba street food lokal\n' +
                   '• Hindari restoran di area turis\n' +
                   '• Beli snack di minimarket\n\n' +
                   '🚗 **Transportasi:**\n' +
                   '• Gunakan transportasi umum\n' +
                   '• Sewa motor untuk explore\n' +
                   '• Gunakan Go-Jek/Grab untuk jarak dekat'
        }
      ]
    });

    // Combined Services Knowledge Base
    this.knowledgeBase.set('combined', {
      keywords: ['promo', 'bundle', 'paket lengkap', 'all-in-one', 'solution'],
      responses: [
        {
          category: 'bundle',
          response: '🎁 **Paket Bundle - Copywriter + Travel**\n\n' +
                   '📝 **Travel Content Package**\n' +
                   '• 10 artikel travel blog\n' +
                   '• 50 social media captions\n' +
                   '• 5 video scripts\n' +
                   '• SEO optimization\n' +
                   '• Harga: Rp 2.5 juta (hemat 20%)\n\n' +
                   '🏝️ **Travel Business Package**\n' +
                   '• Website content lengkap\n' +
                   '• Product descriptions\n' +
                   '• Email marketing templates\n' +
                   '• Brand storytelling\n' +
                   '• Harga: Rp 5 juta (hemat 25%)\n\n' +
                   '🎯 **Influencer Package**\n' +
                   '• Personal branding content\n' +
                   '• Travel vlog scripts\n' +
                   '• Social media management\n' +
                   '• Engagement strategies\n' +
                   '• Harga: Rp 7.5 juta (hemat 30%)'
        }
      ]
    });
  }

  /**
   * Detect intent from user message
   */
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [service, data] of this.knowledgeBase) {
      for (const keyword of data.keywords) {
        if (lowerMessage.includes(keyword)) {
          return { service, category: this.detectCategory(lowerMessage, data.responses) };
        }
      }
    }
    
    return null;
  }

  /**
   * Detect category within service
   */
  detectCategory(message, responses) {
    for (const response of responses) {
      for (const keyword of ['harga', 'price', 'biaya', 'cost']) {
        if (message.includes(keyword) && response.category === 'harga') {
          return 'harga';
        }
      }
      for (const keyword of ['proses', 'cara', 'how', 'process']) {
        if (message.includes(keyword) && response.category === 'proses') {
          return 'proses';
        }
      }
      for (const keyword of ['destinasi', 'tempat', 'location']) {
        if (message.includes(keyword) && response.category === 'destinasi') {
          return 'destinasi';
        }
      }
      for (const keyword of ['paket', 'package', 'promo']) {
        if (message.includes(keyword) && response.category === 'paket') {
          return 'paket';
        }
      }
      for (const keyword of ['tips', 'trick', 'guide']) {
        if (message.includes(keyword) && response.category === 'tips') {
          return 'tips';
        }
      }
      for (const keyword of ['bundle', 'lengkap', 'all']) {
        if (message.includes(keyword) && response.category === 'bundle') {
          return 'bundle';
        }
      }
    }
    return 'jasa'; // default category
  }

  /**
   * Generate contextual response
   */
  generateResponse(message, history = []) {
    const intent = this.detectIntent(message);
    
    if (!intent) {
      return this.generateDefaultResponse();
    }

    const serviceData = this.knowledgeBase.get(intent.service);
    const response = serviceData.responses.find(r => r.category === intent.category) || serviceData.responses[0];
    
    let finalResponse = response.response;
    
    // Add contextual suggestions
    finalResponse += '\n\n' + this.generateSuggestions(intent.service, intent.category);
    
    // Add call to action
    finalResponse += '\n\n💬 *Butuh info lebih detail? Tanya saja spesifik kebutuhan Anda!*';
    
    return finalResponse;
  }

  /**
   * Generate contextual suggestions
   */
  generateSuggestions(service, category) {
    const suggestions = [];
    
    if (service === 'copywriter') {
      suggestions.push('Harga copywriter', 'Proses pengerjaan', 'Contoh portfolio', 'SEO writing');
    } else if (service === 'travel') {
      suggestions.push('Destinasi populer', 'P hemat traveling', 'Paket wisata', 'Hotel rekomendasi');
    } else if (service === 'combined') {
      suggestions.push('Travel content package', 'Business solution', 'Personal branding', 'Custom package');
    }
    
    return '🎯 **Pertanyaan Populer:**\n' + suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n');
  }

  /**
   * Generate default response
   */
  generateDefaultResponse() {
    const hour = new Date().getHours();
    let greeting = 'Halo!';
    
    if (hour < 12) greeting = 'Selamat pagi! ☀️';
    else if (hour < 15) greeting = 'Selamat siang! 🌤️';
    else if (hour < 18) greeting = 'Selamat sore! 🌅';
    else greeting = 'Selamat malam! 🌙';

    return `${greeting} Saya adalah AI Assistant TRAVELLO, ahli dalam **jasa copywriter** dan **travel consultation**.\n\n` +
           `🎯 **Layanan Kami:**\n` +
           `📝 **Copywriter Services:**\n` +
           `• Artikel blog & website content\n` +
           `• Social media copywriting\n` +
           `• Sales letter & marketing content\n` +
           `• SEO writing & product descriptions\n\n` +
           `🏝️ **Travel Services:**\n` +
           `• Konsultasi destinasi wisata\n` +
           `• Paket tour & akomodasi\n` +
           `• Tips traveling hemat\n` +
           `• Itinerary planning\n\n` +
           `🎁 **Special Bundle:**\n` +
           `• Travel content packages\n` +
           `• Business solutions\n` +
           `• Personal branding\n\n` +
           `💡 **Cara bertanya:**\n` +
           `• "Harga copywriter artikel"\n` +
           `• "Rekomendasi destinasi Bali"\n` +
           `• "Paket travel content"\n` +
           `• "Tips hemat liburan"\n\n` +
           `Apa yang bisa saya bantu hari ini? 😊`;
  }

  /**
   * Generate contextual suggestions based on conversation history
   */
  generateContextualSuggestions(history = []) {
    const recentMessages = history.slice(-3);
    const topics = [];
    
    recentMessages.forEach(msg => {
      const message = msg.message || msg.response || '';
      const intent = this.detectIntent(message);
      if (intent && !topics.includes(intent.service)) {
        topics.push(intent.service);
      }
    });
    
    const suggestions = [];
    
    if (topics.includes('copywriter')) {
      suggestions.push('Portfolio copywriter', 'SEO writing tips', 'Content marketing');
    }
    
    if (topics.includes('travel')) {
      suggestions.push('Destinasi terdekat', 'Hotel murah', 'Transportasi');
    }
    
    if (topics.length === 0) {
      suggestions.push('Jasa copywriter', 'Paket wisata', 'Travel content', 'Harga layanan');
    }
    
    return suggestions.slice(0, 3);
  }
}

module.exports = AIChatbotService;
