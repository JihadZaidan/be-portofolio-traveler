@echo off
echo Setting up Travello Shop Database...
echo.

REM Check if XAMPP MySQL is available
if exist "C:\xampp\mysql\bin\mysql.exe" (
    echo Found XAMPP MySQL
    set MYSQL_PATH=C:\xampp\mysql\bin
    goto :setup
)

REM Check if Laragon MySQL is available  
if exist "C:\laragon\bin\mysql\bin\mysql.exe" (
    echo Found Laragon MySQL
    set MYSQL_PATH=C:\laragon\bin\mysql\bin
    goto :setup
)

REM Check if MySQL is in PATH
where mysql >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Found MySQL in PATH
    set MYSQL_PATH=mysql
    goto :setup
)

echo MySQL not found. Please install XAMPP, Laragon, or MySQL.
echo.
pause
exit /b 1

:setup
echo.
echo Creating database and tables...
"%MYSQL_PATH%\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS travello_shop;"

REM Import the shop database setup
"%MYSQL_PATH%\mysql.exe" -u root travello_shop < database\shop-database-setup.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database setup completed successfully!
    echo Database: travello_shop
    echo Tables: shop_products, shop_product_details, shop_product_advantages, shop_product_packages
    echo.
    echo You can now run: node server-with-database.js
) else (
    echo.
    echo ❌ Database setup failed!
    echo Please check MySQL installation and permissions.
)

echo.
pause
