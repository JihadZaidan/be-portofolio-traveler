@echo off
echo Setting up USERS table in travello_db...
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
    echo 4. Copy-paste users-table-setup.sql content
    echo 5. Execute
    echo.
    pause
    exit /b 1
)

REM Run the users table setup
echo Running users table setup...
mysql -u root travello_db < users-table-setup.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ Users table created successfully!
    echo.
    echo 📊 Created tables:
    mysql -u root travello_db -e "SHOW TABLES LIKE 'users';"
    mysql -u root travello_db -e "SHOW TABLES LIKE 'login_history';"
    echo.
    echo 👤 Sample users created:
    mysql -u root travello_db -e "SELECT id, username, email, role FROM users LIMIT 3;"
    echo.
    echo 🎉 Next steps:
    echo    1. Restart the backend server
    echo    2. Test login with: demo@travello.com / demo123
    echo    3. Check admin user list page
    echo.
) else (
    echo ❌ Error creating users table!
    echo.
    echo Manual setup with phpMyAdmin:
    echo 1. Open phpMyAdmin
    echo 2. Select travello_db database
    echo 3. Open SQL tab
    echo 4. Copy all SQL from users-table-setup.sql
    echo 5. Execute
    echo.
)

pause
