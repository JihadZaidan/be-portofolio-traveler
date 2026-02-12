# Setup Database Travello Shop via phpMyAdmin

## 📋 Langkah-langkah:

### 1. Buka phpMyAdmin
- Jalankan file: `.\connect-phpmyadmin.bat`
- Atau buka manual: http://localhost/phpmyadmin
- Login dengan username: `root`, password: (kosong)

### 2. Buat Database
- Klik tab "New" di sidebar kiri
- Masukkan nama database: `travello_shop`
- Pilih collation: `utf8mb4_unicode_ci`
- Klik "Create"

### 3. Import SQL Script
- Pilih database `travello_shop`
- Klik tab "Import"
- Pilih file: `create-travello-shop.sql`
- Klik "Go"

### 4. Verifikasi Setup
Setelah import, seharusnya muncul:
- ✅ Database `travello_shop` terbuat
- ✅ Table `shop_products` terbuat
- ✅ 3 sample data terinsert

### 5. Test Connection
Setelah database siap, jalankan:
```bash
node server-with-database.js
```

## 🔧 Jika ada error:

### Error: "Access denied for user 'root'@'localhost'"
- Pastikan MySQL/Laragon/XAMPP sudah running
- Coba password default Laragon: (kosong)
- Coba password default XAMPP: (kosong) atau "root"

### Error: "Can't connect to MySQL server"
- Start MySQL service di Laragon/XAMPP
- Check port: biasanya 3306
- Restart MySQL service

### Error: "Database doesn't exist"
- Jalankan step 1-3 lagi
- Pastikan nama database: `travello_shop`

## 📊 Database Structure:

Table: `shop_products`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `title` (VARCHAR 500)
- `description` (TEXT)
- `image_src` (VARCHAR 500)
- `price` (DECIMAL 10,2)
- `delivery_time` (VARCHAR 100)
- `service_category` (VARCHAR 100)
- `status` (ENUM: 'active', 'inactive')
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

## 🚀 Next Steps:

Setelah database siap:
1. Stop server file-based: `Ctrl+C` di terminal
2. Start server database: `node server-with-database.js`
3. Test admin shop: http://localhost:5173/admin/shop
4. Test public shop: http://localhost:5173/work/shop

Data akan persist di MySQL database! 🎉
