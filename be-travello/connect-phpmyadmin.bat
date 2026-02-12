@echo off
echo Connecting to phpMyAdmin...
echo.

REM Check for XAMPP
if exist "C:\xampp\htdocs" (
    echo Found XAMPP installation
    echo Opening phpMyAdmin...
    start http://localhost/phpmyadmin
    goto :success
)

REM Check for Laragon
if exist "C:\laragon\www" (
    echo Found Laragon installation
    echo Opening phpMyAdmin...
    start http://localhost/phpmyadmin
    goto :success
)

REM Check for common MySQL ports
echo Checking for MySQL on common ports...
timeout /t 2 >nul

echo Trying localhost:8080/phpmyadmin...
start http://localhost:8080/phpmyadmin
timeout /t 2 >nul

echo Trying localhost:8081/phpmyadmin...
start http://localhost:8081/phpmyadmin
timeout /t 2 >nul

echo Trying default port 80/phpmyadmin...
start http://localhost/phpmyadmin

:success
echo.
echo ✅ phpMyAdmin should open in your browser
echo Default credentials:
echo - Username: root
echo - Password: (leave blank for XAMPP/Laragon default)
echo.
echo If phpMyAdmin doesn't open, please check:
echo 1. XAMPP/Laragon is running
echo 2. Apache and MySQL services are started
echo 3. Try different ports: 80, 8080, 8081
echo.
pause
