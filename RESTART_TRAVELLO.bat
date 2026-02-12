@echo off
echo ========================================
echo Travel Journal Management System
echo ========================================
echo.
echo Starting all services...
echo.

echo 1. Checking if XAMPP is running...
tasklist | find "httpd.exe" >nul
if %errorlevel% neq 0 (
    echo ERROR: XAMPP Apache is not running!
    echo Please start XAMPP Control Panel and start Apache
    echo.
    pause
    exit /b 1
)
echo ✅ Apache is running

tasklist | find "mysqld.exe" >nul
if %errorlevel% neq 0 (
    echo WARNING: XAMPP MySQL is not running
    echo MySQL is optional for current in-memory mode
    echo.
)

echo.
echo 2. Starting Backend Server...
cd /d "C:\Users\ACER\workandshop\be-travello"
start "Backend Server" cmd /k "node server-minimal.js"

echo.
echo 3. Starting Frontend Server...
cd /d "C:\Users\ACER\workandshop\fe-travello"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 4. Opening Admin Panel...
timeout /t 3 >nul
start http://localhost:5173/admin/landing/travel-journal

echo.
echo 5. Opening Main Site...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo ========================================
echo ✅ All Services Started Successfully!
echo ========================================
echo.
echo 📋 Access Links:
echo    Admin Panel: http://localhost:5173/admin/landing/travel-journal
echo    Main Site:   http://localhost:5173
echo    API Info:    http://localhost:5000/api
echo.
echo 🛠️ Quick Commands:
echo    - Stop all: Ctrl+C in each terminal window
echo    - Restart: Close this script and run again
echo.
echo 💡 Tips:
echo    - Data is stored in memory (server restart = data reset)
    - Auto-cleanup runs every hour (24h expiry)
    - Check browser console for any errors
echo.
echo Press any key to exit...
pause >nul
