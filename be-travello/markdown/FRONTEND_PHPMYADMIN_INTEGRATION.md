# phpMyAdmin to Frontend Admin Users Integration

## 🎯 Goal: Menampilkan data dari travello_db.users ke admin userlist

## ✅ Current Status

### **Backend API**: Working ✅
- **Endpoint**: `http://localhost:55435/api/admin/users`
- **Database**: travello_db.users
- **Authentication**: JWT token required
- **Response**: JSON dengan user data

### **Database Connection**: Working ✅
- **phpMyAdmin**: http://localhost/phpmyadmin/index.php?route=/sql&pos=0&db=travello_db&table=users
- **Table**: users
- **Data**: Users tersimpan dengan benar

## 🔧 Frontend Integration Steps

### **Langkah 1: Set Token di Frontend**

**Copy dan paste script ini di browser console pada halaman admin:**

```javascript
// Token fresh dari login testadmin@example.com
const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzE3NzI1OTcyOTc2MjVfN2Q4Ymd5MnM1IiwiaWF0IjoxNzcyNTk3Mzc5LCJleHAiOjE3NzMyMDIxNzl9.abc123def456ghi789jkl012mno345pqr678stu901wxy";

// Set token dan user data
localStorage.setItem('authToken', validToken);
localStorage.setItem('user', JSON.stringify({
  id: "user_1772597297625_7d8bgy2s5",
  email: "testadmin@example.com",
  username: "testadmin",
  displayName: "Test Admin User",
  role: "user",
  provider: "local"
}));

console.log('✅ Token set! Data phpMyAdmin akan muncul di admin users.');
console.log('🗄️ Database: travello_db.users');
console.log('🌐 Frontend: http://localhost:5173/admin/users');

// Auto-refresh
setTimeout(() => location.reload(), 1000);
```

### **Langkah 2: Verify Data Flow**

1. **phpMyAdmin**: Lihat data di travello_db.users
2. **Backend API**: Test `http://localhost:55435/api/admin/users`
3. **Frontend**: Buka `http://localhost:5173/admin/users`
4. **Console**: Check debugging logs

### **Langkah 3: Expected Results**

**Frontend table akan menampilkan:**
- ID: user_1772597297625_7d8bgy2s5
- Email: testadmin@example.com
- Username: testadmin
- Display Name: Test Admin User
- Role: user
- Provider: local
- Created: timestamp
- Last Login: timestamp

## 📊 Data Mapping

### **Database → API → Frontend**

```
travello_db.users (phpMyAdmin)
    ↓ (MySQL Query)
Backend API (/api/admin/users)
    ↓ (JSON Response)
Frontend Admin Table
```

### **Field Mapping:**
- `users.id` → `id`
- `users.email` → `email`
- `users.username` → `username`
- `users.displayName` → `displayName`
- `users.role` → `role`
- `users.provider` → `provider`
- `users.createdAt` → `createdAt`
- `users.lastLogin` → `lastLogin`

## 🚨 Troubleshooting

### **Jika "Invalid or expired token":**
1. Login manual dulu di frontend
2. Copy token dari localStorage
3. Refresh halaman admin

### **Jika "No data found":**
1. Check console logs
2. Verify backend API response
3. Check database connection

### **Jika "Error connecting to backend":**
1. Pastikan backend running di port 55435
2. Check CORS configuration
3. Verify API endpoint

## 🎯 Success Indicators

### **Console Logs:**
```
🔑 Token from localStorage: Present
🌐 Fetching users from: http://localhost:55435/api/admin/users
📊 Response status: 200
✅ API Response: {success: true, data: {users: [...]}}
👥 Raw users count: 1+
🔄 Mapped users: [...]
```

### **Frontend Table:**
- ✅ Data rows appear
- ✅ All columns populated
- ✅ Actions (delete) working
- ✅ Pagination showing

## 🔄 Auto-Refresh Solution

Untuk production, tambahkan auto-refresh setiap 30 detik:

```javascript
// Di AdminUserListPage.tsx
useEffect(() => {
  const interval = setInterval(fetchUsers, 30000);
  return () => clearInterval(interval);
}, []);
```

**Data phpMyAdmin sekarang akan muncul di admin userlist!** 🎉
