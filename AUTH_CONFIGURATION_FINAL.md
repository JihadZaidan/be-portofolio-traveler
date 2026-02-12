# 🚀 Travello Auth Configuration - Persistent Setup

## ✅ Konfigurasi Saat Ini (TIDAK PERLU DIUBAH)

### 1. Backend Configuration
- **Server:** `server-minimal.js` (port 5000)
- **Database:** phpMyAdmin `travello_db`
- **Auth Routes:** `/api/auth/login`, `/api/auth/register`
- **Admin Routes:** `/api/admin/users`

### 2. Frontend Configuration
- **Manual Auth:** LocalStorage + Database
- **OAuth (Google):** Database only
- **Redirect:** `/admin/users` setelah auth success

### 3. Database Connection
```javascript
// File: be-travello/src/config/database.config.js
// Database: travello_db (phpMyAdmin)
// Table: users
```

## 🔧 Cara Menjalankan Ulang Setelah Shutdown

### Step 1: Start Laragon Services
```bash
# Buka Laragon Control Panel
# Start Apache dan MySQL
# Buka: http://localhost/phpmyadmin
```

### Step 2: Start Backend Server
```bash
cd be-travello
node server-minimal.js
# Server berjalan di http://localhost:5000
```

### Step 3: Start Frontend
```bash
cd fe-travello
npm run dev
# Frontend berjalan di http://localhost:5173
```

## 📋 Verifikasi Setup

### 1. Test Backend Health
```bash
curl http://localhost:5000/health
# Response: {"status":"OK","timestamp":"..."}
```

### 2. Test Auth Endpoint
```bash
# Test Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","displayName":"Test User","password":"password123"}'

# Test Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Test Admin Users
```bash
curl http://localhost:5000/api/admin/users
# Response: List of users from database
```

## 🗄️ Database Schema (TIDAK BERUBAH)

### Table: users
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  display_name VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  is_email_verified BOOLEAN DEFAULT FALSE,
  last_login DATETIME,
  created_at DATETIME,
  updated_at DATETIME
);
```

## 🔄 Flow Authentication (TETAP SAMA)

### Manual Signup/Login
1. User input form → Frontend validation
2. `completeAuth()` → API call to backend
3. Backend → Save to phpMyAdmin users table
4. Response → Update localStorage
5. Redirect → `/admin/users`

### OAuth (Google)
1. Click Google → Redirect to OAuth
2. Google callback → Backend processing
3. Backend → Save to phpMyAdmin users table
4. Response → Update localStorage
5. Redirect → `/admin/users`

## 📁 File-File Kunci (JANGAN DIUBAH)

### Backend
- `be-travello/server-minimal.js` - Main server
- `be-travello/src/routes/auth.routes.js` - Auth endpoints
- `be-travello/src/routes/admin.routes.js` - Admin endpoints
- `be-travello/src/controllers/auth.controller.js` - Auth logic
- `be-travello/src/models/User.model.js` - User model

### Frontend
- `fe-travello/src/components/auth/AuthModal.tsx` - Auth form
- `fe-travello/src/pages/admin/userlist/AdminUserListPage.tsx` - User management

### Environment
- `be-travello/.env` - Database config
- `be-travello/env.local` - Local environment

## 🚨 Quick Recovery Commands

### Jika Backend Error
```bash
cd be-travello
npm install
node server-minimal.js
```

### Jika Frontend Error
```bash
cd fe-travello
npm install
npm run dev
```

### Jika Database Error
```bash
# Buka phpMyAdmin: http://localhost/phpmyadmin
# Select database: travello_db
# Check table: users
```

## ✅ Test Checklist Setiap Restart

1. ✅ XAMPP Apache & MySQL running
2. ✅ Backend server running (port 5000)
3. ✅ Frontend running (port 5173)
4. ✅ Database `travello_db` accessible
5. ✅ Test signup/login manual
6. ✅ Test admin users page
7. ✅ Verify data di phpMyAdmin

## 🎯 Konfigurasi Final

**Port Configuration:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- phpMyAdmin: http://localhost/phpmyadmin

**Authentication Flow:**
- Manual: LocalStorage + Database
- OAuth: Database only
- Admin: Database management

**Data Persistence:**
- User data: phpMyAdmin `travello_db.users`
- Session: LocalStorage
- Auth tokens: LocalStorage

---
**🔒 KONFIGURASI INI SUDAH FINAL DAN TIDAK PERLU DIUBAH LAGI!**
