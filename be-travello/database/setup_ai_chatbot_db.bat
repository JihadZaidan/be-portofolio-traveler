@echo off
echo =====================================================
echo Setting up AI Chatbot Database
echo =====================================================
echo.

REM Set database connection parameters
set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=root
set DB_PASSWORD=
set DB_NAME=ai_chatbot_db

echo Database Host: %DB_HOST%
echo Database Port: %DB_PORT%
echo Database User: %DB_USER%
echo Database Name: %DB_NAME%
echo.

REM Check if MySQL is available
mysql --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: MySQL is not installed or not in PATH
    echo Please install MySQL and add it to system PATH
    pause
    exit /b 1
)

echo MySQL detected successfully
echo.

REM Create database and tables
echo Creating AI Chatbot database and tables...
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %DB_PASSWORD% < "ai_chatbot_database.sql"

if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to create AI Chatbot database
    echo Please check your MySQL connection parameters
    pause
    exit /b 1
)

echo.
echo =====================================================
echo AI Chatbot Database Setup Complete!
echo =====================================================
echo.
echo Database: %DB_NAME%
echo Host: %DB_HOST%:%DB_PORT%
echo.
echo Tables created:
echo - ai_chat_sessions
echo - ai_chat_messages  
echo - ai_suggestions
echo - ai_knowledge_base
echo - ai_analytics
echo - ai_feedback
echo - ai_training_data
echo.
echo Sample data has been inserted for testing
echo.
echo You can now start the application and test the AI Chatbot
echo.
pause
