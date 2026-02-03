# 🗄️ Panduan Lengkap Setup DBeaver dengan Data User TRAVELLO

## 📋 Langkah 1: Setup Database di DBeaver

### 1.1 Buka DBeaver
- Launch DBeaver
- Klik **Database** → **New Database Connection**

### 1.2 Pilih SQLite
- Cari dan pilih **SQLite**
- Klik **Next**

### 1.3 Konfigurasi Connection
- **Database path**: `C:\Users\ACER\workandshop\be-travello\database\travello.db`
- Pastikan path sesuai dengan lokasi file database
- Klik **Finish**

## 📋 Langkah 2: Buat Schema Database

### 2.1 Buka SQL Editor
- Klik kanan pada database connection
- Pilih **SQL Editor** → **New SQL Script**

### 2.2 Jalankan Schema Setup
- Copy seluruh isi file `quick-setup.sql`
- Paste di SQL Editor
- Klik **Execute** (▶️) atau tekan **Ctrl+Enter**

## 📋 Langkah 3: Insert Data User

### 3.1 Buka SQL Editor Baru
- Klik **SQL Editor** → **New SQL Script**

### 3.2 Jalankan Insert User Script
- Copy seluruh isi file `insert-users.sql`
- Paste di SQL Editor
- Klik **Execute** (▶️) atau tekan **Ctrl+Enter**

## 📋 Langkah 4: Verifikasi Data

### 4.1 Cek Data Users
```sql
SELECT * FROM users ORDER BY created_at DESC;
```

### 4.2 Cek Statistik Users
```sql
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
    COUNT(CASE WHEN is_email_verified = 1 THEN 1 END) as verified_users
FROM users;
```

## 📋 Data User yang Akan Diinsert

### User 1: Test User
- **ID**: fa029540-14ae-4054-945d-12f0d0fa5fa9
- **Username**: testuser
- **Email**: test@example.com
- **Display Name**: Test User
- **Role**: user
- **Status**: Verified
- **Last Login**: 2026-01-26T03:06:13.644Z

### User 2: Revo Admj
- **ID**: 7cb3664b-40ac-4baa-a55e-e60f0944a69c
- **Username**: wrm23r13rn
- **Email**: wrm23r13rn@yahoo.com
- **Display Name**: Revo Admj
- **Role**: user
- **Status**: Verified
- **Last Login**: 2026-01-26T03:06:57.253Z

### User 3: Imanuel Admojo
- **ID**: c65fd650-3603-44ab-b37c-f2770cedfff2
- **Username**: imanueladmojo
- **Email**: admjrevo@gmail.com
- **Display Name**: Imanuel Admojo
- **Role**: user
- **Status**: Verified
- **Last Login**: 2026-01-26T04:21:37.787Z

## 📋 Struktur Database

### Tabel Users
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    google_id TEXT UNIQUE,
    display_name TEXT,
    profile_picture TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    is_email_verified BOOLEAN NOT NULL DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Tabel Lainnya
- `chat_messages` - Untuk menyimpan pesan chat
- `user_sessions` - Untuk menyimpan session user
- `travel_knowledge` - Untuk knowledge base travel

## 📋 Query Berguna

### Cari User Berdasarkan Email
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

### Cek User Aktif (Login dalam 24 jam)
```sql
SELECT * FROM users 
WHERE last_login >= datetime('now', '-1 day');
```

### Update User Role ke Admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@travello.com';
```

### Tambah User Baru
```sql
INSERT INTO users (id, username, email, password, display_name, role, is_email_verified)
VALUES (
    'user-' || lower(hex(randomblob(16))),
    'newuser',
    'newuser@example.com',
    '$2b$12$encrypted_password_hash',
    'New User',
    'user',
    1
);
```

## 📋 Troubleshooting

### Error: "database is locked"
- Pastikan tidak ada aplikasi lain yang menggunakan file .db
- Restart DBeaver dan coba lagi

### Error: "no such table"
- Pastikan sudah menjalankan `quick-setup.sql` terlebih dahulu
- Cek apakah schema sudah terbuat dengan benar

### Error: "UNIQUE constraint failed"
- Data user sudah ada di database
- Gunakan `INSERT OR IGNORE` atau `UPDATE` untuk mengubah data

## 📋 Tips Tambahan

### Backup Database
```sql
-- Backup ke file baru
.backup travello_backup.db
```

### Cek Database Size
```sql
SELECT 
    name,
    COUNT(*) as rows,
    ROUND(SUM(sqlite3_length(sqlite3_serialize(name))) / 1024.0, 2) as size_kb
FROM sqlite_master 
WHERE type = 'table'
GROUP BY name;
```

### Optimize Database
```sql
VACUUM;
ANALYZE;
```

## 📋 File yang Dibutuhkan

1. **Database File**: `travello.db`
2. **Schema Setup**: `quick-setup.sql`
3. **User Data**: `insert-users.sql`
4. **Panduan Ini**: `dbeaver-user-setup.md`

## 📋 Next Steps

Setelah setup selesai:
1. Test koneksi dari backend ke database
2. Verifikasi login user dari frontend
3. Test fitur chat dan session management
4. Monitor database performance

---

**🎉 Selamat! Database TRAVELLO dengan data user sudah siap digunakan di DBeaver!**
