# MySQL Setup Guide for Travello App

## 🎯 Overview
This guide will help you set up MySQL database with phpMyAdmin to store logged-in usernames and user data for your Travello application.

## 📋 Prerequisites
- Windows OS
- Administrative privileges
- Node.js installed (already in your project)

## 🚀 Installation Steps

### 1. ✅ MySQL Server Installation
MySQL Server has been installed via winget. If you need to reinstall:

```bash
winget install Oracle.MySQL
```

### 2. ✅ XAMPP Installation (includes phpMyAdmin)
XAMPP has been installed which includes:
- Apache Web Server
- MySQL Database
- phpMyAdmin (web-based MySQL administration)

### 3. ✅ DBeaver Installation
DBeaver Community has been installed as an alternative database management tool.

## 🔧 Configuration Steps

### Step 1: Start MySQL Services
1. Open **XAMPP Control Panel** (from Start Menu)
2. Start **Apache** and **MySQL** services
3. Make sure both services show as "Running" in green

### Step 2: Access phpMyAdmin
1. Open your web browser
2. Go to: `http://localhost/phpmyadmin`
3. Login with:
   - Username: `root`
   - Password: (leave empty - default XAMPP setup)

### Step 3: Create Database
1. In phpMyAdmin, click on **"New"** in the left sidebar
2. Enter database name: `travello_db`
3. Select **"utf8mb4_unicode_ci"** collation
4. Click **"Create"**

### Step 4: Import Database Schema
1. Select the `travello_db` database
2. Click on **"Import"** tab
3. Choose file: `be-travello/database-mysql-setup.sql`
4. Click **"Go"** to import

### Step 5: Update Environment Configuration
1. Copy `.env.example` to `.env` (if not exists)
2. Update your `.env` file with MySQL credentials:

```env
# Database Configuration
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=travello_db
MYSQL_USER=root
MYSQL_PASSWORD=
```

## 🗄️ Database Schema

The MySQL database includes these tables:

### `users`
- Stores user information including login data
- Tracks `last_login` timestamp
- Supports OAuth (Google, GitHub) and local authentication

### `login_history` 
- Tracks all user login attempts
- Records IP address, user agent, and login method
- Useful for analytics and security monitoring

### `user_sessions`
- Manages active user sessions
- Stores session tokens and expiration

### `chat_messages`
- Stores chat history between users and AI

### `travel_knowledge`
- Knowledge base for travel-related auto-responses

## 🔍 Accessing Your Data

### Via phpMyAdmin
1. Go to `http://localhost/phpmyadmin`
2. Select `travello_db` database
3. Browse tables to view logged-in users and their data

### Via DBeaver
1. Open DBeaver
2. Create new MySQL connection:
   - Host: `localhost`
   - Port: `3306`
   - Database: `travello_db`
   - User: `root`
   - Password: (empty)

## 🛠️ Testing the Setup

### Test Database Connection
Run this command to test MySQL connection:

```bash
cd be-travello
node -e "
import { testConnection } from './src/config/database-mysql.config.js';
testConnection().then(result => console.log('Connection test:', result));
"
```

### Sample Queries
View logged-in users:
```sql
SELECT username, email, last_login, created_at 
FROM users 
WHERE last_login IS NOT NULL 
ORDER BY last_login DESC;
```

View login history:
```sql
SELECT u.username, lh.login_time, lh.ip_address, lh.login_method
FROM login_history lh
JOIN users u ON lh.user_id = u.id
ORDER BY lh.login_time DESC
LIMIT 10;
```

## 🔒 Security Recommendations

1. **Change MySQL root password** in XAMPP security page
2. **Update .env file** with strong database credentials
3. **Use environment variables** for production
4. **Regular backups** via phpMyAdmin export

## 🚨 Troubleshooting

### MySQL Service Won't Start
- Check if port 3306 is blocked
- Restart XAMPP services
- Check Windows Firewall settings

### Can't Access phpMyAdmin
- Ensure Apache is running in XAMPP
- Check if port 80/443 is available
- Try `http://localhost:8080/phpmyadmin` if default port is used

### Database Connection Errors
- Verify MySQL service is running
- Check credentials in .env file
- Ensure database `travello_db` exists

## 📞 Support

If you encounter issues:
1. Check XAMPP error logs
2. Verify MySQL service status
3. Test with DBeaver connection
4. Review environment configuration

---

**🎉 Your MySQL database is now ready to store logged-in usernames and user data!**
