🚀 CARA CEPAT MASUKKAN RIWAYAT TRANSAKSI KE PHPMYADMIN

📋 YANG DIBUTUHKAN:
- Laragon/XAMPP/WAMP yang sudah terinstall
- File: be-travello/database/import-transactions.sql

🔧 LANGKAH-LANGKAH:

1️⃣ START LARAGON/XAMPP/WAMP
- Buka Laragon Control Panel
- Start Apache dan MySQL
- Tunggu sampai kedua service hijau

2️⃣ BUKA PHPMYADMIN
- Buka browser: http://localhost/phpmyadmin
- Login (biasanya root, tanpa password)

3️⃣ IMPORT SQL FILE
- Klik tab "Import"
- Pilih file: "be-travello/database/import-transactions.sql"
- Format: SQL (default)
- Klik tombol "Go" di bawah

4️⃣ VERIFIKASI HASIL
Setelah import berhasil:
- Database "travello_db" akan terbuat
- Tabel-tabel akan tercreate:
  ✓ users (2 user sample)
  ✓ payments (10 transaksi sample)
  ✓ payment_transactions (detail transaksi)
  ✓ payment_methods (4 metode pembayaran)
  ✓ admin_transactions (view untuk admin panel)

5️⃣ CEK DATA TRANSAKSI
- Klik database "travello_db"
- Klik tabel "payments"
- Seharusnya ada 10 data transaksi
- Status: completed, pending, cancelled, refunded, processing

6️⃣ CEK ADMIN VIEW
- Klik tab "SQL"
- Ketik: SELECT * FROM admin_transactions;
- Klik "Go"
- Seharusnya muncul data dengan format admin panel

📊 DATA YANG AKAN MASUK:

USER:
- admin-001 (admin@travello.com)
- user-001 (john@example.com)

TRANSAKSI (10 data):
1. Hotel booking - Bali Resort (Rp 150.000) - completed
2. Transport booking - GoCar (Rp 75.000) - completed  
3. Tour package - Yogyakarta (Rp 250.000) - pending
4. SEO content writer (Rp 843.750) - completed
5. Desain logo profesional (Rp 2.250.000) - completed
6. Website landing page (Rp 7.500.000) - processing
7. Manajemen media sosial (Rp 1.125.000) - cancelled
8. Editing video cinematic (Rp 3.000.000) - completed
9. Optimasi SEO on-page (Rp 1.800.000) - refunded
10. Social media marketing (Rp 500.000) - pending

METODE PEMBAYARAN:
- Credit Card (2.9% fee)
- E-Wallet (1.5% fee)  
- Bank Transfer (0% fee)
- Virtual Account (0% fee)

🎯 SETELAH IMPORT BERHASIL:

1. Backend API akan bisa membaca data real
2. Admin panel akan menampilkan transaksi dari database
3. Filter status, search, pagination akan berfungsi
4. Update status akan tersimpan ke database

🔍 TESTING:

1. Start backend server: cd be-travello && npm start
2. Start frontend: cd fe-travello && npm run dev  
3. Buka: http://localhost:5173/admin/transactions
4. Login sebagai admin (admin@travello.com / admin123)
5. Seharusnya muncul 10 transaksi dari database

❓ JIKA ERROR:

"Cannot connect to MySQL server":
- Pastikan MySQL service running di Laragon/XAMPP

"Access denied for user":
- Cek username/password phpMyAdmin
- Default: root, tanpa password

"Database already exists":
- Hapus database travello_db terlebih dahulu
- Atau gunakan DROP DATABASE travello_db

✅ SUKSES INDICATOR:
- Semua SQL query berhasil tanpa error
- Tabel tercreate dengan benar
- Data sample terinsert
- Admin panel menampilkan data real

🎉 SELESAI!
Database siap digunakan untuk riwayat transaksi.
