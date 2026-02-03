# Admin Chat Setup Guide

## Overview
This guide explains how to set up the admin chat functionality so that admin users can chat with customers and see all user conversations in their contact list.

## Features Implemented

### ✅ Admin Chat Interface
- **AdminChatPage** - Dedicated chat interface for admin users
- **Conversation List** - Shows all user conversations with unread counts
- **Real-time Messaging** - Live chat with customers
- **Online Users** - Shows currently active users
- **Search Functionality** - Find conversations by username or message content

### ✅ Admin Features
- **Admin Authentication** - Automatic admin role assignment
- **Contact Management** - All user conversations appear in admin's contact list
- **Message History** - Complete conversation history with pagination
- **Read Receipts** - Track when messages are read
- **Typing Indicators** - See when users are typing

## Setup Instructions

### 1. Database Setup
```bash
cd be-travello
sqlite3 database.db < database-chat-enhanced.sql
```

### 2. Backend Configuration
Add to your main server file:
```javascript
import { initializeSocket } from './src/services/socket.service.js';
import chatEnhancedRoutes from './src/routes/chat-enhanced.routes.js';

// Use enhanced chat routes
app.use('/api/chat', chatEnhancedRoutes);

// Initialize Socket.IO for real-time features
const io = initializeSocket(server);
```

### 3. Frontend Setup
Install required dependencies:
```bash
cd fe-travello
npm install socket.io-client
```

### 4. Add Admin Dashboard Route
Add to your routing configuration:
```tsx
import AdminDashboard from './pages/AdminDashboard';

// In your router
<Route path="/admin" element={<AdminDashboard />} />
```

### 5. Update Environment Variables
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

## How It Works

### Admin Authentication
- Admin ID is set to `'admin-001'` by default
- Admin role is stored in localStorage
- All API calls use admin credentials

### Contact List Population
1. **User Initiates Chat**: When a user starts a conversation, it's automatically added to admin's contact list
2. **Admin View**: Admin sees all conversations in "Recent Messages"
3. **Unread Counts**: Shows number of unread messages per conversation
4. **Online Status**: Displays which users are currently online

### Message Flow
1. **User sends message** → Creates conversation if it doesn't exist
2. **Message stored in database** → Appears in both user and admin chat
3. **Real-time update** → WebSocket pushes message to admin if online
4. **Admin responds** → Message delivered to user in real-time

## Sample Data

The system includes sample conversations that match your images:
- **Faris Meika Adz-daky** - "Halo kak, saya mau tanya tentang paket liburan di Bali."
- **M Rasya Zildan** - "Yang 3 hari 2 malam kak, yang ada Ubud dan Nusa Penida."
- **Fawwaz** - "Terima kasih atas informasinya!"
- **Revina Okta** - "Apakah ada paket untuk keluarga?"

## Admin Interface Features

### Conversation List (Left Panel)
- **Recent Messages** header with unread count badge
- **Search bar** to find conversations
- **User avatars** and display names
- **Last message preview** with timestamps
- **Unread message indicators**
- **Online users section** for starting new conversations

### Chat Window (Right Panel)
- **User info header** with avatar and online status
- **Message history** with date separators
- **Real-time typing indicators**
- **Message input** with send button
- **Read receipts** (✓✓ for read, ✓ for sent)

## API Endpoints for Admin

### Get All Conversations
```bash
GET /api/chat/conversations
Authorization: Bearer <admin-token>
```

### Get Messages in Conversation
```bash
GET /api/chat/conversations/:id/messages
Authorization: Bearer <admin-token>
```

### Send Message
```bash
POST /api/chat/conversations/:id/messages
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "message": "Halo, selamat siang! Untuk paket Bali yang mana ya kak?"
}
```

### Get Online Users
```bash
GET /api/chat/online-users
Authorization: Bearer <admin-token>
```

## WebSocket Events

### Admin Listens For:
- `new_message` - New message from users
- `user_typing` - User is typing indicator
- `messages_read` - User read admin's messages
- `user_status_changed` - User online/offline status

### Admin Emits:
- `join_conversation` - Join conversation room
- `typing_start/stop` - Admin typing indicators
- `mark_messages_read` - Mark messages as read

## Testing the Admin Chat

### 1. Access Admin Dashboard
Navigate to: `http://localhost:5173/admin`

### 2. Verify Sample Data
You should see:
- 4 sample conversations in the contact list
- Unread message counts (2 for Faris, 1 for Revina)
- Message previews matching your images

### 3. Test Chat Functionality
1. Click on "M Rasya Zildan" conversation
2. See the chat history with admin responses
3. Type a new message and send it
4. Verify message appears in chat window

### 4. Test Real-time Features
- Open two browser windows (one as user, one as admin)
- Send messages between them
- Verify real-time updates

## Customization

### Change Admin ID
```tsx
<AdminChatPage adminId="your-admin-id" />
```

### Update Admin Profile
```tsx
// In AdminDashboard.tsx
<img
  src="/your-admin-avatar.jpg"
  alt="Admin Name"
  className="h-full w-full object-cover"
/>
```

### Customize Sample Data
Edit the sample conversations in `AdminChatPage.tsx`:
```tsx
setConversations([
  {
    id: 'conv-001',
    other_username: 'user-001',
    other_display_name: 'Custom User Name',
    // ... other properties
  }
]);
```

## Troubleshooting

### Admin Not Seeing Conversations
1. Check admin ID is set correctly
2. Verify database has conversation data
3. Check API authentication
4. Verify localStorage has admin credentials

### Messages Not Sending
1. Check backend server is running
2. Verify WebSocket connection
3. Check API endpoints are accessible
4. Verify JWT token is valid

### Real-time Updates Not Working
1. Check Socket.IO server is initialized
2. Verify WebSocket connection in browser
3. Check CORS settings
4. Verify client and server Socket.IO versions

## Security Considerations

- Admin authentication should use secure JWT tokens
- Implement rate limiting for message sending
- Sanitize message content to prevent XSS
- Log admin actions for audit trail
- Use HTTPS in production

## Next Steps

1. **User Management**: Add user profile viewing
2. **Message Templates**: Add quick response templates
3. **File Sharing**: Enable image/file uploads
4. **Analytics**: Add chat statistics and reports
5. **Notifications**: Implement desktop notifications
6. **Multi-admin Support**: Enable multiple admin users

The admin chat system is now fully functional and ready for use!
