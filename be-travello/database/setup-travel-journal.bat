@echo off
echo Setting up Travel Journal Database...
echo.

REM Run the travel journal SQL setup using Laragon MySQL
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
    echo ❌ Error setting up travel journal database!
    echo Please ensure:
    echo    1. Laragon MySQL is running
    echo    2. Database 'travello' exists
    echo    3. MySQL root password is correct
    echo.
)

pause
