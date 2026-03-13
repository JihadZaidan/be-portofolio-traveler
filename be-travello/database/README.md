# TRAVELLO Database

This folder contains all database-related files for the TRAVELLO application.

## Files

### Setup Files
- **`setup-master.sql`** - Master script to run all database setup in order
- **`01-users.sql`** - Users table and sample data
- **`02-transactions.sql`** - Transactions table and sample data  
- **`03-admin-chat.sql`** - Admin chat sessions table and sample data
- **`04-chat-messages.sql`** - Chat messages table and sample data
- **`05-views.sql`** - Reporting and analytics views
- **`06-procedures.sql`** - Stored procedures for common operations
- **`07-triggers.sql`** - Database triggers for automatic updates

## Usage

### Quick Setup (Recommended)
```bash
# Run master script (creates everything)
mysql -u username -p < setup-master.sql

# Or via MySQL client
mysql> source setup-master.sql;
```

### Individual Setup
```bash
# Run files in order
mysql -u username -p < 01-users.sql
mysql -u username -p < 02-transactions.sql
mysql -u username -p < 03-admin-chat.sql
mysql -u username -p < 04-chat-messages.sql
mysql -u username -p < 05-views.sql
mysql -u username -p < 06-procedures.sql
mysql -u username -p < 07-triggers.sql
```

### Database Structure

#### Tables
1. **users** - User accounts and profiles
2. **transactions** - Payment and service transactions
3. **admin_chat** - Customer support chat sessions
4. **chat_messages** - Individual chat messages

#### Views
- `user_stats` - User statistics and metrics
- `transaction_stats` - Transaction analytics
- `chat_stats` - Chat support statistics
- `monthly_revenue` - Monthly revenue reports
- `user_activity` - User activity levels

#### Stored Procedures
- `GetUserTransactionHistory()` - Get user's transaction history
- `GetMonthlyRevenue()` - Get monthly revenue report
- `UpdateUserStats()` - Update user statistics
- `GetChatAnalytics()` - Chat analytics for date range
- `CreateChatSession()` - Create new chat session
- `AddChatMessage()` - Add message to chat

#### Triggers
- Auto-update user stats after transaction changes
- Auto-update chat activity after new messages
- Auto-update timestamps for status changes
- Maintain user login timestamps

## Features

- ✅ Complete user management with profiles
- ✅ Transaction tracking with multiple service types
- ✅ Real-time chat support with guest users
- ✅ Comprehensive reporting views
- ✅ Automated procedures for common tasks
- ✅ Database triggers for data integrity
- ✅ Sample data for testing
- ✅ Performance optimized indexes

## Sample Data

The script includes:
- Admin user: `admin@travello.com`
- Sample regular users: `john@example.com`, `jane@example.com`
- Sample transactions (copywriter, travel, consultation)
- Sample chat sessions with messages
- Complete data relationships

## Quick Start

1. Run the master setup script
2. Check the views for sample reports:
   ```sql
   SELECT * FROM user_stats;
   SELECT * FROM transaction_stats;
   SELECT * FROM chat_stats;
   ```
3. Test procedures:
   ```sql
   CALL GetUserTransactionHistory(1, 10);
   CALL GetMonthlyRevenue(2024);
   ```
