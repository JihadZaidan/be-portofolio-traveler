# 🐬 DBeaver Step-by-Step Setup Guide

## 📋 Persiapan Awal

### 1. Install DBeaver (jika belum ada)
1. **Download DBeaver**: https://dbeaver.io/download/
2. **Pilih "Community Edition"** (gratis)
3. **Install** di komputer Anda
4. **Buka DBeaver** setelah install selesai

## 🔧 Step 1: Buat Koneksi Database

### 1.1 Buka DBeaver
- Launch DBeaver dari desktop/start menu
- Tunggu loading screen selesai

### 1.2 Buat Koneksi Baru
1. Klik **File** (di pojok kiri atas)
2. Pilih **New → Database Connection**
3. Atau gunakan shortcut: **Ctrl+Shift+N**

### 1.3 Pilih Database Type
1. Di filter search, ketik: **"SQLite"**
2. Klik icon **SQLite** (biasanya warna biru muda)
3. Klik tombol **Next >**

## 🔧 Step 2: Konfigurasi Koneksi SQLite

### 2.1 Connection Settings
Isi form dengan data berikut:

```
Connection Name: TRAVELLO_DB
Path: C:/Users/ACER/workandshop/be-travello/database/travello.db
```

### 2.2 Detail Path:
1. Klik tombol **Browse** di sebelah field Path
2. Navigate ke folder: `C:\Users\ACER\workandshop\be-travello\database\`
3. Pilih file: **travello.db**
4. Klik **Open**

### 2.3 Driver Settings (biarkan default):
- **Driver**: SQLite (Auto)
- **URL**: jdbc:sqlite:C:/Users/ACER/workandshop/be-travello/database/travello.db
- **User**: (kosongkan)
- **Password**: (kosongkan)

### 2.4 Test Connection
1. Klik tombol **Test Connection**
2. Harus muncul: **"Connected successfully"**
3. Jika error, periksa path file-nya

### 2.5 Finish Setup
1. Klik tombol **Finish**
2. Tunggu DBeaver membuat koneksi
3. Database akan muncul di **Database Navigator** (kiri)

## 🔧 Step 3: Buat Database Schema

### 3.1 Buka SQL Editor
1. **Double click** pada database TRAVELLO_DB
2. Klik kanan → **SQL Editor**
3. Atau gunakan menu: **SQL → SQL Editor**

### 3.2 Jalankan Schema Script
1. **Copy** semua SQL dari file `database-setup.sql`
2. **Paste** di SQL Editor
3. Klik tombol **Execute** (▶️) atau tekan **F5**

### 3.3 Schema SQL (Copy-Paste ini):
```sql
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    google_id TEXT UNIQUE,
    display_name TEXT,
    profile_picture TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_email_verified BOOLEAN NOT NULL DEFAULT 0,
    last_login DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message TEXT,
    response TEXT,
    role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Travel knowledge base
CREATE TABLE IF NOT EXISTS travel_knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    keyword TEXT NOT NULL,
    response TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT OR IGNORE INTO travel_knowledge (category, keyword, response, priority) VALUES
('wisata', 'bali', '🏝️ **Bali** - Pulau Dewata\n• Pantai Kuta, Seminyak, Nusa Dua\n• Ubud untuk culture dan nature\n• Budget: Rp 1-3 juta untuk 3 hari', 1),
('wisata', 'yogyakarta', '🏛️ **Yogyakarta** - Kota Budaya\n• Candi Borobudur & Prambanan\n• Malioboro untuk belanja oleh-oleh', 1),
('hotel', 'murah', '🏨 **Hotel Murah:**\n• RedDoorz - Rp 100-300rb/malam\n• OYO - Rp 150-400rb/malam', 1),
('transportasi', 'kereta', '🚂 **Transportasi Kereta:**\n• KAI Access - Ekonomi AC\n• KAI Jaka - Bisnis', 1),
('makanan', 'khas', '🍜 **Makanan Khas:**\n• **Sumatra:** Rendang, Sate Padang\n• **Jawa:** Gudeg, Soto, Rawon', 1),
('budget', 'backpacker', '🎒 **Backpacker Budget:**\n• **Akomodasi:** Hostel Rp 50-150rb/malam\n• **Makan:** Warung Rp 15-50rb/saji', 1);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_knowledge_category ON travel_knowledge(category);

-- Sample users
INSERT OR IGNORE INTO users (id, username, email, password, role, is_email_verified, created_at, updated_at) VALUES
('admin-001', 'admin', 'admin@travello.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LfC', 'admin', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-001', 'testuser', 'user@travello.com', '$2a$12$9XqYcWQnWqKqBqBqBqOYz6TtxMQJqhN8/LewdBPj6ukx.LfC', 'user', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### 3.4 Execute Schema
1. **Select semua SQL** di atas (Ctrl+A)
2. **Copy** (Ctrl+C)
3. **Paste** di DBeaver SQL Editor
4. **Klik Execute** (▶️)
5. Harus muncul: **"Query executed successfully"**

## 🔧 Step 4: Verifikasi Database

### 4.1 Refresh Database
1. **Klik kanan** pada database TRAVELLO_DB
2. Pilih **Refresh**
3. Atau tekan **F5**

### 4.2 Cek Tables
1. **Expand** database TRAVELLO_DB
2. Expand folder **Tables**
3. Harus muncul:
   - ✅ `users`
   - ✅ `chat_messages`
   - ✅ `user_sessions`
   - ✅ `travel_knowledge`

### 4.3 Lihat Data Users
1. **Klik kanan** pada table `users`
2. Pilih **View Data**
3. Harus muncul 2 user:
   - `admin@travello.com` (admin)
   - `user@travello.com` (user)

### 4.4 Lihat Knowledge Base
1. **Klik kanan** pada table `travel_knowledge`
2. Pilih **View Data**
3. Harus muncul data travel knowledge

## 🔧 Step 5: Test Queries

### 5.1 Buka SQL Editor Baru
1. **Klik kanan** pada database
2. Pilih **SQL Editor**

### 5.2 Test Query Users
```sql
SELECT 
    id,
    username,
    email,
    role,
    is_email_verified,
    created_at
FROM users
ORDER BY created_at DESC;
```
**Execute** → Harus muncul 2 users

### 5.3 Test Query Knowledge Base
```sql
SELECT 
    category,
    keyword,
    LEFT(response, 50) as response_preview,
    priority
FROM travel_knowledge
ORDER BY category, priority DESC;
```
**Execute** → Harus muncul knowledge data

### 5.4 Test Insert User
```sql
INSERT INTO users (
    id, 
    username, 
    email, 
    password, 
    role, 
    is_email_verified, 
    created_at, 
    updated_at
) VALUES (
    'test-' || datetime('now'),
    'newuser',
    'newuser@test.com',
    'dummy_password_hash',
    'user',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
```
**Execute** → Harus berhasil insert

## 🔧 Step 6: Integrasi dengan Backend

### 6.1 Update Environment Backend
Buka file `.env` di folder `be-travello`:
```env
DATABASE_TYPE=sqlite
DATABASE_PATH=./database/travello.db
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CORS_ORIGIN=http://localhost:5173
```

### 6.2 Test Backend Connection
```bash
# Di folder be-travello
npm start
```
Backend harus connect ke SQLite database

### 6.3 Test Frontend
```bash
# Di folder fe-travello
npm run dev
```
Buka: http://localhost:5173/login

## 🔧 Step 7: Backup & Maintenance

### 7.1 Backup Database
1. **Klik kanan** pada database TRAVELLO_DB
2. Pilih **Tools → Export**
3. Pilih format: **SQL**
4. Save sebagai: `travello_backup.sql`

### 7.2 Database Properties
1. **Klik kanan** pada database
2. Pilih **Properties**
3. Lihat info: size, tables, indexes

## 🎯 Troubleshooting

### Problem: "File not found"
**Solution:** Periksa path file
- Path harus: `C:/Users/ACER/workandshop/be-travello/database/travello.db`
- Gunakan forward slash `/` bukan backslash `\`

### Problem: "Access denied"
**Solution:** Check permissions
- Pastikan DBeaver punya akses ke folder
- Run DBeaver as Administrator

### Problem: "SQL syntax error"
**Solution:** Check SQL syntax
- Pastikan semua SQL ter-copy dengan benar
- Periksa tanda kutip dan koma

### Problem: "No tables visible"
**Solution:** Refresh database
- Klik kanan → Refresh
- Atau tekan F5

## 🎉 Success Criteria

✅ **Connection Success**: DBeaver connect ke SQLite
✅ **Tables Created**: 4 tables terbuat
✅ **Data Inserted**: Sample data masuk
✅ **Queries Work**: SELECT/INSERT berhasil
✅ **Backend Connect**: Node.js connect ke database
✅ **Frontend Works**: Login/Register berjalan

## 📞 Help & Support

### Quick Commands di DBeaver:
- **Ctrl+Shift+N**: New connection
- **F5**: Refresh
- **Ctrl+Enter**: Execute query
- **Ctrl+Space**: SQL autocomplete
- **Ctrl+S**: Save query

### Useful Views:
- **Database Navigator**: Lihat semua tables
- **SQL Editor**: Tulis & execute SQL
- **Data Editor**: Edit data langsung
- **ER Diagram**: Visualisasi relasi tables

---

## 🎯 Next Steps

Setelah database siap:
1. **Test registration** di frontend
2. **Test login** dengan user yang sudah ada
3. **Test chat** functionality
4. **Monitor** dengan DBeaver
5. **Deploy** ke production

**🚀 Selamat! Database TRAVELLO siap digunakan!**
