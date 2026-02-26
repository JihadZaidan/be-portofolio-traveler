/**
 * Enhanced AI Chatbot Service
 * Advanced auto-chat with context awareness, memory, proactive features, and trending integration
 */

const { chatWithGemini } = require('./gemini.servce.js');

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
      travel: {
        destinations: {
          keywords: ['destinations', 'destinasi', 'tempat', 'lokasi', 'wisata', 'tourist', 'places', 'locations', 'top 5', 'best destinations', 'destinations terbaik', 'יעדים', 'وجهات', 'направления', 'destinations'],
          responses: [
            {
              template: '🌴 **Top 5 Destinations in Indonesia:**\n\n1. **Bali** - Beaches, temples, and vibrant culture\n2. **Yogyakarta** - Cultural heart with temples and palaces\n3. **Raja Ampat** - World-class diving paradise\n4. **Komodo Island** - Dragons and pristine nature\n5. **Lombok** - Beautiful beaches and less crowded\n\nEach destination offers unique experiences. Which one interests you most?',
              priority: 100,
              followUpQuestions: [
                'Which destination suits your travel style?',
                'Need detailed information about any destination?',
                'What\'s your budget range?',
                'When are you planning to travel?'
              ]
            }
          ]
        },
        budget: {
          keywords: ['budget', 'hemat', 'murah', 'cheap', 'economical', 'save money', 'bajet', 'biaya', 'cost', 'travel budget', 'budget travel', 'תקציב', 'ميزانية', 'бюджет', 'presupuesto'],
          responses: [
            {
              template: '💰 **Budget Travel Tips for Indonesia:**\n\n**Accommodation:**\n• Hostels: $5-15/night\n• Guesthouses: $15-30/night\n• Budget hotels: $25-50/night\n\n**Transportation:**\n• Local buses: $1-5 per trip\n• Train economy class: $10-50\n• Domestic flights: $30-100\n\n**Food:**\n• Street food: $1-3 per meal\n• Local restaurants: $3-8 per meal\n• Tourist restaurants: $8-15 per meal\n\n**Daily Budget:**\n• Backpacker: $20-35/day\n• Mid-range: $50-80/day\n• Comfort: $100+/day',
              priority: 95,
              followUpQuestions: [
                'What\'s your daily budget preference?',
                'Need specific destination budget breakdown?',
                'Want money-saving accommodation tips?',
                'Interested in free activities?'
              ]
            }
          ]
        },
        accommodation: {
          keywords: ['hotel', 'resort', 'penginapan', 'accommodation', 'stay', 'lodging', 'hostel', 'guesthouse', 'best hotels', 'hotels bali', 'מלון', 'فندق', 'отель', 'hotel'],
          responses: [
            {
              template: '🏨 **Best Hotels & Resorts in Bali:**\n\n**Luxury (5-Star):**\n• The Mulia Bali - $200-400/night\n• Four Seasons Resort - $300-600/night\n• St. Regis Bali - $250-500/night\n\n**Mid-Range (3-4 Star):**\n• The Seminyak Beach Resort - $80-150/night\n• The Udaya Resorts - $60-120/night\n• The Haven Bali - $70-140/night\n\n**Budget:**\n• Poppies Hotel - $30-60/night\n• Inna Kuta Beach - $40-70/night\n• Zebra Hostel - $15-30/night\n\n**Areas:** Seminyak (upscale), Ubud (cultural), Kuta (budget), Nusa Dua (luxury)',
              priority: 90,
              followUpQuestions: [
                'Which area of Bali interests you?',
                'What\'s your preferred price range?',
                'Need family-friendly recommendations?',
                'Looking for beachfront or cultural locations?'
              ]
            }
          ]
        },
        food: {
          keywords: ['food', 'makanan', 'cuisine', 'kuliner', 'dish', 'masakan', 'local food', 'must try', 'indonesian foods', 'makanan khas', 'אוכל', 'طعام', 'еда', 'comida'],
          responses: [
            {
              template: '🍛 **Must-Try Indonesian Foods:**\n\n**Main Dishes:**\n• **Nasi Goreng** - Fried rice with spices\n• **Rendang** - Spicy beef curry (Padang)\n• **Satay** - Grilled meat skewers\n• **Gado-Gado** - Vegetable salad with peanut sauce\n• **Soto** - Traditional Indonesian soup\n\n**Street Food:**\n• **Bakso** - Meatball soup\n• **Siomay** - Steamed dumplings\n• **Martabak** - Sweet/savory pancake\n• **Gorengan** - Fried snacks\n\n**Regional Specialties:**\n• **Babi Guling** - Balinese roast suckling pig\n• **Mie Aceh** - Spicy Acehnese noodles\n• **Pempek** - Fish cake (Palembang)',
              priority: 85,
              followUpQuestions: [
                'Which cuisine type interests you most?',
                'Need vegetarian options?',
                'Want street food recommendations?',
                'Interested in cooking classes?'
              ]
            }
          ]
        },
        weather: {
          keywords: ['weather', 'season', 'musim', 'time', 'best time', 'cuaca', 'climate', 'when to visit', 'best season', 'מזג אוויר', 'الطقس', 'погода', 'tiempo'],
          responses: [
            {
              template: '🌤️ **Best Time to Visit Indonesia:**\n\n**Dry Season (April - October):**\n• Best time for outdoor activities\n• Less rain, more sunshine\n• Peak tourist season (June-August)\n\n**Wet Season (November - March):**\n• Lush green landscapes\n• Fewer crowds, lower prices\n• Occasional heavy rain\n\n**Regional Variations:**\n• **Bali:** Best April-October\n• **Sumatra:** Best March-October\n• **Java:** Best May-September\n• **Flores/Komodo:** Best April-November\n\n**Temperature:** 26-32°C year-round',
              priority: 80,
              followUpQuestions: [
                'Which regions are you planning to visit?',
                'Prefer dry or wet season travel?',
                'Need specific month recommendations?',
                'Concerned about weather for specific activities?'
              ]
            }
          ]
        },
        visa: {
          keywords: ['visa', 'izin', 'permit', 'entry', 'documentation', 'need visa', 'visa requirements', 'visa indonesia', 'ויזה', 'تأشيرة', 'виза', 'visa'],
          responses: [
            {
              template: '📋 **Indonesia Visa Requirements:**\n\n**Visa-Free Countries (30 days):**\n• ASEAN members\n• Most European countries\n• USA, Canada, Australia\n• Japan, South Korea\n\n**Visa on Arrival (30 days, extendable):**\n• $35 USD fee\n• Available at major airports/seaports\n• Can extend once (30 days)\n\n**Required Documents:**\n• Passport (6+ months validity)\n• Return/onward ticket\n• Proof of accommodation\n• Sufficient funds\n\n**Long Stay:**\n• Social/Cultural Visa (60 days)\n• Business Visa (60 days)\n• Retirement Visa (1 year)',
              priority: 75,
              followUpQuestions: [
                'What\'s your nationality?',
                'How long do you plan to stay?',
                'Purpose of your visit?',
                'Need specific visa application help?'
              ]
            }
          ]
        },
        transportation: {
          keywords: ['transport', 'transportasi', 'travel', 'commute', 'getting around', 'transportation options', 'opsi transportasi', 'תחבורה', 'نقل', 'транспорт', 'transporte'],
          responses: [
            {
              template: '🚗 **Transportation Options in Indonesia:**\n\n**Domestic Flights:**\n• Garuda Indonesia (premium)\n• Lion Air (budget)\n• AirAsia (budget)\n• Citilink (budget)\n\n**Trains:**\n• Executive class: $15-50\n• Business class: $10-30\n• Economy class: $5-15\n\n**Buses:**\n• Luxury buses: $10-25\n• Regular buses: $5-15\n• Minibuses: $2-8\n\n**Local Transport:**\n• Ojek (motorcycle taxi): $1-5\n• Becak (pedicab): $2-8\n• Angkot (minivan): $0.50-2\n\n**Ride-hailing:**\n• Gojek & Grab available nationwide',
              priority: 70,
              followUpQuestions: [
                'Which islands are you traveling between?',
                'Budget or comfort preference?',
                'Need intercity or local transport?',
                'Interested in scenic routes?'
              ]
            }
          ]
        },
        culture: {
          keywords: ['culture', 'etiquette', 'customs', 'tradition', 'budaya', 'adat', 'sosial', 'cultural etiquette', 'etika budaya', 'תרבות', 'ثقافة', 'культура', 'cultura'],
          responses: [
            {
              template: '🙏 **Cultural Etiquette for Tourists:**\n\n**General Etiquette:**\n• Dress modestly at religious sites\n• Remove shoes before entering homes/temples\n• Use right hand for giving/receiving\n• Point with thumb, not index finger\n\n**Religious Sites:**\n• Cover shoulders and knees\n• Wear sash (often provided)\n• Don\'t climb sacred structures\n• Respect prayer times\n\n**Social Customs:**\n• Greet with "Selamat Pagi/Siang/Sore/Malam"\n• Smile and be friendly\n• Don\'t touch heads (sacred)\n• Ask permission before photographing people\n\n**Dining:**\n• Wait to be invited to eat\n• Don\'t leave food unfinished\n• Use right hand for eating\n\n**Bali Specific:**\n• Don\'t touch temple offerings\n• Respect ceremonies and processions',
              priority: 65,
              followUpQuestions: [
                'Visiting specific religious sites?',
                'Need temple visit guidelines?',
                'Attending local ceremonies?',
                'Gift-giving customs?'
              ]
            }
          ]
        }
      },
      general: {
        greeting: {
          keywords: ['hello', 'hi', 'halo', 'hai', 'salam', 'שלום', 'مرحبا', 'привет', 'hola'],
          responses: [
            {
              template: '👋 Welcome to Travello Assistant! I\'m here to help with your Indonesia travel needs. Ask me anything about destinations, budget, accommodations, food, or cultural tips!',
              priority: 100,
              followUpQuestions: [
                'What brings you to Indonesia?',
                'Need help planning your trip?',
                'First time visiting Indonesia?'
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
  async generateResponse(message, history = [], sessionId = null, language = 'en') {
    const intent = this.detectIntent(message);
    const context = this.getSessionContext(sessionId);
    
    // Get trending data for contextual responses
    const trendingData = await this.getTrendingData();
    
    // Handle greeting with dynamic response
    if (intent && intent.category === 'general' && intent.subcategory === 'greeting') {
      return await this.generateGreetingResponse(message, language);
    }
    
    // Check for ongoing conversation flow
    if (context.currentFlow) {
      const flowResponse = this.handleConversationFlow(message, context);
      if (flowResponse) {
        return flowResponse;
      }
    }

    // Generate response based on intent using Gemini for all languages
    if (intent) {
      // Use Gemini service for intelligent multilingual responses
      try {
        const geminiResponse = await chatWithGemini(message, [], language);
        return geminiResponse;
      } catch (error) {
        console.error('Gemini service error, using fallback:', error);
        const response = this.generateIntentBasedResponse(intent, context, trendingData, language);
        return response;
      }
    }

    // Fallback to contextual response with trending data using Gemini
    return this.generateContextualResponse(message, context, trendingData, language);
  }

  /**
   * Generate dynamic greeting response using Gemini
   */
  async generateGreetingResponse(message, language = 'en') {
    try {
      // Use Gemini service for intelligent multilingual greetings
      const greetingPrompt = language === 'he' ? 'שלום! ברוכים למסייע טראבלו.' :
                           language === 'en' ? 'Hello! Welcome to Travello Assistant.' :
                           language === 'id' ? 'Halo! Selamat datang di Travello Assistant.' :
                           'Halo! Selamat datang di Travello Assistant.';
      
      const geminiResponse = await chatWithGemini(greetingPrompt + ' ' + message, [], language);
      return geminiResponse;
    } catch (error) {
      console.error('Gemini greeting error, using fallback:', error);
      
      const normalizedMessage = message.toLowerCase().trim();
      let greetingResponse = '';
      
      // Dynamic greeting based on time and language
      const hour = new Date().getHours();
      const greetings = {
        en: {
          morning: 'Good morning',
          afternoon: 'Good afternoon', 
          evening: 'Good evening',
          night: 'Good night'
        },
        id: {
          morning: 'Selamat pagi',
          afternoon: 'Selamat siang',
          evening: 'Selamat sore', 
          night: 'Selamat malam'
        },
        he: {
          morning: 'בוקר טוב',
          afternoon: 'צהריים טובים',
          evening: 'ערב טוב',
          night: 'לילה טוב'
        }
        // Add more languages as needed
      };
      
      const langGreetings = greetings[language] || greetings.en;
      
      if (hour < 12) {
        greetingResponse = langGreetings.morning;
      } else if (hour < 15) {
        greetingResponse = langGreetings.afternoon;
      } else if (hour < 18) {
        greetingResponse = langGreetings.evening;
      } else {
        greetingResponse = langGreetings.night;
      }
      
      // Specific responses for Islamic greetings
      if (normalizedMessage.includes('assalam') || normalizedMessage.includes('assalamualaikum')) {
        greetingResponse = language === 'he' ? 'שלום וברכה' : 'Waalaikumsalam warahmatullahi wabarakatuh';
      }
      
      // Response template with dynamic greeting
      const templates = {
        en: `👋 ${greetingResponse}! Welcome to TRAVELLO AI Assistant!\n\nI'm ready to help you with:\n• **Copywriter Services** - Professional content for your business\n• **Travel Consultation** - Plan your dream vacation\n• **General Inquiries** - Information about our services\n\nHow can I help you today?`,
        id: `👋 ${greetingResponse}! Selamat datang di TRAVELLO AI Assistant!\n\nSaya siap membantu Anda dengan:\n• **Jasa Copywriter** - Konten profesional untuk bisnis Anda\n• **Travel Consultation** - Rencanakan liburan impian Anda\n• **General Inquiries** - Informasi tentang layanan kami\n\nApa yang bisa saya bantu hari ini?`,
        he: `👋 ${greetingResponse}! ברוכים למסייע TRAVELLO AI!\n\nאני מוכן לעזור לךם עם:\n• **שירותי כותבים** - תוכן מקצועי לעסק שלךם\n• **ייעוץ נסיעות** - תכנן את החופשה של חלומותיךם\n• **שאלות כלליות** - מידע על השירותים שלנו\n\nאיך אני יכול לעזור לךם היום?`
      };
      
      return templates[language] || templates.en;
    }
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
  generateIntentBasedResponse(intent, context, trendingData = null, language = 'en') {
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
      const contextualText = language === 'he' ? '💡 **בהתבסס על השיחה שלנו קודם...**' : 
                           language === 'en' ? '💡 **Based on our previous conversation...**' :
                           '💡 **Berdasarkan percakapan kita sebelumnya...**';
      finalResponse += '\n\n' + contextualText;
    }

    // Add follow-up questions
    if (response.followUpQuestions && response.followUpQuestions.length > 0) {
      const followUpTitle = language === 'he' ? '**שאלות המשך:**' :
                          language === 'en' ? '**Follow-up questions:**' :
                          '**Pertanyaan lanjutan:**';
      finalResponse += '\n\n' + followUpTitle + '\n';
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
   * Generate contextual fallback response with trending data using Gemini
   */
  async generateContextualResponse(message, context, trendingData = null, language = 'en') {
    try {
      // Use Gemini service for intelligent responses
      const geminiResponse = await chatWithGemini(message, [], language);
      return geminiResponse;
    } catch (error) {
      console.error('Gemini service error, using fallback:', error);
      
      // Fallback templates
      const templates = {
        en: '🤔 **I don\'t quite understand your question.**\n\nCould you explain in more detail? I\'m ready to help with:\n• **Copywriter Services** - Professional content for your business\n• **Travel Consultation** - Plan your dream vacation\n• **General Inquiries** - Information about our services\n\n💡 **Try asking:** "how much for copywriting?" or "best travel destinations"',
        id: '🤔 **Saya belum sepenuhnya mengerti pertanyaan Anda.**\n\nBisa Anda jelaskan lebih detail? Saya siap membantu dengan:\n• **Jasa Copywriter** - Konten profesional (harga mulai Rp 50ribu)\n• **Travel Planning** - Paket wisata & destinasi\n• **General Info** - Informasi layanan TRAVELLO\n\n💡 **Coba tanya:** "berapa harga copywriter?" atau "destinasi wisata terbaik"',
        he: '🤔 **אני לא מבין לחלוטין את השאלה שלךם.**\n\nהאם תוכלו להסביר יותר? אני מוכן לעזור עם:\n• **שירותי כותבים** - תוכן מקצועי לעסק שלךם\n• **ייעוץ נסיעות** - תכנון החופשה של חלומותיךם\n• **שאלות כלליות** - מידע על השירותים שלנו\n\n💡 **נסה לשאול:** "כמה עולה כתיבה?" או "יעדים טובים לנסיעות"'
      };

      const templateIndex = context.messageCount % Object.keys(templates).length;
      return templates[language] || templates.en;
    }
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
