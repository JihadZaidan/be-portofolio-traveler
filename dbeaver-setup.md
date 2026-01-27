# 🐬 DBeaver Setup untuk TRAVELLO Database

## 📋 Persiapan

### 1. Install DBeaver
- Download: https://dbeaver.io/download/
- Pilih versi Community (gratis)
- Install sesuai OS Anda

### 2. Database yang Digunakan
TRAVELLO menggunakan **JSON Database** dengan LowDB, bukan SQLite.
Tapi kita bisa setup database yang lebih robust dengan SQLite.

## 🔧 Setup SQLite Database

### Step 1: Buat Database File
```bash
# Di folder be-travello
mkdir -p database
cd database
```

### Step 2: Import Schema
Gunakan file `database-setup.sql` yang sudah dibuat:
```bash
# Install SQLite CLI terlebih dahulu
# Kemudian jalankan:
sqlite3 travello.db < database-setup.sql
```

## 🐬 Konfigurasi DBeaver

### 1. Buka DBeaver
- Launch DBeaver
- Klik **File → New → Database Connection**

### 2. Pilih SQLite
- Cari "SQLite" di filter
- Pilih **SQLite** icon
- Klik **Next**

### 3. Connection Settings
```
Connection Name: TRAVELLO_DB
Path: [Browse ke file travello.db]
```

#### Detail Path:
- Klik tombol **Browse** 
- Navigate ke: `C:\Users\ACER\workandshop\be-travello\database\travello.db`
- Atau gunakan absolute path: `C:/Users/ACER/workandshop/be-travello/database/travello.db`

### 4. Test Connection
- Klik **Test Connection**
- Harus muncul "Connected successfully"
- Klik **Finish**

## 📊 Database Structure

Setelah connect, Anda akan melihat:

### Tables:
1. **users** - Data user & auth
   - id (TEXT PRIMARY KEY)
   - username (TEXT UNIQUE)
   - email (TEXT UNIQUE)
   - password (TEXT - hashed)
   - google_id (TEXT UNIQUE - untuk OAuth)
   - display_name (TEXT)
   - profile_picture (TEXT)
   - role (TEXT: 'user'/'admin')
   - is_email_verified (BOOLEAN)
   - last_login (DATETIME)
   - created_at (DATETIME)
   - updated_at (DATETIME)

2. **chat_messages** - Riwayat chat
   - id (TEXT PRIMARY KEY)
   - session_id (TEXT)
   - user_id (TEXT - FK ke users)
   - message (TEXT - user input)
   - response (TEXT - AI response)
   - role (TEXT: 'user'/'ai')
   - timestamp (DATETIME)

3. **user_sessions** - Session management
   - id (TEXT PRIMARY KEY)
   - user_id (TEXT - FK ke users)
   - token (TEXT)
   - expires_at (DATETIME)
   - created_at (DATETIME)

4. **travel_knowledge** - Knowledge base untuk auto-chat
   - id (INTEGER PRIMARY KEY AUTOINCREMENT)
   - category (TEXT)
   - keyword (TEXT)
   - response (TEXT)
   - priority (INTEGER)
   - created_at (DATETIME)

### Views:
1. **user_stats** - Statistik user
   - Total messages
   - Total sessions
   - Last activity

## 🔍 Sample Queries di DBeaver

### 1. Lihat Semua User
```sql
SELECT 
    id,
    username,
    email,
    role,
    is_email_verified,
    created_at,
    last_login
FROM users
ORDER BY created_at DESC;
```

### 2. Statistik User
```sql
SELECT 
    u.username,
    u.email,
    COUNT(cm.id) as total_messages,
    COUNT(DISTINCT cm.session_id) as total_sessions,
    MAX(cm.timestamp) as last_activity
FROM users u
LEFT JOIN chat_messages cm ON u.id = cm.user_id
GROUP BY u.id, u.username, u.email
ORDER BY total_messages DESC;
```

### 3. Riwayat Chat User
```sql
SELECT 
    cm.session_id,
    cm.message,
    cm.response,
    cm.role,
    cm.timestamp,
    u.username
FROM chat_messages cm
JOIN users u ON cm.user_id = u.id
WHERE u.id = 'user-id-here'
ORDER BY cm.timestamp DESC;
```

### 4. Knowledge Base untuk Auto-Chat
```sql
SELECT 
    category,
    keyword,
    response,
    priority
FROM travel_knowledge
WHERE category = 'wisata'
ORDER BY priority DESC, keyword;
```

## 🔧 Integrasi dengan Backend

### Update Backend untuk SQLite
Buat file baru `src/config/sqlite-database.config.ts`:

```typescript
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'database', 'travello.db');

export const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export default db;
```

### Update User Model
Ganti LowDB dengan SQLite queries:

```typescript
// Find user by email
static async findByEmail(email: string): Promise<User | null> {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email.toLowerCase());
    return row ? new User(row) : null;
}

// Create user
static async create(userData: UserCreationAttributes): Promise<User> {
    const stmt = db.prepare(`
        INSERT INTO users (id, username, email, password, role, is_email_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
        uuidv4(),
        userData.username,
        userData.email.toLowerCase(),
        userData.password,
        userData.role,
        userData.isEmailVerified ? 1 : 0,
        new Date().toISOString(),
        new Date().toISOString()
    );
    
    return this.findByPk(result.lastInsertRowid as string);
}
```

## 🚀 Quick Start

### 1. Setup Database
```bash
# Buat database folder
mkdir -p database

# Import schema
sqlite3 database/travello.db < database-setup.sql
```

### 2. Connect DBeaver
- Buka DBeaver
- New → SQLite Connection
- Path: `C:/Users/ACER/workandshop/be-travello/database/travello.db`
- Test & Finish

### 3. Verify Data
```sql
-- Cek users
SELECT * FROM users;

-- Cek knowledge base
SELECT * FROM travel_knowledge;

-- Cek indexes
PRAGMA index_list(users);
```

## 📝 Tips Tambahan

### Backup Database
```bash
# Backup
cp database/travello.db database/travello_backup_$(date +%Y%m%d).db

# Export schema
sqlite3 database/travello.db .schema > schema.sql
```

### Performance Optimization
```sql
-- Analyze query performance
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'test@example.com';

-- Rebuild indexes
REINDEX;

-- Vacuum database
VACUUM;
```

### Security
```sql
-- Set permissions (jika multi-user)
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO travello_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages TO travello_app;
```

## 🔗 Useful Resources

- [SQLite Documentation](https://sqlite.org/docs.html)
- [DBeaver SQLite Guide](https://dbeaver.io/docs/databases/sqlite/)
- [SQL Best Practices](https://www.sqlstyle.guide/)

---

**🎉 Setup Complete!** 

Sekarang Anda bisa:
1. ✅ Connect DBeaver ke SQLite database
2. ✅ Manage data dengan GUI
3. ✅ Run queries dan analisis
4. ✅ Monitor performance
5. ✅ Backup & restore data

**Next Steps:**
- Integrate SQLite dengan backend
- Update models untuk menggunakan SQLite
- Test dengan sample data
- Deploy ke production
