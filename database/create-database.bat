@echo off
echo Creating TRAVELLO SQLite Database...
echo.

REM Check if sqlite3 is available
sqlite3 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo SQLite3 not found. Please install SQLite3 first.
    echo Download from: https://sqlite.org/download.html
    pause
    exit /b 1
)

REM Create database
echo Creating database schema...
sqlite3 travello.db < ..\database-setup.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database created successfully!
    echo 📍 Location: %cd%\travello.db
    echo.
    echo 🐬 Now you can connect with DBeaver:
    echo    1. Open DBeaver
    echo    2. File → New → Database Connection
    echo    3. Select SQLite
    echo    4. Path: %cd%\travello.db
    echo    5. Test Connection → Finish
    echo.
    echo 📊 Database contains:
    echo    • users table (with sample admin/test users)
    echo    • chat_messages table
    echo    • user_sessions table  
    echo    • travel_knowledge table
    echo    • Indexes and views for performance
    echo.
) else (
    echo ❌ Error creating database!
    pause
)

echo Press any key to exit...
pause >nul
