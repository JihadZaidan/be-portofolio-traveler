# 🤖 Improved Chat API Documentation

## Overview
Chatbot dengan auto-save, context management, dan smart suggestions yang terintegrasi dengan database LowDB.

## ✨ Features

### 🔄 Auto-Save & Context Management
- **Automatic chat saving** ke database untuk setiap pesan
- **Session management** dengan unique session ID
- **Context awareness** menggunakan 10 pesan terakhir
- **Smart history retrieval** dengan pagination

### 🧠 Smart Responses
- **Topic extraction** untuk konteks percakapan
- **Dynamic system instruction** berdasarkan topik
- **Pattern-based suggestions** dari history chat
- **Enhanced error handling** dengan retry logic

### 📊 Analytics & Monitoring
- **Chat statistics** per user
- **Health check** endpoint
- **Response time tracking**
- **Session analytics**

## 🚀 API Endpoints

### 1. Main Chat Endpoint
```http
POST /api/chat
```

**Headers:**
- `Authorization: Bearer <token>` atau cookie `token`

**Body:**
```json
{
  "message": "Halo, bisakah bantu saya?",
  "sessionId": "session_123", // optional
  "history": [] // optional, fallback ke database
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Halo! Saya siap membantu Anda...",
    "timestamp": "2024-01-21T15:30:00.000Z",
    "sessionId": "session_123"
  }
}
```

### 2. Get Chat History
```http
GET /api/chat/history?sessionId=session_123&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "msg_123",
        "role": "user",
        "content": "Halo, bisakah bantu saya?",
        "timestamp": "2024-01-21T15:30:00.000Z",
        "sessionId": "session_123"
      }
    ],
    "sessionId": "session_123",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15
    }
  }
}
```

### 3. Get Smart Suggestions
```http
GET /api/chat/suggestions?sessionId=session_123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "Bisakah kamu menjelaskan lebih detail?",
      "Apa contoh nyata dari ini?",
      "Bagaimana cara menerapkannya?"
    ],
    "sessionId": "session_123"
  }
}
```

### 4. Clear Chat History
```http
DELETE /api/chat/clear?sessionId=session_123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Chat history cleared successfully",
    "sessionId": "session_123",
    "deletedCount": 10
  }
}
```

### 5. Health Check
```http
GET /api/chat/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "Healthy",
    "timestamp": "2024-01-21T15:30:00.000Z"
  }
}
```

### 6. Get Statistics
```http
GET /api/chat/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalChats": 25,
    "totalSessions": 5,
    "averageResponseTime": 850,
    "uptime": 3600
  }
}
```

## 🔧 Configuration

### Environment Variables
```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=500

# Database (LowDB)
DB_PATH=./database.json
```

### System Instructions
Chatbot menggunakan persona profesional dengan:
- **Bahasa:** Indonesia yang baik dan benar
- **Gaya:** Profesional namun ramah
- **Fokus:** Solusi praktis dan berguna
- **Context Awareness:** Mengingat topik yang dibahas

## 🎯 Smart Features

### Auto-Suggestions Logic
1. **Pattern Detection:** Menganalisis 3 pesan terakhir
2. **Topic Matching:** Mengidentifikasi pola pertanyaan
3. **Context-Based:** Menyesuaikan saran dengan topik
4. **Fallback:** Default suggestions jika tidak ada pola

### Context Management
1. **Session Tracking:** Unique ID per sesi chat
2. **History Retrieval:** 10 pesan terakhir untuk konteks
3. **Topic Extraction:** Identifikasi topik dari respons
4. **Dynamic Instructions:** Sistem instruksi adaptif

### Error Handling
1. **Exponential Backoff:** Retry dengan delay bertahap
2. **Rate Limiting:** Penanganan API limit
3. **Timeout Protection:** 30 detik timeout
4. **User-Friendly Messages:** Error yang mudah dipahami

## 📝 Usage Examples

### Basic Chat
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    message: 'Apa itu machine learning?'
  })
});

const data = await response.json();
console.log(data.data.response);
```

### Get History with Pagination
```javascript
const history = await fetch('/api/chat/history?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const data = await history.json();
console.log(data.data.history);
```

### Get Smart Suggestions
```javascript
const suggestions = await fetch('/api/chat/suggestions', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const data = await suggestions.json();
console.log(data.data.suggestions);
```

## 🛠️ Development

### File Structure
```
src/
├── controllers/
│   └── improved-chat.controller.ts  # Main chat logic
├── services/
│   └── gemini.service.ts          # Gemini AI integration
├── models/
│   ├── User.model.ts               # User model
│   └── ChatMessage.model.ts       # Chat message model
└── routes/
    └── improved-chat.routes.ts     # API routes
```

### Database Schema (LowDB)
```json
{
  "users": [
    {
      "id": "user_123",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-21T15:30:00.000Z"
    }
  ],
  "chatMessages": [
    {
      "id": "msg_123",
      "sessionId": "session_123",
      "userId": "user_123",
      "message": "Halo!",
      "response": "Halo! Ada yang bisa saya bantu?",
      "role": "user",
      "timestamp": "2024-01-21T15:30:00.000Z"
    }
  ]
}
```

## 🚨 Error Codes

| Status Code | Description | Solution |
|-------------|-------------|-----------|
| 400 | Bad Request | Validasi input pesan |
| 401 | Unauthorized | Login kembali |
| 429 | Rate Limit | Tunggu beberapa saat |
| 500 | Server Error | Coba lagi nanti |
| 503 | Service Unavailable | Gemini API down |

## 🔄 Auto-Features

### Auto-Save
- Setiap pesan user dan AI response otomatis tersimpan
- Session ID auto-generate jika tidak ada
- Timestamp otomatis untuk setiap pesan

### Auto-Context
- 10 pesan terakhir digunakan untuk konteks
- Topic extraction untuk konteks berkelanjutan
- Dynamic system instruction berdasarkan topik

### Auto-Suggestions
- Pattern detection dari 3 pesan terakhir
- Context-aware suggestions
- Fallback ke default suggestions

---

## 🎉 Ready to Use!

Chatbot Anda sekarang memiliki:
✅ Auto-save ke database  
✅ Context management  
✅ Smart suggestions  
✅ Error handling  
✅ Analytics  
✅ Health monitoring  

**Start server:** `npm start`  
**Test API:** `http://localhost:5000/api/chat/health`
