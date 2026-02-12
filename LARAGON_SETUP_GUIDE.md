# 🚀 Travello x Laragon - Quick Setup Guide

## 📋 Prerequisites
- ✅ Laragon installed (you already have it!)
- ✅ Node.js installed
- ✅ Travello project files

## 🎯 Setup Steps (5 Minutes)

### 1️⃣ Run Automatic Setup
```bash
# Double-click this file:
SETUP_TRAVELLO_LARAGON.bat
```

### 2️⃣ Restart Laragon
- Open Laragon
- Click **Menu → Restart All**
- Start **Apache** and **MySQL** services

### 3️⃣ Setup Database
1. Open: http://localhost/phpmyadmin
2. Create database: `travello_db`
3. Import SQL file: `be-travello/database-mysql-setup.sql`

### 4️⃣ Start Backend
```bash
cd be-travello
npm install
npm run laragon
```

### 5️⃣ Access Your App
- **Frontend**: http://travello.local
- **API**: http://travello.local/api
- **phpMyAdmin**: http://localhost/phpmyadmin

## 🔧 Manual Configuration (if needed)

### Virtual Host Setup
Copy `laragon-vhost-travello.conf` to:
```
C:\laragon\etc\apache2\sites-enabled\travello.conf
```

### Hosts File Entry
Add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 travello.local
```

## 📊 File Structure After Setup

```
C:\laragon\www\travello\          # Frontend files
├── dist\                         # Built frontend
├── index.html
└── assets\

C:\Users\ACER\workandshop\        # Development files
├── be-travello\                  # Backend (Node.js)
├── fe-travello\                  # Frontend source
└── SETUP_TRAVELLO_LARAGON.bat    # Setup script
```

## 🌐 Access URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://travello.local | 80 |
| Backend API | http://travello.local/api | 5000 |
| phpMyAdmin | http://localhost/phpmyadmin | 80 |
| Health Check | http://travello.local/api/health | 5000 |

## 🔥 Features Enabled

### ✅ Laragon Integration
- Automatic environment detection
- MySQL database connection
- Virtual host support
- Optimized for Laragon paths

### ✅ Development Features
- Hot reload for frontend
- CORS configured for travello.local
- Database persistence
- Error logging to Laragon logs

### ✅ Performance Optimizations
- Apache compression enabled
- Static file caching
- WebSocket support
- Proxy configuration for API

## 🛠️ Troubleshooting

### "travello.local not found"
```bash
# Check hosts file
notepad C:\Windows\System32\drivers\etc\hosts
# Should contain: 127.0.0.1 travello.local
```

### "Database connection failed"
```bash
# Check MySQL running in Laragon
# Verify travello_db exists in phpMyAdmin
# Check .env MySQL settings
```

### "API not responding"
```bash
# Check Node.js backend running
# Verify port 5000 not blocked
# Check Laragon proxy configuration
```

## 🎉 Benefits of Laragon Setup

### 🚀 Performance
- Apache serves static files faster
- MySQL optimized for development
- Local domain (.local) support

### 🔧 Development
- Isolated environment
- Easy database management
- Professional setup (like production)

### 📱 Testing
- Mobile testing via local network
- SSL support (optional)
- Multiple projects support

## 🔄 Daily Workflow

1. **Start Laragon** (Apache + MySQL)
2. **Start Backend** (`npm run laragon`)
3. **Open Browser** (http://travello.local)
4. **Develop** (hot reload enabled)
5. **Stop** (close terminals, Laragon)

## 📞 Need Help?

- Check Laragon documentation: https://laragon.org/docs
- Review error logs: `C:\laragon\logs\`
- Database issues: phpMyAdmin interface
- API issues: Node.js console output

---

🎯 **Setup Complete!** Your Travello app is now optimized for Laragon!

🕒 **Setup Time**: ~5 minutes  
💾 **Storage**: Minimal (uses existing Laragon)  
🔧 **Maintenance**: Easy (Laragon handles most)
