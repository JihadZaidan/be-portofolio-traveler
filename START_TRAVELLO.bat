@echo off
title Travel Journal Management System
color 0A
echo.
echo ========================================
echo     TRAVEL JOURNAL MANAGEMENT SYSTEM
echo ========================================
echo.
echo 🚀 Starting Travel Journal Services...
echo.

:: Check if XAMPP is running
echo [1/4] Checking XAMPP services...
tasklist | find "httpd.exe" >nul
if %errorlevel% neq 0 (
    echo ❌ XAMPP Apache is not running!
    echo    Please start XAMPP Control Panel and start Apache service
    echo    Download XAMPP from: https://www.apachefriends.org/
    echo.
    echo 🔄 Attempting to continue without Apache...
    echo.
) else (
    echo ✅ XAMPP Apache is running
)

:: Check MySQL (optional for in-memory mode)
tasklist | find "mysqld.exe" >nul
if %errorlevel% neq 0 (
    echo ⚠️  XAMPP MySQL is not running (optional for current mode)
    echo    Current mode: In-Memory Storage (no database required)
    echo.
) else (
    echo ✅ XAMPP MySQL is running
)

:: Start Backend Server
echo [2/4] Starting Backend Server...
cd /d "C:\Users\ACER\workandshop\be-travello"
echo 📡 Starting backend on port 5000...
start "Backend Server" cmd /k "title Backend Server && color 0B && node server-minimal.js" /k

:: Wait for backend to start
timeout /t 3 >nul
echo ✅ Backend server started

:: Start Frontend Server
echo [3/4] Starting Frontend Server...
cd /d "C:\Users\ACER\workandshop\fe-travello"
echo 🎨 Starting frontend on port 5173...
start "Frontend Server" cmd /k "title Frontend Server && color 0C && npm run dev" /k

:: Wait for frontend to start
timeout /t 5 >nul
echo ✅ Frontend server started

:: Open Admin Panel
echo [4/4] Opening Admin Panel...
timeout /t 2 >nul
start http://localhost:5173/admin/landing/travel-journal

:: Open Main Site
timeout /t 2 >nul
start http://localhost:5173

echo.
echo ========================================
echo     ✅ ALL SERVICES STARTED SUCCESSFULLY!
echo ========================================
echo.
echo 📋 Access Links:
echo    🎨 Admin Panel: http://localhost:5173/admin/landing/travel-journal
echo    🌐 Main Site:   http://localhost:5173
echo    🔌 API Info:    http://localhost:5000/api
echo    📊 Database:   In-Memory Mode
echo.
echo 🛠️ Quick Commands:
echo    - Stop all: Close terminal windows or press Ctrl+C
echo    - Restart: Run this script again
echo    - Debug: Run RESTART_TRAVELLO.bat for restart only
echo.
echo 💡 System Info:
echo    - Storage: In-Memory (server restart = data reset)
echo    - Auto-cleanup: Every hour (24h expiry)
echo    - Sample Data: Bali (7d), Tokyo (echo 14d)
echo.
echo 🔄 Auto-Startup:
echo    - For auto-start on Windows boot, see AUTO_STARTUP_GUIDE.md
echo    - Or add to Windows Task Scheduler
echo.
echo ⏰ Waiting for user input...
echo Press any key to exit this window...
pause >nul
