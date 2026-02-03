🚀 SHOP DATABASE SETUP GUIDE

📋 YANG DIBUTUHKAN:
- XAMPP/WAMP yang sudah terinstall
- File: be-travello/database/shop-database-setup.sql

🔧 LANGKAH-LANGKAH:

1️⃣ START XAMPP/WAMP
- Buka XAMPP Control Panel
- Start Apache dan MySQL
- Tunggu sampai kedua service hijau

2️⃣ BUKA PHPMYADMIN
- Buka browser: http://localhost/phpmyadmin
- Login (biasanya root, tanpa password)

3️⃣ IMPORT SQL FILE
- Klik tab "Import"
- Pilih file: "be-travello/database/shop-database-setup.sql"
- Format: SQL (default)
- Klik tombol "Go" di bawah

4️⃣ VERIFIKASI HASIL
Setelah import berhasil:
- Database "travello_shop" akan terbuat
- Tabel-tabel akan tercreate:
  ✓ shop_products (3 produk sample)
  ✓ shop_product_details (detail produk)
  ✓ shop_product_advantages (keunggulan produk)
  ✓ shop_product_packages (paket & harga)
  ✓ shop_orders (pesanan pelanggan)
  ✓ shop_order_payments (pembayaran pesanan)

5️⃣ CEK DATA PRODUK
- Klik database "travello_shop"
- Klik tabel "shop_products"
- Seharusnya ada 3 data produk:
  1. SEO Content Writer (Rp 20.000) - active
  2. Human SEO Blogs (Rp 100.000) - active
  3. SEO Blog Posts (Rp 100.000) - inactive

6️⃣ CEK PAKET PRODUK
- Klik tabel "shop_product_packages"
- Seharusnya ada 3 paket untuk produk #1:
  ✓ Basic - Starter (500 words, Rp 20.000)
  ✓ Standard - Advance (1000 words, Rp 20.000)
  ✓ Premium - Premium Plus (1500 words, Rp 20.000)

7️⃣ CEK VIEW ADMIN
- Klik tab "SQL"
- Ketik: SELECT * FROM shop_products_complete;
- Klik "Go"
- Seharusnya muncul data produk lengkap dengan detail

📊 STRUKTUR DATABASE:

TABEL UTAMA:
- shop_products: Data produk (judul, harga, kategori, status)
- shop_product_details: Deskripsi lengkap produk
- shop_product_advantages: Keunggulan/fitur produk
- shop_product_packages: Paket layanan dengan harga

TABEL TRANSAKSI:
- shop_orders: Pesanan pelanggan
- shop_order_payments: Detail pembayaran pesanan

VIEW UNTUK ADMIN:
- shop_products_complete: Produk dengan semua detail
- shop_orders_complete: Pesanan lengkap dengan info produk
- shop_statistics: Statistik penjualan

🎯 SETELAH IMPORT BERHASIL:

1. Admin shop panel akan bisa baca data real
2. CRUD produk akan tersimpan ke database
3. Paket dan harga terintegrasi
4. Pesanan dan pembayaran tercatat

🔍 TESTING:

1. Start backend: cd be-travello && npm start
2. Start frontend: cd fe-travello && npm run dev  
3. Buka: http://localhost:5173/admin/shop
4. Seharusnya muncul 3 produk dari database
5. Test edit/ubah status produk
6. Test tambah produk baru

❓ JIKA ERROR:

"Database already exists":
- Hapus database travello_shop terlebih dahulu
- Atau gunakan DROP DATABASE travello_shop

"Table creation failed":
- Pastikan MySQL versi 5.7+ (support JSON)
- Cek charset dan collation

"Foreign key constraint fails":
- Import ulang dari awal
- Pastikan semua tabel tercreate dengan benar

✅ SUKSES INDICATOR:
- Semua SQL query berhasil tanpa error
- 6 tabel tercreate dengan benar
- Data sample terinsert (3 produk)
- View tercreate dan bisa di-query
- Admin panel menampilkan data real

🎉 SELESAI!
Database shop siap digunakan untuk admin shop management!
