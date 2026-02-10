/**
 * News and Trending Topics Service
 * Fetches current issues and trending topics for AI chatbot integration
 */

const axios = require('axios');

class NewsTrendingService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    this.newsApiKey = process.env.NEWS_API_KEY || 'demo-key';
    this.gnewsApiKey = process.env.GNEWS_API_KEY || 'demo-key';
  }

  /**
   * Fetch trending news in Indonesia
   */
  async fetchIndonesianNews() {
    const cacheKey = 'indonesian_news';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Using NewsAPI.org (free tier available)
      const newsSources = [
        'detik.com',
        'kompas.com', 
        'tempo.co',
        'liputan6.com',
        'cnnindonesia.com',
        'tribunnews.com'
      ];

      const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
        params: {
          country: 'id',
          category: 'general',
          sources: newsSources.join(','),
          pageSize: 10,
          apiKey: this.newsApiKey
        },
        timeout: 10000
      });

      const news = response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        category: this.categorizeNews(article.title + ' ' + article.description)
      }));

      this.setCache(cacheKey, news);
      return news;

    } catch (error) {
      console.error('Error fetching Indonesian news:', error.message);
      return this.getFallbackIndonesianNews();
    }
  }

  /**
   * Fetch trending travel news specifically
   */
  async fetchTravelNews() {
    const cacheKey = 'travel_news';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Search for travel-related news
      const travelKeywords = [
        'wisata', 'travel', 'liburan', 'destinasi', 
        'pariwisata', 'tourism', 'hotel', 'penerbangan'
      ];

      const response = await axios.get(`https://newsapi.org/v2/everything`, {
        params: {
          q: travelKeywords.join(' OR '),
          language: 'id',
          sortBy: 'publishedAt',
          pageSize: 8,
          apiKey: this.newsApiKey
        },
        timeout: 10000
      });

      const travelNews = response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        category: 'travel'
      }));

      this.setCache(cacheKey, travelNews);
      return travelNews;

    } catch (error) {
      console.error('Error fetching travel news:', error.message);
      return this.getFallbackTravelNews();
    }
  }

  /**
   * Fetch trending topics from social media/Google Trends
   */
  async fetchTrendingTopics() {
    const cacheKey = 'trending_topics';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Simulate trending topics (in production, integrate with Google Trends API)
      const trendingTopics = [
        {
          topic: 'Destinasi Wisata Baru 2024',
          category: 'travel',
          engagement: 'high',
          description: 'Tempat-tempat wisata baru yang populer di Indonesia'
        },
        {
          topic: 'Tips Liburan Akhir Tahun',
          category: 'travel',
          engagement: 'medium',
          description: 'Panduan lengkap untuk liburan akhir tahun yang hemat'
        },
        {
          topic: 'Promo Travel Terbaru',
          category: 'travel',
          engagement: 'high',
          description: 'Diskon dan promo terkini untuk perjalanan Anda'
        }
      ];

      this.setCache(cacheKey, trendingTopics);
      return trendingTopics;

    } catch (error) {
      console.error('Error fetching trending topics:', error.message);
      return this.getFallbackTrendingTopics();
    }
  }

  /**
   * Get comprehensive trending data for AI responses
   */
  async getTrendingData() {
    try {
      const [generalNews, travelNews, trendingTopics] = await Promise.all([
        this.fetchIndonesianNews(),
        this.fetchTravelNews(),
        this.fetchTrendingTopics()
      ]);

      return {
        generalNews: generalNews.slice(0, 5), // Top 5 general news
        travelNews: travelNews.slice(0, 5),   // Top 5 travel news
        trendingTopics: trendingTopics.slice(0, 3), // Top 3 trending topics
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting trending data:', error.message);
      return this.getFallbackTrendingData();
    }
  }

  /**
   * Generate contextual response based on trending data
   */
  generateTrendingResponse(userMessage, trendingData) {
    const messageLower = userMessage.toLowerCase();
    let response = '';

    // Check if user is asking about current news/trends
    if (messageLower.includes('berita') || messageLower.includes('news') || 
        messageLower.includes('trending') || messageLower.includes('terkini')) {
      
      response += '📰 **Berita & Topik Terkini:**\n\n';
      
      // Add general news
      if (trendingData.generalNews.length > 0) {
        response += '**Berita Utama:**\n';
        trendingData.generalNews.slice(0, 3).forEach((news, index) => {
          response += `${index + 1}. ${news.title}\n`;
          response += `   📝 ${news.description?.substring(0, 100)}...\n`;
          response += `   📅 Sumber: ${news.source}\n\n`;
        });
      }

      // Add travel news
      if (trendingData.travelNews.length > 0) {
        response += '**Berita Travel:**\n';
        trendingData.travelNews.slice(0, 2).forEach((news, index) => {
          response += `${index + 1}. ${news.title}\n`;
          response += `   📝 ${news.description?.substring(0, 100)}...\n`;
          response += `   📅 Sumber: ${news.source}\n\n`;
        });
      }
    }

    // Add trending topics for travel queries
    if (messageLower.includes('travel') || messageLower.includes('wisata') || 
        messageLower.includes('liburan') || messageLower.includes('destinasi')) {
      
      if (trendingData.trendingTopics.length > 0) {
        response += '🔥 **Sedang Trending di Travel:**\n';
        trendingData.trendingTopics.forEach((topic, index) => {
          response += `• **${topic.topic}**\n`;
          response += `  ${topic.description}\n\n`;
        });
      }
    }

    return response;
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Categorize news
   */
  categorizeNews(text) {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('travel') || textLower.includes('wisata') || 
        textLower.includes('liburan') || textLower.includes('pariwisata')) {
      return 'travel';
    }
    if (textLower.includes('ekonomi') || textLower.includes('bisnis') || 
        textLower.includes('saham')) {
      return 'economy';
    }
    if (textLower.includes('politik') || textLower.includes('pemerintah')) {
      return 'politics';
    }
    if (textLower.includes('olahraga') || textLower.includes('sport')) {
      return 'sports';
    }
    
    return 'general';
  }

  /**
   * Fallback data when API fails
   */
  getFallbackIndonesianNews() {
    return [
      {
        title: "Pariwisata Indonesia Mulai Pulih Pasca Pandemi",
        description: "Sektor pariwisata menunjukkan pemulihan signifikan dengan peningkatan kunjungan wisatawan domestik dan mancanegara.",
        source: "Kemenparekraf",
        category: "travel"
      },
      {
        title: "Destinasi Wisata Baru Banyak Diminati Wisatawan",
        description: "Beberapa destinasi wisata baru di Indonesia mulai populer dan ramai dikunjungi wisatawan.",
        source: "Travel News",
        category: "travel"
      }
    ];
  }

  getFallbackTravelNews() {
    return [
      {
        title: "Promo Liburan Akhir Tahun dari Berbagai Maskapai",
        description: "Maskapai penerbangan menawarkan diskon menarik untuk liburan akhir tahun.",
        source: "Aviation News",
        category: "travel"
      },
      {
        title: "Hotel dan Resort Tawarkan Paket Staycation Menarik",
        description: "Berbagai hotel menawarkan paket staycation dengan harga terjangkau untuk liburan.",
        source: "Hospitality News",
        category: "travel"
      }
    ];
  }

  getFallbackTrendingTopics() {
    return [
      {
        topic: "Wisata Alam Indonesia",
        category: "travel",
        engagement: "high",
        description: "Eksplorasi keindahan alam Indonesia dari Sabang hingga Merauke"
      },
      {
        topic: "Tips Travel Hemat 2024",
        category: "travel", 
        engagement: "medium",
        description: "Panduan lengkap untuk traveling hemat dengan budget terbatas"
      }
    ];
  }

  getFallbackTrendingData() {
    return {
      generalNews: this.getFallbackIndonesianNews(),
      travelNews: this.getFallbackTravelNews(),
      trendingTopics: this.getFallbackTrendingTopics(),
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = NewsTrendingService;
