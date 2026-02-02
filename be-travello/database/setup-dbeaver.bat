@echo off
echo ========================================
echo    TRAVELLO Database Setup for DBeaver
echo ========================================
echo.

echo [1/3] Checking database file...
if not exist "database\travello.db" (
    echo ❌ Database file not found!
    echo Please make sure travello.db exists in database folder
    pause
    exit /b 1
)

echo ✅ Database file found
echo.

echo [2/3] Database files ready:
echo   📄 Database: database\travello.db
echo   📄 Schema: database\quick-setup.sql  
echo   📄 Users: database\insert-users.sql
echo   📄 Guide: database\dbeaver-user-setup.md
echo.

echo [3/3] Next steps:
echo   1. Open DBeaver
echo   2. Create new SQLite connection to: database\travello.db
echo   3. Run database\quick-setup.sql in SQL Editor
echo   4. Run database\insert-users.sql in SQL Editor
echo.

echo 📋 User data to be inserted:
echo   • testuser (test@example.com)
echo   • wrm23r13rn (wrm23r13rn@yahoo.com)  
echo   • imanueladmojo (admjrevo@gmail.com)
echo.

echo 📖 For detailed guide, open: database\dbeaver-user-setup.md
echo.

echo ✅ Setup files are ready! Please follow the steps in DBeaver.
echo.
pause
