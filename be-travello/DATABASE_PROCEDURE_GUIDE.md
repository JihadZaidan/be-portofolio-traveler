# 📋 Database & Table Procedures Guide

## 🗄️ Database Creation Procedure

### Step 1: Create Database
```sql
CREATE DATABASE IF NOT EXISTS travello_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### Step 2: Use Database
```sql
USE travello_db;
```

---

## 📊 Table Structures & Procedures

### 1. Tabel `users` - Data Pengguna

**Purpose:** Menyimpan data user dari signup, login, OAuth, dan manual registration

```sql
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    profile_picture TEXT,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields Explanation:**
- `id` - Unique identifier user (UUID)
- `username` - Username unik untuk login manual
- `email` - Email unik, digunakan untuk OAuth
- `password` - Hashed password (bcrypt) untuk login manual
- `google_id` - Google OAuth ID
- `display_name` - Nama tampilan user
- `profile_picture` - URL foto profil
- `role` - 'user' atau 'admin'
- `is_email_verified` - Status verifikasi email
- `last_login` - Timestamp login terakhir
- `created_at` - Tanggal registrasi
- `updated_at` - Terakhir update data

---

### 2. Tabel `login_history` - Riwayat Login

**Purpose:** Melacak semua aktivitas login user untuk security dan analytics

```sql
CREATE TABLE IF NOT EXISTS login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_method ENUM('local', 'google', 'github') NOT NULL DEFAULT 'local',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_login_history_user_id (user_id),
    INDEX idx_login_history_login_time (login_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields Explanation:**
- `id` - Auto increment primary key
- `user_id` - Foreign key ke tabel users
- `login_time` - Timestamp login
- `ip_address` - IP address user saat login
- `user_agent` - Browser/device information
- `login_method` - 'local', 'google', 'github'

---

### 3. Tabel `user_sessions` - Sesi Aktif

**Purpose:** Mengelola sesi login aktif user

```sql
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sessions_user_id (user_id),
    INDEX idx_user_sessions_token (token(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields Explanation:**
- `id` - Session ID
- `user_id` - Foreign key ke tabel users
- `token` - JWT session token
- `expires_at` - Session expiration time
- `created_at` - Session creation time

---

### 4. Tabel `chat_messages` - Pesan Chat

**Purpose:** Menyimpan riwayat chat antara user dan AI

```sql
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    message TEXT,
    response TEXT,
    role ENUM('user', 'ai') NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_chat_messages_session_id (session_id),
    INDEX idx_chat_messages_user_id (user_id),
    INDEX idx_chat_messages_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields Explanation:**
- `id` - Unique message ID
- `session_id` - Chat session identifier
- `user_id` - Foreign key ke tabel users
- `message` - Pesan dari user
- `response` - Respon dari AI
- `role` - 'user' atau 'ai'
- `timestamp` - Timestamp pesan

---

### 5. Tabel `travel_knowledge` - Knowledge Base

**Purpose:** Database untuk auto-responses travel chatbot

```sql
CREATE TABLE IF NOT EXISTS travel_knowledge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    keyword VARCHAR(255) NOT NULL,
    response TEXT NOT NULL,
    priority INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_travel_knowledge_category (category),
    INDEX idx_travel_knowledge_keyword (keyword)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields Explanation:**
- `id` - Auto increment primary key
- `category` - Kategori knowledge (wisata, hotel, transportasi, dll)
- `keyword` - Keyword untuk matching
- `response` - Respon otomatis
- `priority` - Prioritas matching (1 = highest)
- `created_at` - Timestamp creation

---

## 📈 View untuk Statistik

### User Statistics View
```sql
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.created_at,
    u.last_login,
    COUNT(cm.id) as total_messages,
    COUNT(DISTINCT cm.session_id) as total_sessions,
    MAX(cm.timestamp) as last_activity
FROM users u
LEFT JOIN chat_messages cm ON u.id = cm.user_id
GROUP BY u.id, u.username, u.email, u.created_at, u.last_login;
```

---

## 🔧 Sample Data Insert

### Sample Users
```sql
-- Admin User
INSERT IGNORE INTO users (
    id, username, email, password, role, is_email_verified, created_at, updated_at
) VALUES (
    'admin-001', 'admin', 'admin@travello.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LfC', 
    'admin', TRUE, NOW(), NOW()
);

-- Test User
INSERT IGNORE INTO users (
    id, username, email, password, role, is_email_verified, created_at, updated_at
) VALUES (
    'user-001', 'testuser', 'user@travello.com', 
    '$2a$12$9XqYcWQnWqKqBqBqBqBqOYz6TtxMQJqhN8/LewdBPj6ukx.LfC', 
    'user', TRUE, NOW(), NOW()
);
```

### Sample Travel Knowledge
```sql
INSERT IGNORE INTO travel_knowledge (category, keyword, response, priority) VALUES
('wisata', 'bali', '🏝️ **Bali** - Pulau Dewata\n• Pantai Kuta, Seminyak, Nusa Dua\n• Ubud untuk culture dan nature\n• Budget: Rp 1-3 juta untuk 3 hari', 1),
('wisata', 'yogyakarta', '🏛️ **Yogyakarta** - Kota Budaya\n• Candi Borobudur & Prambanan\n• Malioboro untuk belanja oleh-oleh', 1),
('hotel', 'murah', '🏨 **Hotel Murah:**\n• RedDoorz - Rp 100-300rb/malam\n• OYO - Rp 150-400rb/malam\n• Airbnb - Rp 200-500rb/malam', 1);
```

---

## 🔍 Query Examples

### Get All Users with Login Info
```sql
SELECT 
    u.id,
    u.username,
    u.email,
    u.provider,
    u.role,
    u.is_email_verified,
    u.last_login,
    u.created_at,
    COUNT(lh.id) as login_count
FROM users u
LEFT JOIN login_history lh ON u.id = lh.user_id
GROUP BY u.id
ORDER BY u.created_at DESC;
```

### Get Recent Login Activity
```sql
SELECT 
    u.username,
    u.email,
    lh.login_time,
    lh.ip_address,
    lh.login_method
FROM login_history lh
JOIN users u ON lh.user_id = u.id
ORDER BY lh.login_time DESC
LIMIT 10;
```

### Get User Statistics
```sql
SELECT * FROM user_stats
ORDER BY last_activity DESC;
```

---

## 🚀 Setup Commands

### Complete Database Setup
```bash
# Create database
mysql -u root -e "CREATE DATABASE travello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root travello_db < database-mysql-setup.sql

# Verify tables
mysql -u root -e "SHOW TABLES FROM travello_db;"
```

### Test Connection
```bash
# Test database connection
mysql -u root -e "SELECT 'Database Connected' as status;" travello_db

# Check user count
mysql -u root -e "SELECT COUNT(*) as total_users FROM users;" travello_db
```

---

## 📋 Database Summary

| Table Name | Purpose | Records | Key Features |
|------------|---------|---------|--------------|
| `users` | User data | 2+ | OAuth support, roles, verification |
| `login_history` | Login tracking | 0+ | IP tracking, method detection |
| `user_sessions` | Active sessions | 0+ | JWT token management |
| `chat_messages` | Chat history | 0+ | User-AI conversations |
| `travel_knowledge` | Knowledge base | 6+ | Auto-response system |
| `user_stats` | Statistics view | Dynamic | Aggregated user data |

---

**✅ Database travello_db dengan 6 tabel siap digunakan untuk menyimpan data user dari semua metode registrasi!**
