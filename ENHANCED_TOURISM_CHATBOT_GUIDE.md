# Enhanced Tourism AI Chatbot Setup Guide

## Overview
AI Chatbot dengan database pariwisata lengkap Indonesia yang memberikan respons berbasis data real-time.

## 🗄️ Database Setup

### 1. Import Database Schema
```bash
# Masuk ke phpMyAdmin
# Buat database baru: travello_db
# Import file SQL berikut:

# 1. Schema lengkap
mysql -u root -p travello_db < database/tourism-database-complete.sql

# 2. Sample data
mysql -u root -p travello_db < database/tourism-sample-data.sql
```

### 2. Database Tables
- **destinations** - Data destinasi wisata Indonesia
- **accommodations** - Hotel, villa, resort, hostel
- **restaurants** - Restoran dan kuliner khas
- **transportation** - Info transportasi antar kota
- **tour_packages** - Paket wisata lengkap
- **travel_tips** - Tips perjalanan
- **weather_info** - Info cuaca per bulan
- **events_festivals** - Event dan festival lokal
- **emergency_contacts** - Kontak darurat
- **chatbot_knowledge** - Knowledge base AI

## 🚀 Backend Setup

### 1. Environment Configuration
```bash
# .env file
MYSQL_DATABASE=travello_db
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
```

### 2. Install Dependencies
```bash
npm install sequelize mysql2
```

### 3. Add Routes to Main App
```typescript
// app.ts
import enhancedTourismChatRoutes from './routes/enhanced-tourism-chat.routes.js';

app.use('/api/tourism-chat', enhancedTourismChatRoutes);
```

## 🤖 AI Chatbot Features

### Smart Search Capabilities
- **Full-text search** dengan relevance scoring
- **Location-based recommendations**
- **Budget-aware filtering**
- **Category-specific searches**

### Response Types
1. **Destinations** - Info wisata dengan rating, harga, fasilitas
2. **Accommodations** - Hotel dengan filter harga dan fasilitas
3. **Restaurants** - Kuliner dengan info halal dan harga
4. **Transportation** - Rute dan harga transportasi
5. **Travel Tips** - Tips berdasarkan kategori dan audience
6. **Weather Info** - Cuaca terbaik untuk berkunjung

### Natural Language Processing
- **Keyword extraction** untuk lokasi, budget, kategori
- **Contextual understanding** berdasarkan history chat
- **Smart suggestions** berdasarkan respons sebelumnya
- **Multi-language support** (Bahasa Indonesia)

## 📱 Frontend Integration

### API Endpoints
```typescript
// Chat endpoint
POST /api/tourism-chat/chat
{
  "message": "Wisata pantai di Bali",
  "sessionId": "session_123"
}

// Response
{
  "success": true,
  "data": {
    "response": "🏝️ **Destinasi Wisata Ditemukan:**\n\n1. **Pantai Kuta**...",
    "timestamp": "2024-01-01T12:00:00Z",
    "sessionId": "session_123",
    "suggestions": ["Hotel murah di Bali", "Transportasi di Bali"]
  }
}
```

### React Component Integration
```typescript
// Enhanced chat component
import { useState } from 'react';
import axios from 'axios';

const TourismChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    try {
      const response = await axios.post('/api/tourism-chat/chat', {
        message: input,
        sessionId: 'user_session'
      });
      
      setMessages(prev => [
        ...prev,
        { role: 'user', content: input },
        { role: 'ai', content: response.data.data.response }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  return (
    <div className="chat-container">
      {/* Chat messages */}
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya tentang wisata Indonesia..."
        />
        <button onClick={sendMessage}>Kirim</button>
      </div>
    </div>
  );
};
```

## 🧪 Testing

### 1. Health Check
```bash
curl http://localhost:3000/api/tourism-chat/health
```

### 2. Sample Queries
```bash
# Destinations
curl -X POST http://localhost:3000/api/tourism-chat/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Wisata pantai di Bali"}'

# Accommodations
curl -X POST http://localhost:3000/api/tourism-chat/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hotel murah di Yogyakarta budget 500ribu"}'

# Restaurants
curl -X POST http://localhost:3000/api/tourism-chat/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Restoran halal di Jakarta"}'

# Transportation
curl -X POST http://localhost:3000/api/tourism-chat/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Transportasi dari Jakarta ke Surabaya"}'

# Travel Tips
curl -X POST http://localhost:3000/api/tourism-chat/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Tips backpacker Indonesia"}'
```

## 📊 Sample Responses

### Destination Query
**Input:** "Wisata di Bali"

**Response:**
```
🏝️ **Destinasi Wisata Ditemukan:**

1. **Pantai Kuta** (Badung, Bali)
   📍 Pantai paling terkenal di Bali dengan pasir putih...
   ⭐ Rating: 4.2/5 | 💰 Tiket: Rp 0
   🕐 Best time: April - Oktober | ⏱️ Durasi: 2-3 jam
   🏗️ Fasilitas: parkir, restoran, toilet

2. **Tanah Lot** (Tabanan, Bali)
   📍 Pura laut di atas batu karang dengan sunset ikonik...
   ⭐ Rating: 4.6/5 | 💰 Tiket: Rp 60,000
   🕐 Best time: April - Oktober | ⏱️ Durasi: 2-3 jam
   🏗️ Fasilitas: parkir, restoran, souvenir shop

💬 *Ada pertanyaan lain tentang destinasi ini? Tanya saja detailnya!*
```

### Accommodation Query
**Input:** "Hotel murah di Yogyakarta"

**Response:**
```
🏨 **Penginapan Ditemukan:**

1. **Malioboro Palace Hotel** (hotel, 3⭐)
   📍 Yogyakarta, DIY
   💰 Rp 350,000/malam | ⭐ Rating: 4.0/5
   🏗️ Fasilitas: Sarapan, WiFi

2. **Hotel Santika Borobudur** (hotel, 4⭐)
   📍 Magelang, Jawa Tengah
   💰 Rp 850,000/malam | ⭐ Rating: 4.3/5
   🏗️ Fasilitas: Sarapan, WiFi, Parkir, Kolam Renang

💬 *Ada pertanyaan lain tentang penginapan ini?*
```

## 🔧 Customization

### Adding New Data
```sql
-- Add new destination
INSERT INTO destinations (name, description, category, province, city, rating, ticket_price_adult)
VALUES ('Nama Destinasi', 'Deskripsi', 'beach', 'Bali', 'Denpasar', 4.5, 50000);

-- Add new accommodation
INSERT INTO accommodations (name, type, province, city, price_per_night, rating)
VALUES ('Nama Hotel', 'hotel', 'Bali', 'Denpasar', 750000, 4.2);
```

### Custom Responses
```sql
-- Add chatbot knowledge
INSERT INTO chatbot_knowledge (question, answer, category, keywords, priority_level)
VALUES ('Pertanyaan kustom', 'Jawaban kustom', 'custom', 
        JSON_ARRAY('keyword1', 'keyword2'), 'high');
```

## 🚀 Performance Optimization

### Database Indexes
- Full-text search indexes untuk name, description
- Location indexes untuk latitude/longitude
- Category indexes untuk filtering cepat

### Caching Strategy
- Redis untuk cache popular destinations
- Session-based caching untuk user preferences
- API response caching untuk common queries

### Monitoring
- Query performance tracking
- User interaction analytics
- Error logging and alerting

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check MySQL service status
   - Verify .env configuration
   - Test with phpMyAdmin

2. **Empty Search Results**
   - Check if data is imported
   - Verify table indexes
   - Test SQL queries manually

3. **Slow Response Time**
   - Add missing indexes
   - Optimize SQL queries
   - Implement caching

## 📈 Analytics

### Track User Interactions
- Popular destinations
- Common queries
- User satisfaction
- Conversion rates

### Database Analytics
- Most searched locations
- Price range preferences
- Seasonal trends
- Geographic distribution

---

## 🎯 Next Steps

1. **Deploy to production**
2. **Add more sample data**
3. **Implement user preferences**
4. **Add image recognition**
5. **Integrate booking systems**
6. **Add multi-language support**
7. **Implement voice chat**
8. **Add AR/VR features**

---

🌏 **Selamat mengembangkan AI Chatbot Pariwisata Indonesia!**
