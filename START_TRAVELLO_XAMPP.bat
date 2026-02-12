@echo off
echo ========================================
echo       TRAVELLO - XAMPP STARTUP
echo ========================================
echo.

:: Check if XAMPP is installed
if not exist "C:\xampp" (
    echo ❌ XAMPP not found in C:\xampp
    echo 💡 Please install XAMPP first
    pause
    exit /b 1
)

:: Start XAMPP MySQL
echo 🔄 Starting XAMPP MySQL...
cd /d "C:\xampp"
start mysql\bin\mysqld.exe --defaults-file=mysql\bin\my.ini --standalone --console

:: Wait for MySQL to start
echo ⏳ Waiting for MySQL to start...
timeout /t 10 /nobreak >nul

:: Check if MySQL is running
echo 🔍 Checking MySQL connection...
mysql\bin\mysql.exe -u root -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL failed to start
    echo 💡 Check XAMPP Control Panel
    pause
    exit /b 1
)

echo ✅ MySQL started successfully
echo.

:: Start backend server
echo 🚀 Starting Travello Backend...
cd /d "%~dp0be-travello"
start "Travello Backend" cmd /k "npm start"

:: Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

:: Start frontend server
echo 🚀 Starting Travello Frontend...
cd /d "%~dp0fe-travello"
start "Travello Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo       ✅ ALL SERVICES STARTED
echo ========================================
echo 📍 Frontend: http://localhost:5173
echo 📍 Backend:  http://localhost:5000
echo 📍 phpMyAdmin: http://localhost/phpmyadmin
echo.
echo 💡 Press any key to stop all services...
pause >nul

:: Stop services
echo 🛑 Stopping services...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im mysqld.exe >nul 2>&1
echo ✅ All services stopped
pause
