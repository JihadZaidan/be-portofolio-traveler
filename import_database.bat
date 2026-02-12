@echo off
echo ========================================
echo TRAVELLO DATABASE IMPORT HELPER
echo ========================================
echo.
echo Step 1: Opening phpMyAdmin...
start http://localhost/phpmyadmin
echo.
echo Step 2: Instructions:
echo 1. In phpMyAdmin, click on "SQL" tab
echo 2. Copy the entire content from: 
echo    c:\Users\ACER\workandshop\be-travello\database\phpmyadmin-setup.sql
echo 3. Paste in the SQL textarea
echo 4. Click "Go" button
echo.
echo Step 3: After import, verify:
echo - Database: travello_db
echo - Tables: users, payments, payment_transactions, payment_methods, login_history
echo - Admin user: admin@travello.com (password: admin123)
echo.
echo Opening SQL file for you to copy...
notepad c:\Users\ACER\workandshop\be-travello\database\phpmyadmin-setup.sql
echo.
echo Press any key to exit...
pause >nul
