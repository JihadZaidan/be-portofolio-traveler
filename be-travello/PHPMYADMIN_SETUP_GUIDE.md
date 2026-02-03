# 🗄️ phpMyAdmin Database Setup Guide

## 🚀 Langkah-Langkah Membuat Database di phpMyAdmin

### Step 1: Buka XAMPP Control Panel
1. XAMPP Control Panel sudah dibuka otomatis
2. Pastikan service **Apache** dan **MySQL** berjalan (hijau)
3. Jika belum running, klik tombol **Start** pada kedua service

### Step 2: Akses phpMyAdmin
1. Browser akan otomatis membuka `http://localhost/phpmyadmin`
2. Atau buka manual: `http://localhost/phpmyadmin`
3. Login dengan:
   - **Username:** `root`
   - **Password:** (kosongkan, langsung klik Go)

### Step 3: Buat Database Baru
1. Di phpMyAdmin, klik **"New"** di sidebar kiri
2. Masukkan nama database: `travello_db`
3. Pilih collation: `utf8mb4_unicode_ci`
4. Klik **"Create"**

### Step 4: Import Schema Database
1. Pilih database `travello_db` yang baru dibuat
2. Klik tab **"Import"** di bagian atas
3. Klik **"Choose file"** dan pilih file:
   ```
   be-travello/database-mysql-setup.sql
   ```
4. Pastikan format: **SQL**
5. Klik **"Go"** untuk mengimport

### Step 5: Verifikasi Tabel
Setelah import berhasil, akan muncul tabel-tabel:
- ✅ `users` - Data user (signup/login)
- ✅ `login_history` - Riwayat login user
- ✅ `user_sessions` - Sesi aktif user
- ✅ `chat_messages` - Pesan chat
- ✅ `travel_knowledge` - Knowledge base travel

## 📊 Struktur Database

### Tabel `users`
```sql
- id (VARCHAR 255) - Primary Key
- username (VARCHAR 255) - Username unik
- email (VARCHAR 255) - Email unik  
- password (VARCHAR 255) - Hashed password
- google_id (VARCHAR 255) - Google OAuth ID
- display_name (VARCHAR 255) - Nama tampilan
- profile_picture (TEXT) - URL foto profil
- role (ENUM) - 'user' atau 'admin'
- is_email_verified (BOOLEAN) - Status verifikasi
- last_login (DATETIME) - Login terakhir
- created_at (DATETIME) - Tanggal dibuat
- updated_at (DATETIME) - Tanggal diupdate
```

### Tabel `login_history`
```sql
- id (INT AUTO_INCREMENT) - Primary Key
- user_id (VARCHAR 255) - Foreign key ke users
- login_time (DATETIME) - Waktu login
- ip_address (VARCHAR 45) - IP address user
- user_agent (TEXT) - Browser info
- login_method (ENUM) - 'local', 'google', 'github'
```

## 🔧 Konfigurasi Koneksi

### Update .env File
Buat atau update file `.env` di root project:

```env
# Database Configuration
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=travello_db
MYSQL_USER=root
MYSQL_PASSWORD=
```

## ✅ Testing Koneksi Database

### Test Connection Script
```bash
cd be-travello
node -e "
import { testConnection } from './src/config/database-mysql.config.js';
testConnection().then(result => console.log('MySQL Connection:', result ? '✅ Success' : '❌ Failed'));
"
```

### Test dengan Browser
Buka `be-travello/src/user-data-table.html` di browser untuk testing interface user management.

## 🚨 Troubleshooting

### XAMPP Services Tidak Start
- Cek port 80 (Apache) dan 3306 (MySQL)
- Stop Skype/Zoom yang mungkin menggunakan port 80
- Restart XAMPP Control Panel

### phpMyAdmin Tidak Bisa Diakses
- Pastikan Apache running (hijau)
- Coba `http://localhost:8080/phpmyadmin`
- Clear browser cache

### Import Gagal
- Pastikan file `database-mysql-setup.sql` ada
- Check file permissions
- Coba import bagian per bagian

### Connection Error
- Verify MySQL service running
- Check credentials di .env
- Test dengan DBeaver jika perlu

## 🎉 Next Steps

Setelah database siap:
1. **Start backend server:** `npm run dev`
2. **Buka user interface:** `src/user-data-table.html`
3. **Test signup/login** via aplikasi
4. **Monitor user data** di phpMyAdmin

---

**📌 Quick Access Links:**
- XAMPP Control Panel: `C:\xampp\xampp-control.exe`
- phpMyAdmin: `http://localhost/phpmyadmin`
- User Management: `be-travello/src/user-data-table.html`

**✅ Database travello_db siap digunakan!**
