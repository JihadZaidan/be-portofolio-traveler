@echo off
title Setup Travello for Laragon
color 0B
echo.
echo ========================================
echo     TRAVELLO - LARAGON SETUP
echo ========================================
echo.
echo 🚀 Setting up Travello for Laragon...
echo.

:: Check if Laragon is installed
if not exist "C:\laragon" (
    echo ❌ Laragon not found at C:\laragon
    echo    Please install Laragon first: https://laragon.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Laragon found at C:\laragon

:: Create project directory in Laragon www
echo [1/4] Creating project directory...
if not exist "C:\laragon\www\travello" (
    mkdir "C:\laragon\www\travello"
    echo ✅ Created: C:\laragon\www\travello
) else (
    echo ✅ Directory already exists: C:\laragon\www\travello
)

:: Copy frontend files to Laragon www
echo [2/4] Copying frontend files...
xcopy "C:\Users\ACER\workandshop\fe-travello\*" "C:\laragon\www\travello\" /E /I /H /Y
echo ✅ Frontend files copied to Laragon www

:: Create virtual host configuration
echo [3/4] Setting up virtual host...
copy "C:\Users\ACER\workandshop\laragon-vhost-travello.conf" "C:\laragon\etc\apache2\sites-enabled\travello.conf" /Y
echo ✅ Virtual host configured

:: Update Windows hosts file
echo [4/4] Updating hosts file...
echo 127.0.0.1 travello.local >> %SystemRoot%\System32\drivers\etc\hosts
echo ✅ Added travello.local to hosts file

echo.
echo ========================================
echo     ✅ SETUP COMPLETED!
echo ========================================
echo.
echo 📋 Next Steps:
echo    1. Restart Laragon (click Menu → Restart All)
echo    2. Start Apache and MySQL in Laragon
echo    3. Run backend: cd be-travello && npm run laragon
echo    4. Access: http://travello.local
echo.
echo 🌐 Access URLs:
echo    • Frontend: http://travello.local
echo    • API: http://travello.local/api
echo    • phpMyAdmin: http://localhost/phpmyadmin
echo.
echo 💡 Notes:
echo    • Backend runs on port 5000 (Node.js)
echo    • Frontend served by Apache via virtual host
echo    • Database: travello_db in Laragon MySQL
echo.
echo ⚠️  Important:
echo    • Make sure Node.js is installed
echo    • Run npm install in be-travello folder
echo    • Create travello_db in phpMyAdmin
echo.
echo Press any key to exit...
pause >nul
