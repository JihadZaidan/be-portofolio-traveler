# Authentication Scripts

## 📁 Auth Directory

This folder contains authentication-related scripts and utilities for the TRAVELLO backend system.

## 📋 Available Scripts

### 🔧 **User Management Scripts**
- [check-users.js](./check-users.js) - Check existing users in database
- [create-admin-user.js](./create-admin-user.js) - Create admin user account
- [create-test-user.js](./create-test-user.js) - Create test user account
- [reset-old-passwords.js](./reset-old-passwords.js) - Reset passwords for existing users

### 🧪 **Testing Scripts**
- [test-auth.js](./test-auth.js) - Test authentication functionality
- [test-login-existing.js](./test-login-existing.js) - Test login with existing users
- [test-dynamic-logic.js](./test-dynamic-logic.js) - Test dynamic authentication logic

## 🚀 **Usage Examples**

### Create Admin User
```bash
cd auth
node create-admin-user.js
```

### Check Existing Users
```bash
cd auth
node check-users.js
```

### Reset Passwords
```bash
cd auth
node reset-old-passwords.js
```

## 🔐 **Security Features**

### Password Hashing
- Uses bcryptjs for secure password hashing
- Automatic salt generation
- Configurable hash rounds

### User Roles
- `user` - Regular user access
- `admin` - Administrative access
- Role-based permissions

### Authentication Methods
- Local authentication (email/password)
- Google OAuth integration
- Session management

## 📊 **Database Schema**

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    googleId VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    displayName VARCHAR(255),
    password VARCHAR(255),
    profilePicture TEXT,
    avatar TEXT,
    provider ENUM('local', 'google', 'facebook') DEFAULT 'local',
    loginPage VARCHAR(50) DEFAULT 'default',
    phone VARCHAR(20),
    dateOfBirth DATE,
    gender ENUM('male', 'female', 'other') DEFAULT 'other',
    address_street TEXT,
    address_city VARCHAR(100),
    address_province VARCHAR(100),
    address_postalCode VARCHAR(10),
    address_country VARCHAR(100) DEFAULT 'Indonesia',
    travelPreferences_favoriteDestinations JSON,
    travelPreferences_travelStyle VARCHAR(50) DEFAULT 'budget',
    travelPreferences_interests JSON,
    isVerified BOOLEAN DEFAULT false,
    isActive BOOLEAN DEFAULT true,
    lastLogin TIMESTAMP NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    totalTransactions INT DEFAULT 0,
    totalSpent DECIMAL(10,2) DEFAULT 0.00,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔧 **Configuration**

### Environment Variables
```bash
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=travello_db

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🛡️ **Security Best Practices**

### Password Requirements
- Minimum 8 characters
- Include uppercase and lowercase
- Include numbers and special characters
- Hash with bcryptjs (salt rounds: 12)

### Session Management
- Secure HTTP-only cookies
- Session expiration
- CSRF protection
- Rate limiting

### OAuth Security
- State parameter validation
- Token verification
- Scope limitation
- Secure redirect URIs

## 🧪 **Testing**

### Test Authentication Flow
```bash
# Test user creation
node create-test-user.js

# Test login
node test-login-existing.js

# Test admin access
node create-admin-user.js
```

### Debug Mode
Set `DEBUG=auth` environment variable for detailed logging:
```bash
DEBUG=auth node test-auth.js
```

## 📝 **Script Standards**

All authentication scripts follow this pattern:
1. **Database Connection**: Secure MySQL connection
2. **Error Handling**: Comprehensive try-catch blocks
3. **Logging**: Detailed console output
4. **Security**: Input validation and sanitization
5. **Cleanup**: Proper connection closing

---
**Last Updated**: March 5, 2026
**Version**: 1.0.0
**Maintainer**: TRAVELLO Development Team
