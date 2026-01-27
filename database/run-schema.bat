@echo off
echo Creating TRAVELLO SQLite Database Schema...
echo.

REM Check if sqlite3 is available
sqlite3 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo SQLite3 not found. Please install SQLite3 first.
    echo Download from: https://sqlite.org/download.html
    echo.
    echo Alternative: Use DBeaver to run the schema manually:
    echo 1. Open DBeaver
    echo 2. Connect to travello.db
    echo 3. Open SQL Editor
    echo 4. Copy-paste quick-setup.sql content
    echo 5. Execute (F5)
    echo.
    pause
    exit /b 1
)

REM Create database schema
echo Running schema from quick-setup.sql...
sqlite3 travello.db ".read quick-setup.sql"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database schema created successfully!
    echo 📍 Location: %cd%\travello.db
    echo.
    echo 📊 Created tables:
    sqlite3 travello.db ".tables"
    echo.
    echo 🎉 Next steps:
    echo    1. Open DBeaver
    echo    2. Connect to: %cd%\travello.db
    echo    3. Create ERD: Database → ER Diagrams → Create ER Diagram
    echo.
) else (
    echo ❌ Error creating database schema!
    echo.
    echo Manual setup with DBeaver:
    echo 1. Open DBeaver
    echo 2. Connect to travello.db
    echo 3. Open SQL Editor
    echo 4. Copy all SQL from quick-setup.sql
    echo 5. Execute (F5)
    echo.
)

pause
