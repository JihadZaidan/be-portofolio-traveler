@echo off
echo ========================================
echo SETUP USER-ADMIN CHAT SYSTEM
echo ========================================

echo.
echo [1/4] Setting up database schema...
mysql -u root -p < database\user-admin-chat-schema.sql
if %errorlevel% neq 0 (
    echo ❌ Database setup failed!
    pause
    exit /b 1
)
echo ✅ Database schema created successfully!

echo.
echo [2/4] Installing dependencies...
cd be-travello
call npm install socket.io
call npm install uuid
if %errorlevel% neq 0 (
    echo ❌ Dependency installation failed!
    pause
    exit /b 1
)
echo ✅ Dependencies installed!

echo.
echo [3/4] Starting backend server...
start "Backend Server" cmd /k "node src\server.js"
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Opening test page...
start http://localhost:3000/test-user-admin-chat.html

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo 📱 Test page opened in browser
echo 🖥️ Backend server running on port 3000
echo.
echo Test Instructions:
echo 1. Open test page in browser
echo 2. Select role (User or Admin)
echo 3. Open another browser tab/window
echo 4. Select opposite role
echo 5. Start chatting!
echo.
echo Frontend URLs:
echo - User Chat: http://localhost:5173/chat
echo - Admin Chat: http://localhost:5173/admin/chat-new
echo.
echo Press any key to exit...
pause >nul
