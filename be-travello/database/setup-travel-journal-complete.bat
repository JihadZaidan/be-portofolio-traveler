@echo off
echo Creating Travello Database and Setting up Travel Journal...
echo.

REM Create the database first
"C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS travello;"

if %errorlevel% neq 0 (
    echo ❌ Failed to create database!
    pause
    exit /b 1
)

echo ✅ Database 'travello' created or already exists
echo.

REM Run the travel journal SQL setup
"C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe" -u root travello < "create_travel_journals.sql"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Travel journal database setup completed successfully!
    echo.
    echo 📊 Created/Updated:
    echo    • travel_journals table
    echo    • Sample data for Bali and Tokyo
    echo.
) else (
    echo ❌ Error setting up travel journal table!
    echo.
)

pause
