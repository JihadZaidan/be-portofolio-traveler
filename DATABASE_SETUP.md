# Database Setup Guide for DBeaver

## 🗄️ **Prerequisites**

1. **DBeaver** - Database management tool
2. **MySQL Server** - Database engine
3. **Node.js** - Runtime environment

## 🐘 **MySQL Server Setup**

### 1. **Install MySQL**
- Download from: https://dev.mysql.com/downloads/mysql/
- Install MySQL Community Server
- Set root password (remember this!)

### 2. **Install DBeaver**
- Download from: https://dbeaver.io/download/
- Install DBeaver Community Edition

## 🏗️ **Database Creation**

### 1. **Connect DBeaver to MySQL**
1. Open DBeaver
2. Click **Database** → **New Database Connection**
3. Select **MySQL**
4. Configure connection:
   - **Host:** `localhost`
   - **Port:** `3306`
   - **Database:** (leave empty)
   - **User:** `root`
   - **Password:** (your MySQL root password)
5. Click **Test Connection** → **Finish**

### 2. **Create Database**
1. In DBeaver, right-click on connection
2. Select **SQL Editor**
3. Run this query:
```sql
CREATE DATABASE trakowi_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### 3. **Verify Database**
```sql
SHOW DATABASES;
-- Should show 'trakowi_db' in the list
```

## ⚙️ **Environment Configuration**

### 1. **Update .env File**
Create `.env` file in backend root:

```env
# ===============================
# DATABASE CONFIGURATION
# ===============================
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=trakowi_db

# ===============================
# GOOGLE OAUTH
# ===============================
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# ===============================
# JWT CONFIGURATION
# ===============================
JWT_SECRET=TRAKOWI_AUTH_2024_cH5&jK8!lM2#oN6%pQ9*sR3$tV7
JWT_EXPIRES_IN=7d

# ===============================
# SESSION CONFIGURATION
# ===============================
SESSION_SECRET=TRAKOWI_SESSION_2024_xK9@mN7#qP2$vR5!wS8*zY3

# ===============================
# APP
# ===============================
APP_NAME=TRAVELLO
NODE_ENV=development
PORT=3001

# ===============================
# GEMINI AI
# ===============================
GEMINI_API_KEY=AIzaSyD6gh7_tHCBlnxzey0SUxOYMLWoqkoVU7w
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=500

# ===============================
# SECURITY
# ===============================
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=50

# ===============================
# LOGGING
# ===============================
LOG_LEVEL=debug
```

## 🚀 **Start Application**

### 1. **Install Dependencies**
```bash
cd be-portofolio-traveller
npm install
```

### 2. **Start Backend**
```bash
npm run dev
```

**Expected Output:**
```
✅ Database connection has been established successfully.
✅ User table has been synchronized.
✅ Database initialized successfully
🚀 Server running on port 3001
📝 Environment: development
🏥 Health check: http://localhost:3001/health
💬 Chat API: http://localhost:3001/api/chat
🔐 Google OAuth: http://localhost:3001/api/auth/google
```

## 🗃️ **Database Schema**

### **Users Table Structure**
```sql
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NULL,
  googleId VARCHAR(255) NULL UNIQUE,
  displayName VARCHAR(255) NULL,
  profilePicture TEXT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  isActive BOOLEAN DEFAULT TRUE,
  isEmailVerified BOOLEAN DEFAULT FALSE,
  lastLogin DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔍 **Verify Database in DBeaver**

### 1. **Check Table Creation**
1. In DBeaver, expand `trakowi_db`
2. Expand **Tables**
3. Should see `users` table

### 2. **Browse Data**
1. Right-click `users` table
2. Select **View Data**
3. Should show empty table initially

### 3. **Test with Google OAuth**
1. Start frontend: `cd fe-portofolio-traveler && npm run dev`
2. Go to `http://localhost:5173`
3. Click "Login Page" → "Continue with Google"
4. After successful login, check `users` table in DBeaver
5. Should see new user record

## 🛠️ **Common Issues & Solutions**

### **Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Check if MySQL server is running

### **Access Denied**
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:** Verify MySQL root password in .env

### **Database Not Found**
```
Error: Unknown database 'trakowi_db'
```
**Solution:** Run `CREATE DATABASE trakowi_db;` in DBeaver

### **Table Creation Failed**
```
Error: Table 'users' doesn't exist
```
**Solution:** Check Sequelize logs, ensure proper permissions

## 🔄 **Database Migration**

### **For Future Updates**
The app uses `sequelize.sync({ alter: true })` which:
- Creates tables if they don't exist
- Updates table structure if changed
- Preserves existing data

### **Reset Database**
```sql
DROP TABLE IF EXISTS users;
-- Restart app to recreate table
```

## 📊 **Monitoring**

### **Check Active Connections**
```sql
SHOW PROCESSLIST;
```

### **Check Database Size**
```sql
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'trakowi_db';
```

## 🎯 **Next Steps**

1. ✅ Setup MySQL Server
2. ✅ Install DBeaver
3. ✅ Create `trakowi_db` database
4. ✅ Configure `.env` file
5. ✅ Start backend application
6. ✅ Test Google OAuth
7. ✅ Verify data in DBeaver

**Database integration with DBeaver is now ready!** 🎉
