@echo off
title Travello - Laragon Edition
color 0A
echo.
echo ========================================
echo     TRAVELLO - LARAGON EDITION
echo ========================================
echo.
echo 🚀 Starting Travello with Laragon...
echo.

:: Check if Laragon is running
echo [1/5] Checking Laragon services...
tasklist | find "Laragon.exe" >nul
if %errorlevel% neq 0 (
    echo ❌ Laragon is not running!
    echo    Please start Laragon and start Apache + MySQL
    echo    Download Laragon from: https://laragon.org/
    echo.
    echo 🔄 Attempting to continue without Laragon...
    echo.
) else (
    echo ✅ Laragon is running
)

:: Check Apache service
tasklist | find "httpd.exe" >nul
if %errorlevel% neq 0 (
    echo ⚠️  Laragon Apache is not running
    echo    Please start Apache in Laragon
    echo.
) else (
    echo ✅ Laragon Apache is running (Port 80)
)

:: Check MySQL service
tasklist | find "mysqld.exe" >nul
if %errorlevel% neq 0 (
    echo ⚠️  Laragon MySQL is not running
    echo    Please start MySQL in Laragon
    echo    Database connection will fail
    echo.
) else (
    echo ✅ Laragon MySQL is running (Port 3306)
)

:: Start Backend Server
echo [2/5] Starting Backend Server...
cd /d "C:\Users\ACER\workandshop\be-travello"
echo 📡 Starting backend on port 5000...
start "Backend Server" cmd /k "title Backend Server && color 0B && node server-minimal.js"

:: Wait for backend to start
timeout /t 3 >nul
echo ✅ Backend server started

:: Start Frontend Server
echo [3/5] Starting Frontend Server...
cd /d "C:\Users\ACER\workandshop\fe-travello"
echo 🎨 Starting frontend on port 5173...
start "Frontend Server" cmd /k "title Frontend Server && color 0C && npm run dev"

:: Wait for frontend to start
timeout /t 5 >nul
echo ✅ Frontend server started

:: Open phpMyAdmin
echo [4/5] Opening phpMyAdmin...
timeout /t 2 >nul
start http://localhost/phpmyadmin

:: Open Main Site
echo [5/5] Opening Travello Application...
timeout /t 2 >nul
start http://localhost:5173

echo.
echo ========================================
echo     ✅ TRAVELLO LARAGON EDITION READY!
echo ========================================
echo.
echo 📋 Access Links:
echo    🌐 Main Site:     http://localhost:5173
echo    🔌 API Backend:   http://localhost:5000
echo    🗄️ phpMyAdmin:    http://localhost/phpmyadmin
echo    🏥 Health Check:  http://localhost:5000/health
echo.
echo 🛠️ Laragon Configuration:
echo    📊 MySQL Port:    3306 (Laragon default)
echo    🌍 Apache Port:   80 (Laragon default)
echo    📁 Web Root:      C:\laragon\www
echo.
echo 💡 Quick Commands:
echo    - Stop all: Close terminal windows or press Ctrl+C
echo    - Restart: Run this script again
echo    - Database: Access via phpMyAdmin link above
echo.
echo 🔄 Development Mode:
echo    - Hot reload enabled for frontend
echo    - Auto-restart on file changes (if using nodemon)
echo    - Database persistence enabled
echo.
echo ⏰ Waiting for user input...
echo Press any key to exit this window...
pause >nul
