# Chat System Integration Guide

## Overview
This guide explains how to integrate the two chat pages (ContactChatModal and ChatPage) with the backend database and real-time WebSocket functionality.

## Database Setup

### 1. Run the Enhanced Database Schema
```bash
# Navigate to backend directory
cd be-travello

# Run the enhanced chat database schema
sqlite3 database.db < database-chat-enhanced.sql
```

### 2. Database Tables Created
- `conversations` - Stores conversation metadata between users
- `chat_messages_enhanced` - Enhanced messages with conversation relationships
- `user_online_status` - Tracks user online/offline status
- `typing_indicators` - Manages typing indicators

## Backend Integration

### 1. Install Required Dependencies
```bash
cd be-travello
npm install socket.io jsonwebtoken bcryptjs
```

### 2. Update Server Configuration
Add the enhanced chat routes and WebSocket initialization to your main server file:

```javascript
// In your main server.js or app.js
import { initializeSocket } from './src/services/socket.service.js';
import chatEnhancedRoutes from './src/routes/chat-enhanced.routes.js';

// Use enhanced chat routes
app.use('/api/chat', chatEnhancedRoutes);

// Initialize Socket.IO
const io = initializeSocket(server);
```

### 3. Environment Variables
Add these to your `.env` file:
```env
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

## Frontend Integration

### 1. Install Socket.IO Client
```bash
cd fe-travello
npm install socket.io-client
```

### 2. Update ContactChatModal Usage
Replace the existing ContactChatModal with the enhanced version:

```tsx
import ContactChatModal from './components/shop/ContactChatModalEnhanced';

// In your component
<ContactChatModal
  open={isChatOpen}
  onClose={() => setIsChatOpen(false)}
  adminId="admin-001" // ID of the admin/user to chat with
  currentUserId="user-001" // Current logged-in user ID
/>
```

### 3. Add Full Chat Page
For a complete chat interface, add the ChatPage component:

```tsx
import ChatPage from './components/chat/ChatPage';

// In your routing
<Route path="/chat" element={<ChatPage />} />
```

## API Endpoints

### Enhanced Chat Routes
- `GET /api/chat/conversations` - Get user's conversations
- `GET /api/chat/conversations/:id/messages` - Get conversation messages
- `POST /api/chat/conversations/:id/messages` - Send message
- `PUT /api/chat/conversations/:id/read` - Mark messages as read
- `POST /api/chat/start-conversation` - Start new conversation
- `GET /api/chat/online-users` - Get online users
- `POST /api/chat/typing` - Update typing status

## WebSocket Events

### Client to Server
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_messages_read` - Mark messages as read
- `update_status` - Update user status

### Server to Client
- `new_message` - New message in conversation
- `new_message_notification` - New message notification
- `user_typing` - User typing indicator
- `messages_read` - Messages read notification
- `user_status_changed` - User status change
- `error` - Error message

## Authentication

The chat system requires JWT authentication. Make sure your frontend includes the token in API requests:

```javascript
// The chatApi service automatically includes the token from localStorage
localStorage.setItem('token', 'your-jwt-token');
```

## Testing

### 1. Test Database Connection
```sql
-- Check if tables exist
.tables

-- Check sample data
SELECT * FROM conversations;
SELECT * FROM chat_messages_enhanced;
SELECT * FROM users;
```

### 2. Test API Endpoints
```bash
# Get conversations (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/chat/conversations

# Start new conversation
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"participantId": "admin-001"}' \
     http://localhost:3001/api/chat/start-conversation
```

### 3. Test WebSocket Connection
Open browser console and test:
```javascript
import { chatSocket } from './services/chatSocket';

// Connect to socket
chatSocket.connect('your-jwt-token')
  .then(socket => {
    console.log('Connected!', socket.id);
    
    // Listen for new messages
    socket.on('new_message', (data) => {
      console.log('New message:', data);
    });
  });
```

## Features Implemented

### ✅ Database Schema
- Enhanced conversation management
- Message persistence
- User online status tracking
- Typing indicators

### ✅ Backend API
- RESTful endpoints for chat functionality
- Authentication middleware
- Database integration
- Error handling

### ✅ Frontend Components
- Conversation list with search
- Real-time chat window
- Enhanced contact modal
- API integration service

### ✅ Real-time Features
- WebSocket connection management
- Live message updates
- Typing indicators
- Online status tracking

## Next Steps

1. **Authentication Integration**: Connect with your existing auth system
2. **File Upload**: Add image/file sharing capability
3. **Message Reactions**: Add emoji reactions to messages
4. **Push Notifications**: Implement browser notifications
5. **Message Search**: Add search functionality within conversations
6. **User Settings**: Add chat preferences and settings

## Troubleshooting

### Common Issues

1. **Socket Connection Failed**
   - Check if backend server is running
   - Verify JWT token is valid
   - Check CORS settings

2. **Database Errors**
   - Ensure SQLite database is created
   - Run the schema migration
   - Check file permissions

3. **Authentication Issues**
   - Verify JWT secret matches between frontend and backend
   - Check token expiration
   - Ensure token is stored in localStorage

4. **Messages Not Loading**
   - Check API endpoint URLs
   - Verify database has sample data
   - Check network requests in browser dev tools

## Security Considerations

- JWT tokens should have reasonable expiration times
- Implement rate limiting for message sending
- Sanitize message content to prevent XSS
- Validate file uploads for type and size
- Use HTTPS in production

## Performance Optimization

- Implement message pagination
- Add database indexes for frequently queried fields
- Use connection pooling for database
- Implement caching for user data
- Optimize WebSocket connections
