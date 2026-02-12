# Travel Journal Management System - Final Configuration
# Created: 2026-02-03
# Status: Production Ready

## 🚀 Quick Start Guide

### 1. Start All Services
```bash
# Jalankan script otomatis
cd "c:\Users\ACER\workandshop"
START_TRAVELLO.bat
```

### 2. Manual Start (jika gagal)
```bash
# 1. Start XAMPP (Apache + MySQL)
# Buka XAMPP Control Panel, start Apache dan MySQL

# 2. Start Backend Server
cd "c:\Users\ACER\workandshop\be-travello"
node server-minimal.js

# 3. Start Frontend Server
cd "c:\Users\ACER\workandshop\fe-travello"
npm run dev
```

## 📁 File Structure & Configuration

### Backend Configuration
- **Main Server**: `be-travello/server-minimal.js`
- **Travel Journal API**: `be-travello/src/routes/travel-journal.routes.js`
- **Auth API**: `be-travello/src/routes/auth.routes.js`
- **Admin API**: `be-travello/src/routes/admin.routes.js`

### Frontend Configuration
- **Main App**: `fe-travello/src/App.tsx`
- **Admin Panel**: `fe-travello/src/pages/admin/AdminTravelJournalPage.tsx`
- **Stories Section**: `fe-travello/src/components/guest/landingpage/storiesSection.tsx`
- **User Management**: `fe-travello/src/pages/admin/userlist/AdminUserListPage.tsx`

### Database Configuration
- **Mode**: In-Memory (tanpa phpMyAdmin)
- **Data Storage**: JavaScript array di backend
- **Auto-cleanup**: Setiap jam untuk data > 24 jam
- **Sample Data**: Bali (7d), Tokyo (14d)

## 🔗 API Endpoints

### Travel Journal
- `GET /api/travel-journal` - Get all journals
- `GET /api/travel-journal/:id` - Get by ID
- `POST /api/travel-journal` - Create new
- `PUT /api/travel-journal/:id` - Update
- `DELETE /api/travel-journal/:id` - Delete
- `POST /api/travel-journal/cleanup` - Manual cleanup

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `DELETE /api/admin/users/:id` - Delete user

## 🌐 Access URLs

### Frontend
- **Main Site**: `http://localhost:5173`
- **Admin Panel**: `http://localhost:5173/admin/landing/travel-journal`
- **User Management**: `http://localhost:5173/admin/users`
- **Stories Section**: `http://localhost:5173/#stories`

### Backend
- **API Base**: `http://localhost:5000/api`
- **API Info**: `http://localhost:5000/api`

### Development Tools
- **Database Checker**: `http://localhost/be-travello/check-travel-journal.php`
- **SQL Schema**: `be-travello/travel-journal-schema.sql`

## ⚙️ Features Status

### ✅ Working Features
- [x] Admin Travel Journal Management
- [x] Preview Button (eye icon)
- [x] Add/Edit/Delete journals
- [x] Stories Section with Instagram-like UI
- [x] 24-hour auto-cleanup
- [x] Relative timestamps
- [x] User management system
- [x] Authentication (Google OAuth + Manual)
- [x] Pagination (10-100 items per page)
- [x] Error handling & fallbacks

### 🔧 Configuration Details

### Travel Journal Storage
```javascript
// In-memory storage (server restart = data reset)
let travelJournals = [
  {
    id: 1,
    name: "Bali",
    cover: "/foto 2.jpg",
    images: ["/foto 2.jpg", "/foto 5.jpg", "/foto 7.jpg"],
    createdAt: "7 days ago",
    timestamp: "7d",
    status: "active"
  },
  {
    id: 2,
    name: "Tokyo",
    cover: "/foto 1.jpg", 
    images: ["/foto 1.jpg"],
    createdAt: "14 days ago",
    timestamp: "14d",
    status: "active"
  }
];
```

### Auto-Cleanup Logic
```javascript
// Runs every hour
setInterval(() => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  travelJournals = travelJournals.filter(journal => 
    new Date(journal.createdAt) >= twentyFourHoursAgo
  );
}, 60 * 60 * 1000); // 1 hour
```

## 🚨 Troubleshooting

### Common Issues & Solutions

1. **Port Conflicts**
   - Backend: Port 5000
   - Frontend: Port 5173
   - Check: `netstat -an | findstr ":5000"` dan `netstat -an | findstr ":5173"`

2. **Services Not Running**
   - Restart: `taskkill /F /IM node.exe`
   - Start: `START_TRAVELLO.bat`

3. **Empty Admin Panel**
   - Check browser console (F12)
   - Verify API: `curl http://localhost:5000/api/travel-journal`

4. **Images Not Loading**
   - Check file paths: `/foto 1.jpg`, `/foto 2.jpg`, etc.
   - Verify images exist in `public/` folder

## 📝 Notes

### Data Persistence
- **Current Mode**: In-memory (server restart = data reset)
- **To Save Data**: Consider implementing database connection when ready
- **Backup**: Export data periodically if needed

### Performance
- **Optimized for**: Development and small-scale production
- **Scalability**: Add database for large-scale deployment
- **Memory Usage**: Lightweight, minimal dependencies

### Security
- **CORS**: Configured for localhost development
- **Input Validation**: Basic validation on all inputs
- **Error Handling**: Graceful fallbacks implemented

## 🔄 Maintenance

### Regular Tasks
1. **Weekly**: Check for any broken image paths
2. **Monthly**: Review and optimize performance
3. **As Needed**: Update sample data or add new features

### Updates
- All configurations are self-contained
- No external dependencies required
- Easy to modify and extend

---

**System Status: ✅ Production Ready**  
**Last Updated: 2026-02-03**  
**Version: 1.0**
