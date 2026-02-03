# 🧪 Integration Test Guide

## 🚀 Backend + Frontend Integration Testing

### ✅ Services Status:
- **Backend API**: Running on `http://localhost:5000`
- **Frontend React**: Running on `http://localhost:5173`
- **MySQL Database**: Connected and ready

### 📋 Test Scenarios:

## 1. Manual Signup/Login Test

### Backend Forms:
- **Login**: `http://localhost:5000/login`
- **AI Chatbot Login**: `http://localhost:5000/login-aichatbot`
- **Shop Login**: `http://localhost:5000/login-shop`
- **AI Chatbot Signup**: `http://localhost:5000/signup-aichatbot`
- **Shop Signup**: `http://localhost:5000/signup-shop`

### Frontend React App:
- **Main App**: `http://localhost:5173`
- **AI Chatbot**: `http://localhost:5173/ai-chatbot`
- **Shop**: `http://localhost:5173/shop`
- **Admin Users**: `http://localhost:5173/admin/users`

## 2. Google OAuth Test

### Test Flow:
1. Open any login/signup page
2. Click "Sign in with Google" or "Sign up with Google"
3. Complete Google authentication
4. Verify redirect back to app
5. Check data in MySQL database

### Expected Results:
- User data stored in `users` table
- Login history recorded in `login_history` table
- Frontend shows authenticated state

## 3. Database Verification

### Check in phpMyAdmin:
```sql
-- Check users table
SELECT * FROM users ORDER BY created_at DESC;

-- Check login history
SELECT * FROM login_history ORDER BY login_time DESC;

-- Check user count
SELECT COUNT(*) as total_users FROM users;
```

### Expected Data:
- New user records with Google/manual provider
- Login history with IP, user agent, method
- Proper timestamps and relationships

## 4. Admin Panel Test

### Access Admin Users:
- URL: `http://localhost:5173/admin/users`
- Should show all registered users
- Real-time data from MySQL database

### Expected Features:
- User list with search/filter
- User details display
- CRUD operations for users

## 5. Cross-Platform Integration

### Test AI Chatbot:
1. Login via `http://localhost:5000/login-aichatbot`
2. Redirect to AI chatbot interface
3. Verify user session
4. Check database for login record

### Test Shop:
1. Login via `http://localhost:5000/login-shop`
2. Redirect to shop interface
3. Verify user session
4. Check database for login record

## 🔍 Troubleshooting

### Common Issues:
1. **Frontend not loading**: Check if React dev server running on port 5173
2. **Backend not responding**: Check if Express server running on port 5000
3. **Database connection**: Verify MySQL service running in XAMPP
4. **Google OAuth**: Check Google Client ID/Secret in .env file

### Debug Steps:
1. Check browser console for errors
2. Check network tab for API calls
3. Verify backend logs
4. Check database tables directly

## 📊 Expected Integration Results

### Successful Integration:
- ✅ Frontend forms submit to backend API
- ✅ Backend processes and stores in MySQL
- ✅ Google OAuth flow completes successfully
- ✅ Login history tracking works
- ✅ Admin panel shows real-time data
- ✅ Cross-platform authentication works

### Data Flow Verification:
```
Frontend Form → Backend API → MySQL Database → Frontend Display
```

## 🎯 Quick Test Commands

### Test API Endpoints:
```bash
# Test users API
curl http://localhost:5000/api/admin/users

# Test shops API
curl http://localhost:5000/api/shops

# Test auth endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Check Database:
```bash
# MySQL connection test
mysql -u root -e "SELECT COUNT(*) FROM travello_db.users;"
```

---

**🚀 Integration Ready! Test all scenarios above to verify complete system functionality.**
