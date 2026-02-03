=======================================
PANDUAN SETUP DATABASE PHPMYADMIN
UNTUK RIWAYAT TRANSAKSI TRAVELLO
=======================================

File ini berisi instruksi lengkap untuk setup database
phpMyAdmin agar dapat menampilkan riwayat transaksi.

📋 PERSIAPAN:
1. Pastikan XAMPP/WAMP sudah terinstall dan running
2. Pastikan MySQL service aktif
3. Buka phpMyAdmin via http://localhost/phpmyadmin

🗄️ LANGKAH-LANGKAH SETUP:

LANGKAH 1: BUAT DATABASE
1. Buka phpMyAdmin
2. Klik tab "Database"
3. Create new database: "travello_db"
4. Collation: "utf8mb4_unicode_ci"
5. Klik "Create"

LANGKAH 2: IMPORT SQL FILE
1. Pilih database "travello_db" (klik nama database)
2. Klik tab "Import"
3. Choose file: "be-travello/database/phpmyadmin-setup.sql"
4. Format: SQL
5. Klik "Go" atau "Import"

LANGKAH 3: VERIFIKASI TABEL
Setelah import berhasil, seharusnya ada tabel-tabel berikut:
✓ users (tabel user authentication)
✓ login_history (riwayat login)
✓ payments (riwayat pembayaran utama)
✓ payment_transactions (detail transaksi)
✓ payment_methods (konfigurasi metode pembayaran)

LANGKAH 4: CEK DATA SAMPEL
1. Klik tabel "payments"
2. Seharusnya ada data sampel:
   - pay_001: Credit card payment - Bali Resort
   - pay_002: E-wallet payment - GoCar
   - pay_003: Bank transfer - Yogyakarta Tour

LANGKAH 5: CEK VIEWS
1. Klik tab "SQL"
2. Jalankan query: SHOW TABLES;
3. Jalankan query: SELECT * FROM admin_transactions;
4. Seharusnya muncul data transaksi dengan format admin

🔧 TABEL YANG AKAN DIBUAT:

1. USERS TABLE
   - id, username, email, password
   - google_id, display_name, provider
   - role, is_email_verified, last_login

2. PAYMENTS TABLE
   - id (transaction ID)
   - user_id, method, amount, currency
   - description, booking_id, customer_info
   - status, payment_gateway_response
   - created_at, updated_at

3. PAYMENT_TRANSACTIONS TABLE
   - id, payment_id, type, amount
   - description, gateway_transaction_id
   - status, created_at, updated_at

4. PAYMENT_METHODS TABLE
   - id, name, display_name, description
   - icon, fees, fixed_fee
   - min_amount, max_amount, is_active

📊 VIEWS YANG AKAN DIBUAT:

1. ADMIN_TRANSACTIONS VIEW
   - Gabungan data payments + users
   - Format khusus untuk admin panel
   - Include seller name mapping

2. PAYMENT_STATS VIEW
   - Statistik pembayaran per user
   - Total payments, completed, pending
   - Total amount, average amount

3. PAYMENT_METHOD_PERFORMANCE VIEW
   - Performa setiap metode pembayaran
   - Usage count, success rate
   - Total volume per method

🔐 STORED PROCEDURES:

1. GetUserLoginHistory()
   - Parameter: user_id, limit
   - Return: riwayat login user

2. GetAllTransactions()
   - Parameter: page, limit, status_filter, search_term
   - Return: transaksi dengan pagination

3. UpdateTransactionStatus()
   - Parameter: transaction_id, new_status, admin_user_id
   - Return: update status + log activity

4. GetPaymentStats()
   - Parameter: date_range
   - Return: statistik pembayaran

📝 DATA SAMPEL:

USERS:
- admin-001 (admin@travello.com)
- user-001 (user@example.com)

PAYMENTS:
- pay_001: Credit card - Rp 150.000 (completed)
- pay_002: E-wallet - Rp 75.000 (completed)  
- pay_003: Bank transfer - Rp 250.000 (pending)

PAYMENT_METHODS:
- credit_card: 2.9% fee
- ewallet: 1.5% fee
- bank_transfer: 0% fee
- virtual_account: 0% fee

🚀 SETELAH SETUP:

1. Backend API sudah bisa mengakses data
2. Admin transactions page akan menampilkan data real
3. Filter dan search akan berfungsi
4. Export CSV akan tersedia
5. Update status akan tersimpan ke database

🔍 TESTING:

1. Buka admin panel: http://localhost:5173/admin/transactions
2. Login sebagai admin
3. Seharusnya muncul data transaksi dari database
4. Test filter status, search, dan pagination
5. Test update status transaksi

❓ TROUBLESHOOTING:

Jika ada error:
1. Pastikan MySQL service running
2. Pastikan file SQL tidak corrupted
3. Check character encoding (utf8mb4)
4. Pastikan privileges user cukup
5. Restart MySQL jika perlu

✅ VERIFIKASI SUKSES:

Jika setup berhasil:
- Semua tabel tercreate tanpa error
- Data sampel terinsert
- Views berfungsi
- Stored procedures tercreate
- Admin panel menampilkan data

=======================================
SELESAI - DATABASE SIAP DIGUNAKAN
=======================================
