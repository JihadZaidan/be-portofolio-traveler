# 🗄️ TRAVELLO Complete Database Setup Guide

## 🎯 Objective
Membuat sistem database lengkap untuk TRAVELLO dengan:
- ✅ Login & Registration untuk semua orang
- ✅ Google OAuth integration
- ✅ SQLite database dengan DBeaver
- ✅ Auto-chat knowledge base
- ✅ Production-ready setup

## 🚀 Quick Start (Sudah Siap!)

### 1. System yang Sudah Berjalan
```bash
# Backend dengan JSON Database (LowDB)
✅ npm start → http://localhost:5000

# Frontend Modern dengan React
✅ cd fe-travello && npm run dev → http://localhost:5173/login

# Authentication untuk SEMUA ORANG sudah berjalan:
✅ Email validation
✅ Password hashing (bcrypt)
✅ Case-insensitive email
✅ Auto-verification
✅ Google OAuth ready
```

### 2. Test Login & Registration
Buka: http://localhost:5173/login

**Test Accounts:**
- Email: `user@travello.com` | Password: `password123`
- Email: `admin@travello.com` | Password: `admin123`

**Atau daftar akun baru:**
- Semua orang bisa daftar
- Email valid (auto-verified)
- Password minimal 6 karakter
- Username unik

## 🐬 DBeaver SQLite Setup

### Step 1: Install SQLite CLI
```bash
# Download SQLite Tools
# https://sqlite.org/download.html

# Atau gunakan batch file
cd database
create-database.bat
```

### Step 2: Create Database
```bash
# Di folder be-travello/database
sqlite3 travello.db < ../database-setup.sql
```

### Step 3: Connect DBeaver
1. **Open DBeaver**
2. **File → New → Database Connection**
3. **Select SQLite**
4. **Settings:**
   ```
   Connection Name: TRAVELLO_DB
   Path: C:/Users/ACER/workandshop/be-travello/database/travello.db
   ```
5. **Test Connection** → **Finish**

## 📊 Database Structure

### Tables Overview
```
📁 users              - User data & authentication
📁 chat_messages       - Chat history & AI responses  
📁 user_sessions       - JWT session management
📁 travel_knowledge    - Auto-chat knowledge base
```

### Users Table Detail
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,                    -- UUID v4
    username TEXT NOT NULL UNIQUE,            -- Username unik
    email TEXT NOT NULL UNIQUE,               -- Email (case-insensitive)
    password TEXT,                           -- Hashed password (bcrypt)
    google_id TEXT UNIQUE,                    -- Google OAuth ID
    display_name TEXT,                        -- Nama tampilan
    role TEXT DEFAULT 'user',                 -- 'user' | 'admin'
    is_email_verified BOOLEAN DEFAULT 1,       -- Auto-verified
    last_login DATETIME,                      -- Last login timestamp
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔍 DBeaver Operations

### 1. Monitor Users
```sql
-- Lihat semua user dengan statistik
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.is_email_verified,
    u.last_login,
    u.created_at,
    COUNT(cm.id) as total_messages,
    COUNT(DISTINCT cm.session_id) as total_sessions
FROM users u
LEFT JOIN chat_messages cm ON u.id = cm.user_id
GROUP BY u.id
ORDER BY u.created_at DESC;
```

### 2. Chat Analytics
```sql
-- Aktivitas chat per user
SELECT 
    u.username,
    DATE(cm.timestamp) as chat_date,
    COUNT(*) as messages_count,
    COUNT(DISTINCT cm.session_id) as sessions_count
FROM chat_messages cm
JOIN users u ON cm.user_id = u.id
WHERE cm.timestamp >= date('now', '-7 days')
GROUP BY u.id, DATE(cm.timestamp)
ORDER BY chat_date DESC, messages_count DESC;
```

### 3. Auto-Chat Knowledge Base
```sql
-- Lihat knowledge base untuk auto-chat
SELECT 
    category,
    keyword,
    LEFT(response, 50) as response_preview,
    priority,
    created_at
FROM travel_knowledge
ORDER BY category, priority DESC, keyword;
```

### 4. Session Management
```sql
-- Active sessions monitoring
SELECT 
    us.id,
    us.user_id,
    u.username,
    us.created_at,
    us.expires_at,
    CASE 
        WHEN us.expires_at > datetime('now') THEN 'Active'
        ELSE 'Expired'
    END as status
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.expires_at > datetime('now', '-1 day')
ORDER BY us.created_at DESC;
```

## 🔧 Backend Integration

### 1. Environment Setup
```env
# .env
DATABASE_TYPE=lowdb              # atau 'sqlite'
DATABASE_PATH=./database.json      # atau './database/travello.db'
JWT_SECRET=your-super-secret-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
CORS_ORIGIN=http://localhost:5173
```

### 2. Database Config (Flexible)
```typescript
// src/config/database.config.ts
export const initializeDatabase = async () => {
  const dbType = process.env.DATABASE_TYPE || 'lowdb';
  
  if (dbType === 'sqlite') {
    // SQLite setup untuk production
    const { initializeSQLite } = await import('./sqlite.config.js');
    return await initializeSQLite();
  } else {
    // LowDB setup untuk development
    const { db } = await import('./database.config.js');
    return db;
  }
};
```

### 3. Migration Script
```typescript
// src/migrations/migrate.ts
export const migrateToSQLite = async () => {
  console.log('🔄 Migrating from LowDB to SQLite...');
  
  // Read existing JSON data
  const jsonData = fs.readFileSync('database.json', 'utf8');
  const data = JSON.parse(jsonData);
  
  // Migrate users
  for (const user of data.users || []) {
    await insertUserToSQLite(user);
  }
  
  // Migrate chat messages
  for (const msg of data.chatMessages || []) {
    await insertChatMessageToSQLite(msg);
  }
  
  console.log('✅ Migration completed!');
};
```

## 🛡️ Security Implementation

### 1. Password Security
```typescript
// Auth controller improvements
static async register(req: Request, res: Response) {
  const { email, password, username } = req.body;
  
  // Email validation
  if (!User.validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  
  // Password strength
  const passwordValidation = User.validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: passwordValidation.message
    });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Create user
  const user = await User.create({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    isEmailVerified: true, // Auto-verify
    role: 'user'
  });
  
  // Generate token
  const token = generateToken(user);
  
  res.json({
    success: true,
    message: 'Registration successful!',
    data: { user, token }
  });
}
```

### 2. Google OAuth Setup
```typescript
// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    const { user } = req;
    
    // Check if user exists
    let existingUser = await User.findByGoogleId(user.id);
    
    if (!existingUser) {
      // Create new user from Google
      existingUser = await User.create({
        googleId: user.id,
        email: user.emails[0].value,
        username: user.displayName.replace(/\s+/g, '_').toLowerCase(),
        displayName: user.displayName,
        profilePicture: user.photos[0]?.value,
        isEmailVerified: true,
        role: 'user'
      });
    }
    
    // Generate token
    const token = generateToken(existingUser);
    
    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  }
);
```

## 📈 Performance Monitoring

### 1. Database Performance
```sql
-- Query performance analysis
EXPLAIN QUERY PLAN 
SELECT * FROM users 
WHERE email = 'test@example.com';

-- Index usage
SELECT 
    name,
    tbl_name,
    sql
FROM sqlite_master 
WHERE type = 'index';

-- Database size
SELECT 
    page_count * page_size as size_bytes,
    name
FROM pragma_page_count(), pragma_page_size();
```

### 2. Application Metrics
```typescript
// Monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log metrics
    console.log({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
});
```

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Production environment
export NODE_ENV=production
export DATABASE_TYPE=sqlite
export DATABASE_PATH=/var/lib/travello/travello.db
export JWT_SECRET=super-secure-production-secret
export PORT=3000
```

### 2. Database Backup
```bash
#!/bin/bash
# backup-database.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/travello"

# Create backup
sqlite3 $DATABASE_PATH ".backup $BACKUP_DIR/travello_$DATE.db"

# Compress
gzip $BACKUP_DIR/travello_$DATE.db

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: travello_$DATE.db.gz"
```

### 3. SSL & Security
```typescript
// HTTPS setup
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('/path/to/private.key'),
  cert: fs.readFileSync('/path/to/certificate.crt')
};

https.createServer(options, app).listen(443);
```

## 🎯 Testing Strategy

### 1. Unit Tests
```typescript
// tests/auth.test.ts
describe('Authentication', () => {
  test('should register new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
  });
});
```

### 2. Integration Tests
```typescript
// tests/chat.test.ts
describe('Chat System', () => {
  test('should send message and get AI response', async () => {
    const loginResponse = await loginUser();
    const token = loginResponse.body.data.token;
    
    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Hello TRAVELLO!' })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.response).toBeDefined();
  });
});
```

## 📚 Documentation Links

### API Documentation
- **Chat API:** `CHAT_API_DOCS.md`
- **Auto-Chat Guide:** `AUTO_CHAT_GUIDE.md`
- **Frontend Guide:** `FRONTEND_GUIDE.md`

### Database Tools
- [DBeaver Official](https://dbeaver.io/)
- [SQLite Documentation](https://sqlite.org/docs.html)
- [DB Browser for SQLite](https://sqlitebrowser.org/)

### Security Resources
- [OWASP Authentication](https://owasp.org/www-project-authentication-cheat-sheet/)
- [JWT Best Practices](https://auth0.com/blog/json-web-token-best-practices)
- [bcrypt Security](https://github.com/kelektiv/node.bcrypt.js)

---

## 🎉 Summary

### ✅ What's Ready NOW:
1. **Login/Register untuk SEMUA ORANG** - sudah berjalan
2. **Modern Frontend** dengan React + TypeScript
3. **JSON Database** dengan auto-save
4. **Google OAuth** integration
5. **Auto-Chat Bot** dengan knowledge base
6. **Complete API** dengan error handling

### 🔄 What to Add:
1. **SQLite Migration** untuk production
2. **DBeaver Integration** untuk monitoring
3. **Backup System** otomatis
4. **Performance Monitoring**
5. **Security Hardening**

### 🚀 Quick Commands:
```bash
# Start development (JSON DB)
npm start

# Start frontend
cd fe-travello && npm run dev

# Create SQLite DB
cd database && create-database.bat

# Connect DBeaver
# File → New → SQLite → Path: database/travello.db
```

**🎯 Ready for Production!**

Sistem TRAVELLO sekarang memiliki:
- ✅ Authentication untuk semua orang
- ✅ Modern frontend & backend
- ✅ Database yang scalable
- ✅ Auto-chat intelligence
- ✅ Production deployment path

**Happy Travel Planning!** 🌍✈️
