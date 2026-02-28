@echo off
echo Setting up SHOP USERS table in travello_db...
echo.

REM Check if mysql is available
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo MySQL not found. Please install MySQL first.
    echo.
    echo Alternative: Use phpMyAdmin to run the SQL manually:
    echo 1. Open phpMyAdmin
    echo 2. Select travello_db database
    echo 3. Open SQL tab
    echo 4. Copy-paste shop-users-table-setup.sql content
    echo 5. Execute
    echo.
    pause
    exit /b 1
)

REM Run the shop users table setup
echo Running shop users table setup...
mysql -u root travello_db < shop-users-table-setup.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ Shop users table created successfully!
    echo.
    echo 📊 Created tables:
    mysql -u root travello_db -e "SHOW TABLES LIKE 'shop_%';"
    echo.
    echo 🎉 Next steps:
    echo    1. Restart the backend server
    echo    2. Test the admin user list page
    echo.
) else (
    echo ❌ Error creating shop users table!
    echo.
    echo Manual setup with phpMyAdmin:
    echo 1. Open phpMyAdmin
    echo 2. Select travello_db database
    echo 3. Open SQL tab
    echo 4. Copy all SQL from shop-users-table-setup.sql
    echo 5. Execute
    echo.
)

pause
