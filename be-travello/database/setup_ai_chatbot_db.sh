#!/bin/bash

echo "====================================================="
echo "Setting up AI Chatbot Database"
echo "====================================================="
echo

# Set database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-ai_chatbot_db}

echo "Database Host: $DB_HOST"
echo "Database Port: $DB_PORT"
echo "Database User: $DB_USER"
echo "Database Name: $DB_NAME"
echo

# Check if MySQL is available
if ! command -v mysql &> /dev/null; then
    echo "ERROR: MySQL is not installed or not in PATH"
    echo "Please install MySQL and add it to system PATH"
    exit 1
fi

echo "MySQL detected successfully"
echo

# Create database and tables
echo "Creating AI Chatbot database and tables..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_PASSWORD" < "ai_chatbot_database.sql"

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create AI Chatbot database"
    echo "Please check your MySQL connection parameters"
    exit 1
fi

echo
echo "====================================================="
echo "AI Chatbot Database Setup Complete!"
echo "====================================================="
echo
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo
echo "Tables created:"
echo "- ai_chat_sessions"
echo "- ai_chat_messages"
echo "- ai_suggestions"
echo "- ai_knowledge_base"
echo "- ai_analytics"
echo "- ai_feedback"
echo "- ai_training_data"
echo
echo "Sample data has been inserted for testing"
echo
echo "You can now start the application and test the AI Chatbot"
echo
