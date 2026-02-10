# AI Chatbot Database Setup Guide

## Overview

AI Chatbot menggunakan database terpisah dari database utama TRAVELLO untuk menyimpan data percakapan, sesi, analitik, dan knowledge base khusus untuk AI.

## Database Structure

### Tables Created

1. **ai_chat_sessions** - Menyimpan sesi chat pengguna
2. **ai_chat_messages** - Menyimpan semua pesan antara user dan AI
3. **ai_suggestions** - Menyimpan saran kontekstual untuk pengguna
4. **ai_knowledge_base** - Menyimpan knowledge base untuk respons AI
5. **ai_analytics** - Menyimpan data analitik performa AI
6. **ai_feedback** - Menyimpan feedback pengguna pada respons AI
7. **ai_training_data** - Menyimpan data training untuk improvement AI

### Views Created

1. **active_sessions_summary** - Ringkasan sesi aktif dengan hitungan pesan
2. **daily_analytics_summary** - Ringkasan analitik harian

## Setup Methods

### Method 1: Using Safe Setup Script (Recommended)

#### Windows (Batch)
```bash
cd database
setup_ai_chatbot_safe.bat
```

#### Linux/Mac (Shell)
```bash
cd database
chmod +x setup_ai_chatbot_safe.sh
./setup_ai_chatbot_safe.sh
```

### Method 2: Manual SQL Import

1. Buka phpMyAdmin atau MySQL client
2. Import file `setup_ai_chatbot_safe.sql`
3. Pastikan database `ai_chatbot_db` terbuat dengan benar

### Method 3: Using Original SQL Script

1. Import file `ai_chatbot_database.sql`
2. Script ini akan error jika table sudah ada
3. Gunakan hanya untuk fresh installation

## Configuration

### Environment Variables

Tambahkan ke `.env` file:

```env
# AI Chatbot Database Configuration
AI_MYSQL_HOST=localhost
AI_MYSQL_PORT=3306
AI_MYSQL_DATABASE=ai_chatbot_db
AI_MYSQL_USER=root
AI_MYSQL_PASSWORD=
AI_MYSQL_DIALECT=mysql
AI_MYSQL_LOGGING=false
```

### Database Configuration

Konfigurasi sudah ditambahkan ke `src/config/database.js`:

```javascript
aiChatbot: {
  host: process.env.AI_MYSQL_HOST || 'localhost',
  port: process.env.AI_MYSQL_PORT || 3306,
  database: process.env.AI_MYSQL_DATABASE || 'ai_chatbot_db',
  user: process.env.AI_MYSQL_USER || 'root',
  password: process.env.AI_MYSQL_PASSWORD || '',
  dialect: process.env.AI_MYSQL_DIALECT || 'mysql',
  logging: process.env.AI_MYSQL_LOGGING === 'true' || false
}
```

## Features

### Knowledge Base System

- **Auto-categorization**: Pesan user dikategorikan otomatis (copywriter, travel, general)
- **Priority-based responses**: Respon dengan priority lebih tinggi akan dipilih
- **Usage tracking**: Setiap knowledge base entry melacak penggunaan
- **Success rating**: Sistem rating untuk improvement

### Analytics & Monitoring

- **Real-time analytics**: Tracking events saat terjadi
- **Performance metrics**: Processing time, token usage, model version
- **User behavior**: Track suggestions clicked, session duration
- **Error tracking**: Automatic error logging untuk debugging

### Training Data Collection

- **Conversation logging**: Semua percakapan disimpan untuk training
- **Feedback integration**: User feedback dapat digunakan untuk improvement
- **Intent detection**: Automatic intent classification
- **Confidence scoring**: AI confidence level untuk setiap respons

## Sample Data

Database includes sample data untuk testing:

### Knowledge Base Entries

1. **Copywriter Services**: Informasi lengkap jasa copywriter
2. **Copywriter Pricing**: Paket harga dan detail
3. **Copywriter Process**: Workflow pengerjaan
4. **Travel Destinations**: Destinasi wisata populer
5. **Travel Packages**: Paket wisata lengkap
6. **Travel Tips**: Tips traveling hemat

### Sample Session

- **Session ID**: `test_session_001`
- **User**: Demo User
- **Messages**: 4 sample messages dengan respons AI
- **Suggestions**: 4 sample suggestions

## API Integration

### Endpoints Using AI Database

1. **POST /api/ai-chatbot/chat** - Main chat endpoint
2. **GET /api/ai-chatbot/history** - Get chat history
3. **GET /api/ai-chatbot/suggestions** - Get contextual suggestions
4. **GET /api/ai-chatbot/health** - Health check
5. **DELETE /api/ai-chatbot/clear** - Clear chat history

### Model Integration

Models yang menggunakan AI database:

- **AIChatSession** - Session management
- **AIChatMessage** - Message storage
- **AISuggestion** - Suggestion management
- **AIKnowledgeBase** - Knowledge base
- **AIAnalytics** - Analytics tracking
- **AIFeedback** - User feedback
- **AITrainingData** - Training data

## Performance Optimization

### Indexes

- **Composite indexes** untuk query yang sering digunakan
- **Foreign key indexes** untuk join operations
- **Timestamp indexes** untuk time-based queries

### Views

- **Pre-computed aggregations** untuk analytics queries
- **Session summaries** untuk admin dashboard
- **Daily summaries** untuk reporting

## Troubleshooting

### Common Issues

1. **Table already exists**: Gunakan safe setup script
2. **Connection failed**: Check database credentials
3. **Permission denied**: Verify MySQL user permissions
4. **Missing tables**: Run setup script lagi

### Debug Mode

Enable logging dengan environment variable:

```env
AI_MYSQL_LOGGING=true
```

### Health Check

Test database connection:

```bash
curl http://localhost:5000/api/ai-chatbot/health
```

## Migration

### From Old Chat System

1. Export existing chat data
2. Transform data format
3. Import ke AI chatbot tables
4. Update application configuration

### Backup Strategy

1. **Regular backups**: Schedule daily backups
2. **Incremental backups**: Backup only changes
3. **Point-in-time recovery**: Use binary logs
4. **Cross-region replication**: For high availability

## Security

### Data Protection

1. **Encryption**: Sensitive data encryption
2. **Access control**: User-based permissions
3. **Audit logging**: All access logged
4. **Data retention**: Automatic cleanup policies

### Privacy Compliance

1. **GDPR compliance**: User data management
2. **Data anonymization**: Remove personal identifiers
3. **Consent management**: Explicit user consent
4. **Right to deletion**: Complete data removal

## Monitoring

### Key Metrics

1. **Response time**: Average AI response time
2. **Success rate**: Percentage of successful responses
3. **User satisfaction**: Feedback ratings
4. **Knowledge base usage**: Most used entries
5. **Session duration**: Average chat session length

### Alerts

1. **Database connection issues**
2. **High error rates**
3. **Slow response times**
4. **Knowledge base gaps**

## Future Enhancements

### Planned Features

1. **Multi-language support**: International knowledge base
2. **Machine learning**: Automatic knowledge base improvement
3. **Voice integration**: Speech-to-text and text-to-speech
4. **Image recognition**: Visual content understanding
5. **Sentiment analysis**: User emotion detection

### Scalability

1. **Horizontal scaling**: Multiple database instances
2. **Read replicas**: Dedicated read servers
3. **Caching layer**: Redis/Memcached integration
4. **Load balancing**: Connection distribution

## Support

### Documentation

- **API Documentation**: `/api-docs`
- **Database Schema**: `ai_chatbot_database.sql`
- **Setup Guide**: This document

### Contact

For issues and support:
- Check application logs
- Review database error logs
- Test with sample data
- Contact development team

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Compatible**: TRAVELLO v2.0+
