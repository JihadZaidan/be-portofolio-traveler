/**
 * Enhanced AI Chatbot Service
 * Advanced auto-chat with context awareness, memory, proactive features, and trending integration
 */

class EnhancedAIChatbotService {
  constructor() {
    this.knowledgeBase = this.initializeKnowledgeBase();
    this.contextMemory = new Map(); // Session-based memory
    this.userProfiles = new Map(); // User preference memory
    this.conversationFlows = this.initializeConversationFlows();
    this.proactiveTriggers = this.initializeProactiveTriggers();
    this.responseTemplates = this.initializeResponseTemplates();
    this.trendingCache = null;
    this.lastTrendingUpdate = 0;
    this.trendingUpdateInterval = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Initialize enhanced knowledge base with categories and subcategories
   */
  initializeKnowledgeBase() {
    return {
      copywriter: {
        services: {
          keywords: ['copywriter', 'copywriting', 'tulisan', 'konten', 'artikel', 'blog', 'deskripsi', 'sales letter', 'ads', 'iklan', 'content', 'writing'],
          responses: [
            {
              template: '📝 **Jasa Copywriter Professional TRAVELLO - Informasi Lengkap**\n\n🎯 **Layanan Content Writing:**\n\n**1. Blog Posts & Articles**\n• SEO-optimized content\n• 1000-2000 words per artikel\n• Keyword research included\n• Meta descriptions & title tags\n• Internal linking strategy\n• Harga: Mulai Rp 100ribu - 500ribu/artikel\n\n**2. Website Content**\n• Landing page copy\n• About us pages\n• Service descriptions\n• Product descriptions\n• FAQ sections\n• Harga: Mulai Rp 200ribu - 1juta/page\n\n**3. Social Media Content**\n• Instagram captions & hashtags\n• Facebook posts & ads\n• Twitter threads\n• LinkedIn articles\n• TikTok scripts\n• Harga: Mulai Rp 50ribu - 150ribu/post\n\n**4. Marketing Materials**\n• Sales letters & proposals\n• Email marketing campaigns\n• Press releases\n• Brochure content\n• Video scripts\n• Harga: Mulai Rp 300ribu - 800ribu/project\n\n**5. Technical Writing**\n• User manuals & guides\n• Documentation\n• White papers\n• Case studies\n• Harga: Mulai Rp 500ribu - 2juta/document\n\n🔍 **Proses Research & Sumber Data:**\n\n**Research Sources:**\n• Google Trends & Keyword Planner\n• Competitor analysis (SEMrush, Ahrefs)\n• Industry reports & statistics\n• Customer reviews & feedback\n• Social media listening\n• Academic journals & studies\n• Government data & statistics\n• Expert interviews\n\n**Content Research Process:**\n1. **Brief Analysis** - Understanding client goals\n2. **Audience Research** - Demographics & pain points\n3. **Competitor Research** - Top 10 competitors analysis\n4. **Keyword Research** - Primary & secondary keywords\n5. **Trend Analysis** - Current industry trends\n6. **Fact-Checking** - Multiple source verification\n7. **Expert Consultation** - Industry expert validation\n\n📊 **Quality Assurance:**\n• Plagiarism check (Copyscape)\n• Grammar & readability (Grammarly)\n• SEO score optimization (Yoast)\n• Mobile-friendliness test\n• Loading speed impact\n• A/B testing suggestions\n\n💰 **Struktur Harga Detail:**\n\n**Paket Bronze - Rp 50ribu/artikel**\n• 500-800 kata\n• Basic SEO\n• 1x revisi\n• 2 hari pengerjaan\n\n**Paket Silver - Rp 100ribu/artikel**\n• 1000-1500 kata\n• Advanced SEO + research\n• 2x revisi\n• 3 hari pengerjaan\n\n**Paket Gold - Rp 200ribu/artikel**\n• 2000+ kata\n• Premium SEO + comprehensive research\n• Unlimited revisi\n• 5 hari pengerjaan\n\n**Paket Platinum - Rp 500ribu/project**\n• Custom word count\n• Full marketing research\n• Priority delivery\n• Dedicated project manager\n\n⏱️ **Timeline & Process:**\n• Day 1: Brief & research\n• Day 2-3: Content creation\n• Day 4: Review & optimization\n• Day 5: Client review & revisions\n• Day 6-7: Final delivery\n\n🎓 **Portfolio & Expertise:**\n• 10+ years experience\n• 5000+ articles published\n• Various industries: travel, tech, finance, health\n• Client testimonials available\n• Sample articles on request',
              priority: 100,
              followUpQuestions: [
                'Jenis konten apa yang paling Anda butuhkan?',
                'Berapa perkiraan jumlah kata yang dibutuhkan?',
                'Kapan deadline untuk proyek ini?',
                'Apakah Anda ingin lihat portfolio kami?',
                'Apakah perlu konsultasi gratis untuk strategi konten?'
              ]
            }
          ]
        },
        pricing: {
          keywords: ['harga', 'price', 'biaya', 'cost', 'tarif', 'rate', 'bayar', 'budget', 'murah', 'mahal', 'berapa', 'harga copywriter', 'biaya jasa tulis', 'tarif penulisan'],
          responses: [
            {
              template: '💰 **Paket Harga Copywriter**\n\n🥉 **Paket Bronze** - Rp 50.000/artikel\n• 500-800 kata\n• Basic SEO\n• 1x revisi\n\n🥈 **Paket Silver** - Rp 100.000/artikel\n• 1000-1500 kata\n• Advanced SEO\n• 2x revisi\n• Research mendalam\n\n🥇 **Paket Gold** - Rp 200.000/artikel\n• 2000+ kata\n• Premium SEO\n• Unlimited revisi\n• Market analysis\n• Fast delivery (3 hari)',
              priority: 95,
              followUpQuestions: [
                'Paket mana yang sesuai dengan kebutuhan Anda?',
                'Apakah Anda perlu konsultasi gratis terlebih dahulu?'
              ]
            }
          ]
        },
        process: {
          keywords: ['proses', 'cara', 'how', 'process', 'workflow', 'kerja', 'pengerjaan'],
          responses: [
            {
              template: '🔄 **Proses Kerja Copywriter**\n\n1. **Briefing Client** - Diskusi kebutuhan dan target\n2. **Research** - Market research dan competitor analysis\n3. **Drafting** - Pembuatan konten pertama\n4. **Review** - Internal quality check\n5. **Revisi** - Sesuai feedback client\n6. **Final Delivery** - File siap publish\n\n📋 **Dokumentasi:**\n• Brief form detail\n• Progress report\n• plagiarism check\n• SEO score report',
              priority: 90,
              followUpQuestions: [
                'Apakah Anda ingin memulai dengan briefing?',
                'Apakah ada pertanyaan tentang proses kami?'
              ]
            }
          ]
        }
      },
      travel: {
        destinations: {
          keywords: ['wisata', 'destinasi', 'liburan', 'trip', 'tour', 'tempat', 'kunjungan', 'jalan-jalan', 'vacation', 'holiday', 'travel', 'bali', 'jogja', 'yogyakarta', 'labuan bajo', 'komodo', 'pantai', 'gunung', 'kota', 'tempat wisata'],
          responses: [
            {
              template: '🏝️ **Destinasi Wisata Terlengkap & Terpopuler Indonesia**\n\n🌟 **Bali - Island of Gods**\n📍 **Lokasi:** Pulau Bali, Indonesia\n🎯 **Daya Tarik Utama:**\n• Pantai Kuta - Sunset views, surfing\n• Pantai Seminyak - Luxury resorts, beach clubs\n• Nusa Dua - Water sports, family-friendly\n• Ubud - Rice terraces, art markets, yoga retreats\n• Tanah Lot - Sea temple, sunset photography\n• Uluwatu Temple - Cliff temple, Kecak dance\n\n💰 **Budget Estimasi:**\n• Backpacker: Rp 500ribu - 1juta/3 hari\n• Mid-range: Rp 1-3 juta/3 hari\n• Luxury: Rp 3-7 juta/3 hari\n\n🏨 **Akomodasi Rekomendasi:**\n• Budget: Guesthouse Rp 150ribu/malam\n• Mid-range: Hotel 3 bintang Rp 400ribu/malam\n• Luxury: Resort 5 bintang Rp 1.5juta/malam\n\n🍽️ **Kuliner Wajib:**\n• Babi Guling (Ibu Oka)\n• Bebek Betutu (Bebek Bengil)\n• Sate Lilit (Warung Made)\n• Lawar (Various warungs)\n\n🚗 **Transportasi:**\n• Sewa motor: Rp 75ribu/hari\n• Grab/Gojek: Rp 15ribu-50ribu/trip\n• Private car: Rp 600ribu/hari\n\n🏛️ **Yogyakarta - Cultural Heritage**\n📍 **Lokasi:** Pulau Jawa, Indonesia\n🎯 **Daya Tarik Utama:**\n• Candi Borobudur - Largest Buddhist temple\n• Candi Prambanan - Largest Hindu temple\n• Malioboro Street - Shopping, street food\n• Keraton Yogyakarta - Sultan palace\n• Taman Sari - Water castle\n• Pantai Parangtritis - Black sand beach\n\n💰 **Budget Estimasi:**\n• Backpacker: Rp 400ribu - 800ribu/3 hari\n• Mid-range: Rp 800ribu - 2 juta/3 hari\n• Luxury: Rp 2-4 juta/3 hari\n\n🏨 **Akomodasi Rekomendasi:**\n• Budget: Guesthouse Rp 100ribu/malam\n• Mid-range: Hotel 3 bintang Rp 300ribu/malam\n• Luxury: Hotel 4-5 bintang Rp 800ribu/malam\n\n🍽️ **Kuliner Wajib:**\n• Gudeg (Yogya)\n• Bakpia Pathok\n• Sate Klathak\n• Wedang Ronde\n\n🐉 **Labuan Bajo - Komodo Adventure**\n📍 **Lokasi:** Flores, NTT, Indonesia\n🎯 **Daya Tarik Utama:**\n• Komodo National Park - Komodo dragons\n• Pink Beach - Unique pink sand\n• Manta Point - Manta ray diving\n• Padar Island - Best viewpoint\n• Kanawa Island - Snorkeling paradise\n• Kelor Island - Water sports\n\n💰 **Budget Estimasi:**\n• Budget: Rp 3-4 juta/4 hari\n• Mid-range: Rp 4-6 juta/4 hari\n• Luxury: Rp 6-10 juta/4 hari\n\n🏨 **Akomodasi Rekomendasi:**\n• Budget: Guesthouse Rp 200ribu/malam\n• Mid-range: Resort Rp 600ribu/malam\n• Luxury: Luxury resort Rp 1.5juta/malam\n\n🤿 **Aktivitas Wajib:**\n• Komodo trekking (Rp 500ribu)\n• Diving (Rp 800ribu/dive)\n• Island hopping (Rp 1.5juta)\n• Sunset dinner (Rp 300ribu)\n\n📝 **Tips Tambahan:**\n• Best time: April-December\n• Required: Tour guide for Komodo\n• Health: Travel insurance recommended\n• Connectivity: Limited internet access',
              priority: 100,
              followUpQuestions: [
                'Destinasi mana yang paling Anda minati untuk detail lebih lanjut?',
                'Berapa budget yang Anda siapkan untuk liburan?',
                'Kapan rencana liburan Anda dan berapa lama?',
                'Apakah Anda perlu bantuan booking tiket dan akomodasi?'
              ]
            }
          ]
        },
        packages: {
          keywords: ['paket', 'package', 'promo', 'bundle', 'penawaran', 'deal', 'diskon', 'harga paket', 'paket wisata', 'paket liburan', 'paket murah'],
          responses: [
            {
              template: '🎒 **Paket Wisata Terbaik**\n\n🏖️ **Paket Bali Family**\n• 4H3M untuk 4 orang\n• Hotel + breakfast\n• Private transport\n• Tiket masuk 3 destinasi\n• Harga: Rp 6 juta\n\n🏛️ **Paket Jogja Heritage**\n• 3H2M untuk 2 orang\n• Hotel dekat Malioboro\n• Tour guide\n• All-inclusive tiket\n• Harga: Rp 3.5 juta\n\n🐉 **Paket Komodo Explorer**\n• 4H3M untuk 2 orang\n• Resort + full board\n• Private boat\n• Diving equipment\n• Harga: Rp 8 juta',
              priority: 95,
              followUpQuestions: [
                'Paket mana yang cocok untuk Anda?',
                'Apakah Anda perlu custom paket?'
              ]
            }
          ]
        },
        tips: {
          keywords: ['tips', 'trick', 'guide', 'panduan', 'hemat', 'budget', 'murah', 'irit', 'pengalaman', 'cara', 'how to', 'travel guide', 'wisata hemat'],
          responses: [
            {
              template: '💡 **Tips Traveling Hemat**\n\n🎯 **Planning:**\n• Booking tiket 1-2 bulan sebelumnya\n• Pilih weekday daripada weekend\n• Bandingkan harga di multiple platform\n\n🏨 **Akomodasi:**\n• Guesthouse/hotel bintang 2-3\n• Cari promo di Agoda/Traveloka\n• Pertimbangkan Airbnb untuk long stay\n\n🍜 **Makanan:**\n• Coba street food lokal\n• Hindari restoran di area turis\n• Beli snack di minimarket\n\n🚗 **Transportasi:**\n• Gunakan transportasi umum\n• Sewa motor untuk explore\n• Gunakan Go-Jek/Grab untuk jarak dekat',
              priority: 85,
              followUpQuestions: [
                'Destinasi mana yang Anda targetkan?',
                'Berapa budget maksimal Anda?'
              ]
            }
          ]
        }
      },
      general: {
        greeting: {
          keywords: ['halo', 'hello', 'hai', 'selamat', 'pagi', 'siang', 'sore', 'malam', 'assalam', 'assalamualaikum', 'salam'],
          responses: [
            {
              template: '👋 {greeting_response}! Selamat datang di TRAVELLO AI Assistant!\n\nSaya siap membantu Anda dengan:\n• **Jasa Copywriter** - Konten profesional untuk bisnis Anda\n• **Travel Consultation** - Rencanakan liburan impian Anda\n• **General Inquiries** - Informasi tentang layanan kami\n\nApa yang bisa saya bantu hari ini?',
              priority: 100,
              followUpQuestions: []
            }
          ]
        },
        help: {
          keywords: ['bantuan', 'help', 'tolong', 'cara', 'panduan'],
          responses: [
            {
              template: '🤝 **Bantuan TRAVELLO AI**\n\nSaya dapat membantu Anda dengan:\n\n📝 **Layanan Copywriter:**\n• Informasi harga dan paket\n• Proses pengerjaan\n• Konsultasi konten\n\n🏝️ **Layanan Travel:**\n• Rekomendasi destinasi\n• Paket wisata\n• Tips traveling\n\n💡 **Cara menggunakan:**\n1. Ketik pertanyaan Anda\n2. Saya akan memberikan respons otomatis\n3. Pilih saran yang tersedia untuk lanjut\n\nAda yang bisa saya bantu?',
              priority: 95,
              followUpQuestions: []
            }
          ]
        },
        thanks: {
          keywords: ['terima kasih', 'thanks', 'makasih', 'thank you'],
          responses: [
            {
              template: '😊 **Sama-sama!**\n\nSenang bisa membantu Anda! Jika ada pertanyaan lain seputar:\n• Jasa copywriter\n• Travel planning\n• Informasi layanan\n\nJangan ragu untuk bertanya lagi. TRAVELLO AI selalu siap membantu! 🌟',
              priority: 90,
              followUpQuestions: [
                'Ada lagi yang bisa saya bantu?',
                'Apakah Anda puas dengan respons saya?'
              ]
            }
          ]
        }
      }
    };
  }

  /**
   * Initialize conversation flows for multi-turn conversations
   */
  initializeConversationFlows() {
    return {
      copywriterConsultation: {
        trigger: ['copywriter', 'konten', 'tulisan'],
        steps: [
          {
            id: 'service_inquiry',
            question: 'Layanan copywriter apa yang Anda butuhkan?',
            options: ['Artikel Blog', 'Deskripsi Produk', 'Sales Letter', 'Social Media', 'Website Content', 'Lainnya'],
            nextStep: 'detail_collection'
          },
          {
            id: 'detail_collection',
            question: 'Berapa perkiraan jumlah kata yang dibutuhkan?',
            options: ['< 500 kata', '500-1000 kata', '1000-2000 kata', '> 2000 kata'],
            nextStep: 'timeline_inquiry'
          },
          {
            id: 'timeline_inquiry',
            question: 'Kapan Anda butuhkan konten ini?',
            options: ['1-3 hari', '4-7 hari', '1-2 minggu', 'Lebih dari 2 minggu'],
            nextStep: 'budget_inquiry'
          },
          {
            id: 'budget_inquiry',
            question: 'Berapa budget yang Anda siapkan?',
            options: ['< Rp 100.000', 'Rp 100.000 - 300.000', 'Rp 300.000 - 500.000', '> Rp 500.000'],
            nextStep: 'recommendation'
          },
          {
            id: 'recommendation',
            action: 'generate_recommendation',
            nextStep: 'completion'
          }
        ]
      },
      travelPlanning: {
        trigger: ['travel', 'liburan', 'wisata', 'trip'],
        steps: [
          {
            id: 'destination_inquiry',
            question: 'Destinasi mana yang Anda minati?',
            options: ['Bali', 'Yogyakarta', 'Labuan Bajo', 'Lainnya'],
            nextStep: 'duration_inquiry'
          },
          {
            id: 'duration_inquiry',
            question: 'Berapa lama rencana liburan Anda?',
            options: ['2-3 hari', '4-5 hari', '6-7 hari', 'Lebih dari 7 hari'],
            nextStep: 'budget_inquiry'
          },
          {
            id: 'budget_inquiry',
            question: 'Berapa budget yang Anda siapkan?',
            options: ['< Rp 1 juta', 'Rp 1-3 juta', 'Rp 3-5 juta', '> Rp 5 juta'],
            nextStep: 'traveler_count'
          },
          {
            id: 'traveler_count',
            question: 'Berapa jumlah traveler?',
            options: ['1-2 orang', '3-4 orang', '5-6 orang', 'Lebih dari 6 orang'],
            nextStep: 'package_recommendation'
          },
          {
            id: 'package_recommendation',
            action: 'generate_travel_package',
            nextStep: 'completion'
          }
        ]
      }
    };
  }

  /**
   * Initialize proactive triggers for auto-suggestions
   */
  initializeProactiveTriggers() {
    return {
      priceInquiry: {
        keywords: ['harga', 'biaya', 'cost', 'price'],
        trigger: 'show_pricing_comparison',
        delay: 1000
      },
      bookingInterest: {
        keywords: ['booking', 'pesan', 'order', 'beli'],
        trigger: 'show_booking_options',
        delay: 1500
      },
      comparisonRequest: {
        keywords: ['bandingkan', 'compare', 'versus', 'vs'],
        trigger: 'show_comparison_table',
        delay: 800
      },
      urgencyIndicators: {
        keywords: ['urgent', 'cepat', 'segera', 'besok'],
        trigger: 'show_express_options',
        delay: 500
      }
    };
  }

  /**
   * Initialize response templates for different contexts
   */
  initializeResponseTemplates() {
    return {
      clarification: '🤔 **Maaf, saya belum sepenuhnya mengerti.**\n\nBisa Anda jelaskan lebih detail tentang {topic}?\n\nAtau pilih dari opsi berikut:\n{options}',
      escalation: '🔍 **Pertanyaan Anda menarik!**\n\nUntuk memberikan jawaban terbaik, saya perlu beberapa informasi tambahan:\n{required_info}\n\nSilakan jawab atau pilih opsi yang tersedia.',
      completion: '✅ **Terima kasih atas informasinya!**\n\nBerdasarkan kebutuhan Anda, saya sarankan:\n{recommendation}\n\n{next_steps}',
      followUp: '💡 **Informasi tambahan:**\n\n{additional_info}\n\nApakah Anda ingin:\n{follow_up_options}'
    };
  }

  /**
   * Enhanced intent detection with context awareness and better keyword matching
   */
  detectIntent(message, context = {}) {
    const normalizedMessage = message.toLowerCase().trim();
    const detectedIntents = [];
    
    // Check each category and subcategory with improved matching
    for (const [category, subcategories] of Object.entries(this.knowledgeBase)) {
      for (const [subcategory, data] of Object.entries(subcategories)) {
        let keywordMatches = [];
        let exactMatches = 0;
        let partialMatches = 0;
        
        // Check for exact keyword matches
        for (const keyword of data.keywords) {
          const keywordLower = keyword.toLowerCase();
          
          // Exact match
          if (normalizedMessage === keywordLower) {
            exactMatches += 3; // Higher weight for exact matches
            keywordMatches.push(keyword);
          }
          // Contains match
          else if (normalizedMessage.includes(keywordLower)) {
            partialMatches += 1;
            keywordMatches.push(keyword);
          }
          // Partial word match
          else if (this.isPartialMatch(normalizedMessage, keywordLower)) {
            partialMatches += 0.5;
            keywordMatches.push(keyword);
          }
        }
        
        // Check for question patterns
        const questionPatterns = ['apa', 'bagaimana', 'berapa', 'kapan', 'dimana', 'mengapa', 'siapa'];
        const hasQuestionPattern = questionPatterns.some(pattern => 
          normalizedMessage.includes(pattern)
        );
        
        if (keywordMatches.length > 0) {
          const totalScore = exactMatches + partialMatches;
          const confidence = Math.min(totalScore / data.keywords.length, 1.0);
          
          detectedIntents.push({
            category,
            subcategory,
            confidence: confidence + (hasQuestionPattern ? 0.1 : 0), // Boost for questions
            matchedKeywords: keywordMatches,
            priority: data.responses[0]?.priority || 50,
            exactMatches,
            hasQuestionPattern
          });
        }
      }
    }

    // Sort by confidence, exact matches, and priority
    detectedIntents.sort((a, b) => {
      // Prioritize exact matches
      if (a.exactMatches !== b.exactMatches) {
        return b.exactMatches - a.exactMatches;
      }
      // Then by confidence
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      // Finally by priority
      return b.priority - a.priority;
    });

    // Return best match if confidence is above threshold
    const bestIntent = detectedIntents.length > 0 ? detectedIntents[0] : null;
    
    // Only accept intent with minimum confidence threshold
    const MIN_CONFIDENCE_THRESHOLD = 0.2; // 20% minimum confidence
    
    if (bestIntent && bestIntent.confidence >= MIN_CONFIDENCE_THRESHOLD) {
      // Log detection for debugging
      console.log(`🎯 Intent detected: ${bestIntent.category}/${bestIntent.subcategory} (confidence: ${bestIntent.confidence.toFixed(2)})`);
      console.log(`🔍 Matched keywords: ${bestIntent.matchedKeywords.join(', ')}`);
      return bestIntent;
    } else {
      console.log(`❓ No intent detected or confidence too low for: "${message}"`);
      console.log(`📊 Best match was: ${bestIntent ? `${bestIntent.category}/${bestIntent.subcategory} (${bestIntent.confidence.toFixed(2)})` : 'None'}`);
      return null;
    }
  }

  /**
   * Check for partial word matches
   */
  isPartialMatch(message, keyword) {
    const messageWords = message.split(' ');
    const keywordWords = keyword.split(' ');
    
    // Check if any word from keyword is in message
    return keywordWords.some(keywordWord => 
      messageWords.some(messageWord => 
        messageWord.includes(keywordWord) || keywordWord.includes(messageWord)
      )
    );
  }

  /**
   * Generate contextual response with memory awareness and trending integration
   */
  async generateResponse(message, history = [], sessionId = null) {
    const intent = this.detectIntent(message);
    const context = this.getSessionContext(sessionId);
    
    // Get trending data for contextual responses
    const trendingData = await this.getTrendingData();
    
    // Handle greeting with dynamic response
    if (intent && intent.category === 'general' && intent.subcategory === 'greeting') {
      return this.generateGreetingResponse(message);
    }
    
    // Check for ongoing conversation flow
    if (context.currentFlow) {
      const flowResponse = this.handleConversationFlow(message, context);
      if (flowResponse) {
        return flowResponse;
      }
    }

    // Generate response based on intent
    if (intent) {
      const response = this.generateIntentBasedResponse(intent, context, trendingData);
      
      // Update session context
      this.updateSessionContext(sessionId, {
        lastIntent: intent,
        lastResponse: response,
        messageCount: (context.messageCount || 0) + 1,
        currentFlow: this.shouldStartFlow(intent) ? intent.subcategory : null
      });

      return response;
    }

    // Fallback to contextual response with trending data
    return this.generateContextualResponse(message, context, trendingData);
  }

  /**
   * Generate dynamic greeting response
   */
  generateGreetingResponse(message) {
    const normalizedMessage = message.toLowerCase().trim();
    let greetingResponse = '';
    
    // Dynamic greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) {
      greetingResponse = 'Selamat pagi';
    } else if (hour < 15) {
      greetingResponse = 'Selamat siang';
    } else if (hour < 18) {
      greetingResponse = 'Selamat sore';
    } else {
      greetingResponse = 'Selamat malam';
    }
    
    // Specific responses for Islamic greetings
    if (normalizedMessage.includes('assalam') || normalizedMessage.includes('assalamualaikum')) {
      greetingResponse = 'Waalaikumsalam warahmatullahi wabarakatuh';
    }
    
    // Response template with dynamic greeting
    return `👋 ${greetingResponse}! Selamat datang di TRAVELLO AI Assistant!\n\nSaya siap membantu Anda dengan:\n• **Jasa Copywriter** - Konten profesional untuk bisnis Anda\n• **Travel Consultation** - Rencanakan liburan impian Anda\n• **General Inquiries** - Informasi tentang layanan kami\n\nApa yang bisa saya bantu hari ini?`;
  }

  /**
   * Handle multi-turn conversation flows
   */
  handleConversationFlow(message, context) {
    const flow = this.conversationFlows[context.currentFlow];
    if (!flow || !context.currentStep) return null;

    const currentStep = flow.steps.find(step => step.id === context.currentStep);
    if (!currentStep) return null;

    // Process user response
    const response = this.processFlowStep(currentStep, message, context);
    
    // Move to next step
    const nextStepId = currentStep.nextStep;
    if (nextStepId === 'completion') {
      this.clearSessionFlow(context.sessionId);
      return response;
    }

    const nextStep = flow.steps.find(step => step.id === nextStepId);
    if (nextStep) {
      this.updateSessionContext(context.sessionId, {
        currentStep: nextStepId,
        flowData: { ...context.flowData, [currentStep.id]: message }
      });
      
      return response + '\n\n' + this.formatStepQuestion(nextStep);
    }

    return response;
  }

  /**
   * Process individual flow step
   */
  processFlowStep(step, message, context) {
    if (step.action === 'generate_recommendation') {
      return this.generateRecommendation(context.flowData, 'copywriter');
    }
    
    if (step.action === 'generate_travel_package') {
      return this.generateTravelPackage(context.flowData);
    }

    return '✅ **Terima kasih!** Informasi Anda telah tersimpan.';
  }

  /**
   * Format step question for user
   */
  formatStepQuestion(step) {
    let question = `❓ **${step.question}**\n\n`;
    
    if (step.options) {
      question += step.options.map((option, index) => 
        `${index + 1}. ${option}`
      ).join('\n');
    }

    return question;
  }

  /**
   * Generate intent-based response with enhancements and trending data
   */
  generateIntentBasedResponse(intent, context, trendingData = null) {
    const categoryData = this.knowledgeBase[intent.category][intent.subcategory];
    const response = categoryData.responses[0];
    
    let finalResponse = response.template;

    // Add trending information for relevant categories (disabled for now)
    // TODO: Implement trending service integration
    if (false && trendingData && (intent.category === 'travel' || intent.category === 'general')) {
      // const trendingInfo = this.newsService.generateTrendingResponse('', trendingData);
      // if (trendingInfo && trendingInfo.trim() !== '') {
      //   finalResponse += '\n\n' + trendingInfo;
      // }
    }

    // Add contextual enhancements
    if (context.messageCount > 1) {
      finalResponse += '\n\n💡 **Berdasarkan percakapan kita sebelumnya...**';
    }

    // Add follow-up questions
    if (response.followUpQuestions && response.followUpQuestions.length > 0) {
      finalResponse += '\n\n**Pertanyaan lanjutan:**\n';
      finalResponse += response.followUpQuestions.map((q, i) => 
        `${i + 1}. ${q}`
      ).join('\n');
    }

    // Add proactive suggestions
    const proactiveSuggestions = this.generateProactiveSuggestions(intent, context);
    if (proactiveSuggestions.length > 0) {
      finalResponse += '\n\n💭 **Mungkin Anda juga tertarik:**\n';
      finalResponse += proactiveSuggestions.map(s => `• ${s}`).join('\n');
    }

    return finalResponse;
  }

  /**
   * Generate contextual fallback response with trending data
   */
  async generateContextualResponse(message, context, trendingData = null) {
    const templates = [
      '🤔 **Saya belum sepenuhnya mengerti pertanyaan Anda.**\n\nBisa Anda jelaskan lebih detail? Saya siap membantu dengan:\n• **Jasa Copywriter** - Konten profesional (harga mulai Rp 50ribu)\n• **Travel Planning** - Paket wisata & destinasi\n• **General Info** - Informasi layanan TRAVELLO\n\n💡 **Coba tanya:** "berapa harga copywriter?" atau "destinasi wisata terbaik"',
      
      '💡 **Mari kita fokus pada kebutuhan Anda.**\n\nApakah Anda mencari informasi tentang:\n• **Copywriter** - Harga, proses, portfolio (mulai Rp 50ribu/artikel)\n• **Travel** - Destinasi Bali, Jogja, Labuan Bajo (mulai Rp 800ribu)\n• **Paket** - Promo wisata & penawaran khusus\n• **Tips** - Panduan traveling hemat\n\n🎯 **Contoh pertanyaan:** "paket wisata Bali" atau "proses pembuatan artikel"',
      
      '🎯 **Saya di sini untuk membantu!**\n\nSilakan pilih topik yang Anda minati:\n1. **Jasa Copywriter** - Harga, proses, portfolio\n2. **Travel Planning** - Destinasi, paket, tips\n3. **General Inquiry** - Informasi perusahaan\n\n✨ **Popular Questions:**\n• "Berapa harga artikel 1000 kata?"\n• "Apa saja paket wisata Bali?"\n• "Bagaimana cara pesan jasa copywriter?"',
      
      '🔍 **Coba dengan kata kunci yang lebih spesifik.**\n\nSaya bisa membantu Anda dengan:\n\n📝 **Copywriter:**\n• "harga copywriter"\n• "proses pembuatan artikel"\n• "jenis layanan tulis"\n\n🏝️ **Travel:**\n• "destinasi wisata"\n• "paket liburan"\n• "tips traveling hemat"\n\n💡 **Tips:** Gunakan kata kunci seperti "harga", "paket", "destinasi", atau "proses"'
    ];

    const templateIndex = context.messageCount % templates.length;
    let response = templates[templateIndex];

    // Add trending information if available (disabled for now)
    // TODO: Implement trending service integration
    if (false && trendingData) {
      // const trendingInfo = this.newsService.generateTrendingResponse(message, trendingData);
      // if (trendingInfo && trendingInfo.trim() !== '') {
      //   response += '\n\n' + trendingInfo;
      // }
    }

    return response;
  }

  /**
   * Generate proactive suggestions based on context
   */
  generateProactiveSuggestions(intent, context) {
    const suggestions = [];
    
    // Add category-specific suggestions
    if (intent.category === 'copywriter') {
      suggestions.push('Lihat portfolio kami', 'Dapatkan penawaran khusus', 'Konsultasi gratis');
    } else if (intent.category === 'travel') {
      suggestions.push('Paket promo bulan ini', 'Tips hemat traveling', 'Custom itinerary');
    }

    // Add context-aware suggestions
    if (context.messageCount > 2) {
      suggestions.push('Hubungi human assistant', 'Jadwalkan konsultasi');
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Generate contextual suggestions for user
   */
  generateContextualSuggestions(response, history = [], sessionId = null) {
    const context = this.getSessionContext(sessionId);
    const suggestions = [];
    
    // Base suggestions from response
    const baseSuggestions = this.extractSuggestionsFromResponse(response);
    suggestions.push(...baseSuggestions);

    // Add context-aware suggestions
    if (context.lastIntent) {
      const contextualSuggestions = this.generateContextualSuggestions(context.lastIntent, context);
      suggestions.push(...contextualSuggestions);
    }

    // Add proactive suggestions based on triggers
    const proactiveSuggestions = this.checkProactiveTriggers(history);
    suggestions.push(...proactiveSuggestions);

    // Remove duplicates and limit
    return [...new Set(suggestions)].slice(0, 5);
  }

  /**
   * Extract suggestions from AI response
   */
  extractSuggestionsFromResponse(response) {
    const suggestions = [];
    
    // Extract numbered lists
    const numberedMatches = response.match(/\d+\.\s+([^\n]+)/g);
    if (numberedMatches) {
      suggestions.push(...numberedMatches.map(match => 
        match.replace(/^\d+\.\s+/, '').trim()
      ));
    }

    // Extract bullet points
    const bulletMatches = response.match(/•\s+([^\n]+)/g);
    if (bulletMatches) {
      suggestions.push(...bulletMatches.map(match => 
        match.replace(/^•\s+/, '').trim()
      ));
    }

    return suggestions.filter(s => s.length > 5 && s.length < 100);
  }

  /**
   * Check for proactive triggers
   */
  checkProactiveTriggers(history) {
    if (history.length === 0) return [];
    
    const lastMessage = history[history.length - 1];
    const messageText = lastMessage.content || lastMessage.message || '';
    
    const triggeredSuggestions = [];
    
    for (const [triggerName, triggerData] of Object.entries(this.proactiveTriggers)) {
      const hasTrigger = triggerData.keywords.some(keyword => 
        messageText.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasTrigger) {
        triggeredSuggestions.push(...this.getTriggerSuggestions(triggerName));
      }
    }
    
    return triggeredSuggestions;
  }

  /**
   * Get suggestions for specific trigger
   */
  getTriggerSuggestions(triggerName) {
    const triggerSuggestions = {
      priceInquiry: [
        'Bandingkan paket harga',
        'Dapatkan diskon spesial',
        'Cek promo terbaru'
      ],
      bookingInterest: [
        'Pesan sekarang',
        'Cek ketersediaan',
        'Hubungi sales'
      ],
      comparisonRequest: [
        'Bandingkan fitur',
        'Lihat perbedaan paket',
        'Analisis keuntungan'
      ],
      urgencyIndicators: [
        'Layanan express',
        'Proses cepat',
        'Same day delivery'
      ]
    };

    return triggerSuggestions[triggerName] || [];
  }

  /**
   * Session context management
   */
  getSessionContext(sessionId) {
    if (!sessionId) return {};
    return this.contextMemory.get(sessionId) || {};
  }

  updateSessionContext(sessionId, updates) {
    if (!sessionId) return;
    
    const currentContext = this.getSessionContext(sessionId);
    const updatedContext = { ...currentContext, ...updates, sessionId };
    this.contextMemory.set(sessionId, updatedContext);
  }

  clearSessionFlow(sessionId) {
    if (!sessionId) return;
    
    const context = this.getSessionContext(sessionId);
    this.updateSessionContext(sessionId, {
      ...context,
      currentFlow: null,
      currentStep: null,
      flowData: null
    });
  }

  /**
   * Determine if conversation flow should start
   */
  shouldStartFlow(intent) {
    const flowStarters = ['services', 'destinations', 'packages'];
    return flowStarters.includes(intent.subcategory);
  }

  /**
   * Generate recommendation based on flow data
   */
  generateRecommendation(flowData, type) {
    if (type === 'copywriter') {
      return this.generateCopywriterRecommendation(flowData);
    }
    return '📋 **Rekomendasi sedang disiapkan...**';
  }

  /**
   * Generate copywriter recommendation
   */
  generateCopywriterRecommendation(flowData) {
    const recommendations = {
      '500-1000 kata': 'Paket Silver - Rp 100.000',
      '1000-2000 kata': 'Paket Gold - Rp 200.000',
      '> 2000 kata': 'Paket Platinum - Custom pricing'
    };

    const wordCount = flowData.detail_collection;
    const recommendation = recommendations[wordCount] || 'Paket Custom - Konsultasi diperlukan';

    return `🎯 **Rekomendasi Copywriter:**\n\nBerdasarkan kebutuhan Anda:\n• **Paket:** ${recommendation}\n• **Timeline:** ${flowData.timeline_inquiry || 'Standard'}\n• **Budget:** ${flowData.budget_inquiry || 'Flexible'}\n\n✨ **Langkah selanjutnya:**\n1. Konfirmasi paket yang dipilih\n2. Briefing detail proyek\n3. Pembayaran DP 50%\n4. Proses pengerjaan dimulai`;
  }

  /**
   * Generate travel package recommendation
   */
  generateTravelPackage(flowData) {
    const destinations = {
      'Bali': 'Paket Bali Explorer - Mulai Rp 2.5jt',
      'Yogyakarta': 'Paket Jogja Heritage - Mulai Rp 1.8jt',
      'Labuan Bajo': 'Paket Komodo Adventure - Mulai Rp 4.5jt'
    };

    const destination = flowData.destination_inquiry || 'Bali';
    const packageInfo = destinations[destination] || 'Paket Custom - Konsultasi diperlukan';

    return `🏝️ **Rekomendasi Travel Package:**\n\nBerdasarkan preferensi Anda:\n• **Destinasi:** ${destination}\n• **Durasi:** ${flowData.duration_inquiry || '3 hari'}\n• **Budget:** ${flowData.budget_inquiry || 'Flexible'}\n• **Jumlah:** ${flowData.traveler_count || '2 orang'}\n\n✈️ **Paket yang disarankan:** ${packageInfo}\n\n📞 **Langkah selanjutnya:**\n1. Konfirmasi pilihan paket\n2. Cek ketersediaan tanggal\n3. Pembayaran DP 30%\n4. Dapatkan e-ticket & itinerary`;
  }

  /**
   * Get enhanced analytics data
   */
  getAnalytics() {
    return {
      totalSessions: this.contextMemory.size,
      activeFlows: Array.from(this.contextMemory.values())
        .filter(ctx => ctx.currentFlow).length,
      popularIntents: this.getPopularIntents(),
      averageMessagesPerSession: this.getAverageMessagesPerSession()
    };
  }

  /**
   * Get popular intents from session data
   */
  getPopularIntents() {
    const intentCounts = {};
    
    for (const context of this.contextMemory.values()) {
      if (context.lastIntent) {
        const key = `${context.lastIntent.category}_${context.lastIntent.subcategory}`;
        intentCounts[key] = (intentCounts[key] || 0) + 1;
      }
    }

    return Object.entries(intentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([intent, count]) => ({ intent, count }));
  }

  /**
   * Get average messages per session
   */
  getAverageMessagesPerSession() {
    const contexts = Array.from(this.contextMemory.values());
    if (contexts.length === 0) return 0;
    
    const totalMessages = contexts.reduce((sum, ctx) => sum + (ctx.messageCount || 0), 0);
    return Math.round(totalMessages / contexts.length);
  }

  /**
   * Get trending data for enhanced responses (disabled for now)
   */
  async getTrendingData() {
    // TODO: Implement trending service integration
    // For now, return null to disable trending features
    return null;
    
    /*
    // Check if we need to update the cache
    if (!this.trendingCache || (now - this.lastTrendingUpdate) > this.trendingUpdateInterval) {
      try {
        this.trendingCache = await this.newsService.getTrendingData();
        this.lastTrendingUpdate = now;
        console.log('🔄 Trending data updated successfully');
      } catch (error) {
        console.error('❌ Error updating trending data:', error.message);
        // Keep existing cache if update fails
        if (!this.trendingCache) {
          this.trendingCache = this.newsService.getFallbackTrendingData();
        }
      }
    }
    */
  }

  /**
   * Generate automatic welcome message with trending info
   */
  async generateWelcomeMessage(sessionId = null) {
    const trendingData = await this.getTrendingData();
    const context = this.getSessionContext(sessionId);
    
    let welcomeMessage = `🤖 **Selamat datang di AI Assistant TRAVELLO!**\n\n`;
    welcomeMessage += `Saya adalah asisten pintar yang siap membantu Anda dengan:\n\n`;
    welcomeMessage += `📝 **Jasa Copywriter:**\n• Artikel blog & website content\n• Social media copywriting\n• Sales letter & marketing content\n• SEO writing & product descriptions\n\n`;
    welcomeMessage += `🏝️ **Travel Consultation:**\n• Destinasi wisata terbaik\n• Paket tour & akomodasi\n• Tips traveling hemat\n• Itinerary planning\n\n`;
    
    // Add trending information
    if (trendingData && trendingData.trendingTopics && trendingData.trendingTopics.length > 0) {
      welcomeMessage += `🔥 **Sedang Trending:**\n`;
      trendingData.trendingTopics.slice(0, 2).forEach((topic, index) => {
        welcomeMessage += `• ${topic.topic}\n`;
      });
      welcomeMessage += `\n`;
    }
    
    welcomeMessage += `💡 **Silakan ajukan pertanyaan Anda!**`;
    
    return welcomeMessage;
  }

  /**
   * Generate automatic response based on current time and context
   */
  async generateAutomaticResponse(sessionId = null) {
    const trendingData = await this.getTrendingData();
    const context = this.getSessionContext(sessionId);
    const currentHour = new Date().getHours();
    
    let timeGreeting = '';
    if (currentHour >= 5 && currentHour < 12) {
      timeGreeting = '🌅 **Selamat pagi!**';
    } else if (currentHour >= 12 && currentHour < 17) {
      timeGreeting = '☀️ **Selamat siang!**';
    } else if (currentHour >= 17 && currentHour < 21) {
      timeGreeting = '🌆 **Selamat sore!**';
    } else {
      timeGreeting = '🌙 **Selamat malam!**';
    }
    
    let autoResponse = `${timeGreeting}\n\n`;
    
    // Add contextual message based on session history
    if (context.messageCount === 0) {
      autoResponse += `Ini adalah percakapan pertama kita. Saya siap membantu Anda dengan informasi terkini seputar travel dan copywriter.\n\n`;
    } else if (context.messageCount > 0) {
      autoResponse += `Senang bisa berbicara dengan Anda lagi! 🎯\n\n`;
    }
    
    // Add trending travel news
    if (trendingData && trendingData.travelNews && trendingData.travelNews.length > 0) {
      autoResponse += `📰 **Berita Travel Terkini:**\n`;
      trendingData.travelNews.slice(0, 2).forEach((news, index) => {
        autoResponse += `${index + 1}. ${news.title}\n`;
        autoResponse += `   📝 ${news.description?.substring(0, 80)}...\n\n`;
      });
    }
    
    // Add proactive suggestions
    autoResponse += `💡 **Mungkin Anda tertarik dengan:**\n`;
    autoResponse += `• Destinasi wisata populer bulan ini\n`;
    autoResponse += `• Tips hemat traveling untuk akhir pekan\n`;
    autoResponse += `• Promo paket liburan terbaru\n\n`;
    autoResponse += `Ada yang bisa saya bantu hari ini?`;
    
    return autoResponse;
  }

  /**
   * Check if automatic response should be triggered
   */
  shouldTriggerAutoResponse(context, messageCount) {
    const currentHour = new Date().getHours();
    const lastMessageTime = context.lastMessageTime || 0;
    const timeSinceLastMessage = Date.now() - lastMessageTime;
    
    // Trigger if:
    // 1. First message in session
    // 2. No messages in last 30 minutes
    // 3. During peak hours (9-11 AM, 2-4 PM) with no recent activity
    return (
      messageCount === 0 ||
      timeSinceLastMessage > 30 * 60 * 1000 ||
      ((currentHour >= 9 && currentHour <= 11) || (currentHour >= 14 && currentHour <= 16)) && timeSinceLastMessage > 10 * 60 * 1000
    );
  }
}

module.exports = EnhancedAIChatbotService;
