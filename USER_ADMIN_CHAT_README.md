# 🗨️ User-Admin Chat System

Sistem chat real-time 2 arah antara User dan Admin dengan integrasi database yang lengkap.

## 🚀 Fitur Utama

- **Real-time Communication** - Chat langsung antara User dan Admin
- **Database Integration** - Semua pesan tersimpan di database
- **Online Status** - Lihat status online/offline user
- **Typing Indicators** - Tahu jika lawan bicara sedang mengetik
- **Read Receipts** - Konfirmasi pesan telah dibaca
- **File Attachments** - Support kirim gambar dan file
- **Unread Count** - Hitungan pesan belum dibaca
- **Role-based Access** - Akses terbatas untuk admin
- **Responsive UI** - Tampilan yang baik di desktop dan mobile

## 📁 Struktur File

### Backend (be-travello)
```
src/
├── controllers/
│   └── socket-chat.controller.js      # Socket.IO event handlers
├── models/
│   └── UserAdminChatMessage.model.js  # Database model
├── app.js                             # Main server file
└── server.js                          # Server initialization

database/
└── user-admin-chat-schema.sql         # Database schema

test-user-admin-chat.html              # Testing page
setup-user-admin-chat.bat              # Setup script
```

### Frontend (fe-travello)
```
src/
├── components/
│   ├── Auth/
│   │   └── AuthContext.tsx            # Authentication context
│   └── UserAdminChat/
│       ├── UserChatInterface.tsx      # User chat UI
│       └── AdminChatInterface.tsx     # Admin chat UI
├── pages/
│   ├── UserChatPage.tsx               # User chat page
│   └── AdminChatPage.tsx              # Admin chat page
└── App.tsx                            # Main app with AuthProvider
```

## 🛠️ Setup Instructions

### 1. Database Setup
```bash
# Import database schema
mysql -u root -p < database/user-admin-chat-schema.sql
```

### 2. Backend Setup
```bash
cd be-travello

# Install dependencies
npm install socket.io uuid

# Start server
node src/server.js
```

### 3. Frontend Setup
```bash
cd fe-travello

# Install dependencies (socket.io-client already included)
npm install

# Start development server
npm run dev
```

### 4. Quick Setup (Windows)
```bash
# Run the setup script
setup-user-admin-chat.bat
```

## 🔗 Akses URLs

### Frontend URLs
- **User Chat**: http://localhost:5173/chat
- **Admin Chat**: http://localhost:5173/admin/chat-new
- **Test Page**: http://localhost:3000/test-user-admin-chat.html

### Backend API
- **Server**: http://localhost:3000
- **Socket.IO**: ws://localhost:3000

## 👤 User Roles

### Regular User
- Email: `john@example.com` (atau email apa saja)
- Password: `user123`
- Role: `user`
- Akses: `/chat`

### Admin User
- Email: `admin@travello.com`
- Password: `admin123`
- Role: `admin`
- Akses: `/admin/chat-new`

## 💬 Cara Penggunaan

### Untuk User
1. Login ke sistem (gunakan email apa saja)
2. Akses halaman `/chat`
3. Mulai chatting dengan admin
4. Lihat status online admin
5. Kirim pesan dan file

### Untuk Admin
1. Login sebagai admin (`admin@travello.com`)
2. Akses halaman `/admin/chat-new`
3. Lihat daftar user yang online
4. Pilih user untuk memulai chat
5. Balas pesan dari user

## 🔧 Konfigurasi

### Environment Variables (Backend)
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
```

### Socket.IO Events
```javascript
// Client to Server
'join_chat'           // Join chat room
'send_message'        // Send message
'mark_read'           // Mark messages as read
'typing_start'        // Start typing
'typing_stop'         // Stop typing
'get_chat_history'    // Get chat history
'join_user_room'      // Admin join user room

// Server to Client
'chat_history'        // Chat history data
'receive_message'     // New message
'message_sent'        // Message confirmation
'user_typing'         // Typing indicator
'unread_count'        // Unread messages count
'online_users'        // Online users list
'user_update'         // User status update
'user_left'           // User disconnected
```

## 🗄️ Database Schema

### Tables
1. **user_admin_chat_messages** - Chat messages
2. **user_online_status** - Online status tracking
3. **typing_indicators** - Typing indicators
4. **conversation_rooms** - Conversation metadata

### Key Features
- Auto-increment timestamps
- Foreign key relationships
- Indexes for performance
- Triggers for automatic updates
- Views for easy data access

## 🧪 Testing

### Test Page Features
- Switch between User/Admin roles
- Real-time chat testing
- Connection status monitoring
- Message history loading
- Typing indicators

### Manual Testing
1. Buka 2 browser tab
2. Tab 1: Login sebagai User
3. Tab 2: Login sebagai Admin
4. Test chat functionality

## 🐛 Troubleshooting

### Common Issues

#### 1. "useAuth import error"
**Solution**: Pastikan `AuthContext.tsx` ada di `src/components/Auth/`

#### 2. "Socket connection failed"
**Solution**: 
- Check backend server running on port 3000
- Verify CORS configuration
- Check firewall settings

#### 3. "Database connection error"
**Solution**:
- Verify MySQL service running
- Check database credentials
- Ensure schema imported correctly

#### 4. "Messages not saving"
**Solution**:
- Check database connection
- Verify table exists
- Check Sequelize model sync

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'socket.io-client:*');
```

## 🔄 Flow Diagram

```
User (Frontend)          Backend (Socket.IO)          Admin (Frontend)
     |                           |                           |
     |-- join_chat ------------>|                           |
     |                           |-- join_chat ------------>|
     |                           |                           |
     |-- send_message -------->|                           |
     |                           |-- receive_message ----->|
     |                           |<-- send_message --------|
     |<-- receive_message ------|                           |
```

## 🚀 Production Deployment

### Backend
```bash
# Set production environment
NODE_ENV=production

# Use PM2 for process management
pm2 start src/server.js --name "travello-chat"
```

### Frontend
```bash
# Build for production
npm run build

# Deploy to web server
# Configure reverse proxy for Socket.IO
```

### Nginx Configuration
```nginx
location /socket.io/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## 📝 Notes

- Socket.IO menggunakan WebSocket dengan fallback ke polling
- Messages disimpan di database untuk persistence
- Auto-reconnect ketika connection terputus
- Support multiple admin users
- Typing indicators otomatis hilang setelah 3 detik
- Unread count update real-time

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

Jika ada masalah:
1. Check console logs
2. Verify server status
3. Check database connection
4. Review error messages

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-02-10
