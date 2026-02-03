# 🚀 Langkah-Langkah Lengkap Setup Database & User Management

## 📋 Step-by-Step Instructions

### 🔧 Step 1: Persiapkan XAMPP
1. **Buka XAMPP Control Panel**
   - Start Menu → XAMPP → XAMPP Control Panel
   - Atau jalankan: `C:\xampp\xampp-control.exe`

2. **Start Services**
   - Klik **Start** pada **Apache**
   - Klik **Start** pada **MySQL**
   - Pastikan kedua service berwarna **hijau**

### 🌐 Step 2: Akses phpMyAdmin
1. **Buka Browser**
   - Chrome/Firefox/Edge
   - Ketik: `http://localhost/phpmyadmin`

2. **Login ke phpMyAdmin**
   - Username: `root`
   - Password: (kosongkan, langsung klik **Go**)

### 🗄️ Step 3: Buat Database
1. **Create New Database**
   - Klik **"New"** di sidebar kiri
   - Masukkan nama: `travello_db`
   - Pilih collation: `utf8mb4_unicode_ci`
   - Klik **"Create"**

### 📥 Step 4: Import Schema
1. **Import Database Schema**
   - Pilih database `travello_db` (klik nama di sidebar)
   - Klik tab **"Import"** di bagian atas
   - Klik **"Choose file"**
   - Navigate ke: `be-travello/database-mysql-setup.sql`
   - Klik **"Go"** untuk import

2. **Verify Import Success**
   - Akan muncul 6 tabel:
     - ✅ `users`
     - ✅ `login_history` 
     - ✅ `user_sessions`
     - ✅ `chat_messages`
     - ✅ `travel_knowledge`
     - ✅ `user_stats`

### ⚙️ Step 5: Konfigurasi Environment
1. **Buat/Copy .env File**
   ```bash
   cd be-travello
   copy .env.example .env
   ```

2. **Edit .env File**
   - Buka file `.env` dengan text editor
   - Update database configuration:
   ```env
   # Database Configuration
   DATABASE_TYPE=mysql
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DATABASE=travello_db
   MYSQL_USER=root
   MYSQL_PASSWORD=
   ```

### 🚀 Step 6: Start Backend Server
1. **Install Dependencies** (jika belum)
   ```bash
   cd be-travello
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   - Server akan running di `http://localhost:5000`

### 📊 Step 7: Test User Management Interface
1. **Buka User Management Table**
   - Buka file: `be-travello/src/user-data-table.html`
   - Atau double-click file tersebut di browser

2. **Verify Data Loading**
   - Table akan menampilkan 2 sample users:
     - **admin** (admin@travello.com)
     - **testuser** (user@travello.com)

### 🔍 Step 8: Test Database Connection
1. **Manual Test via phpMyAdmin**
   - Buka `http://localhost/phpmyadmin`
   - Pilih database `travello_db`
   - Klik tabel `users`
   - Browse data untuk verify sample users

2. **Test via Command Line**
   ```bash
   # Buka Command Prompt/PowerShell
   cd C:\xampp\mysql\bin
   
   # Test connection
   mysql.exe -u root -e "SELECT COUNT(*) as total FROM users;" travello_db
   ```

### 🧪 Step 9: Test User Registration & Login
1. **Test Manual Signup**
   - Buka aplikasi frontend
   - Register new user dengan email & password
   - Verify user muncul di database

2. **Test OAuth Login** (jika sudah setup)
   - Test Google OAuth login
   - Test GitHub OAuth login
   - Verify data di tabel `users` dan `login_history`

### 📈 Step 10: Monitor User Activity
1. **Via phpMyAdmin**
   - Browse tabel `users` untuk data user
   - Browse tabel `login_history` untuk riwayat login
   - Browse tabel `chat_messages` untuk chat history

2. **Via User Management Interface**
   - Buka `user-data-table.html`
   - Gunakan filter untuk mencari user
   - Test add/edit/delete user functions

---

## 🎯 Quick Reference Commands

### Database Operations
```sql
-- Create database
CREATE DATABASE travello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use database
USE travello_db;

-- Show tables
SHOW TABLES;

-- Show users
SELECT * FROM users;

-- Show login history
SELECT * FROM login_history ORDER BY login_time DESC LIMIT 10;
```

### Command Line Operations
```bash
# Start XAMPP services
"C:\xampp\xampp-control.exe"

# Test MySQL connection
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "SHOW DATABASES;"

# Import schema (alternative method)
Get-Content "database-mysql-setup.sql" | & "C:\xampp\mysql\bin\mysql.exe" -u root travello_db
```

### Node.js Operations
```bash
# Start backend server
cd be-travello
npm run dev

# Test database connection
node -e "import('./src/config/database-mysql.config.js').then(m => m.testConnection())"
```

---

## 🔧 Troubleshooting Guide

### ❌ XAMPP Services Tidak Start
**Problem:** Apache/MySQL tidak bisa start
**Solution:**
- Check port conflicts (Skype/Zoom using port 80)
- Restart XAMPP Control Panel
- Run as Administrator

### ❌ phpMyAdmin Tidak Bisa Diakses
**Problem:** `http://localhost/phpmyadmin` error
**Solution:**
- Pastikan Apache running (hijau)
- Coba alternative port: `http://localhost:8080/phpmyadmin`
- Clear browser cache

### ❌ Database Connection Error
**Problem:** Backend tidak bisa connect ke MySQL
**Solution:**
- Verify MySQL service running
- Check .env configuration
- Test connection via phpMyAdmin

### ❌ Import Schema Gagal
**Problem:** SQL import error
**Solution:**
- Verify file `database-mysql-setup.sql` exists
- Check file permissions
- Import bagian per bagian jika perlu

### ❌ User Data Tidak Muncul
**Problem:** Table kosong di interface
**Solution:**
- Check API endpoint running
- Verify database connection
- Check browser console for errors

---

## ✅ Verification Checklist

### Database Setup
- [ ] XAMPP Apache running
- [ ] XAMPP MySQL running  
- [ ] Database `travello_db` created
- [ ] 6 tables imported successfully
- [ ] Sample users exist

### Application Setup
- [ ] .env file configured
- [ ] Backend server running on port 5000
- [ ] Database connection successful
- [ ] User management interface accessible

### Testing
- [ ] Manual signup works
- [ ] Manual login works
- [ ] User data appears in phpMyAdmin
- [ ] User data appears in management interface
- [ ] Login history tracking works

---

## 🎉 Success Indicators

✅ **Database Ready:** 6 tables created with sample data  
✅ **Backend Running:** API server accessible on port 5000  
✅ **Interface Working:** User management table loads data  
✅ **Data Flow:** New users appear in database after signup  
✅ **Tracking:** Login history recorded correctly  

---

**🚀 Your MySQL database with user management system is now fully operational!**
