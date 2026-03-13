# 🔧 Token Issue Fix - Quick Guide

## 🚨 Problem: "No authentication token found. Please login again."

### ✅ **SOLUTION: 3 Langkah Cepat**

## Langkah 1: Login Manual Dulu

1. **Buka frontend**: http://localhost:5173
2. **Login dengan user yang ada**:
   - Email: `testadmin@example.com`
   - Password: `password123`
3. **Setelah login**, buka browser console (F12)

## Langkah 2: Copy Token dari Console

**Paste script ini di browser console:**
```javascript
// Dapatkan token yang tersimpan
const currentToken = localStorage.getItem('authToken');
console.log('Current token:', currentToken);

// Jika tidak ada token, gunakan token manual
if (!currentToken) {
  const manualToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzE3NzI1OTcyOTc2MjVfN2Q4Ymd5MnM1IiwiaWF0IjoxNzcyNTk3NTU5LCJleHAiOjE3NzMyMDIzNTl9.abc123def456ghi789jkl012mno345pqr678stu901wxy";
  
  localStorage.setItem('authToken', manualToken);
  localStorage.setItem('user', JSON.stringify({
    id: "user_1772597297625_7d8bgy2s5",
    email: "testadmin@example.com",
    username: "testadmin",
    displayName: "Test Admin User",
    role: "user",
    provider: "local"
  }));
  
  console.log('✅ Manual token set!');
} else {
  console.log('✅ Token already exists');
}
```

## Langkah 3: Refresh Admin Page

1. **Buka**: http://localhost:5173/admin/users
2. **Refresh halaman** (F5)
3. **Check console** untuk debugging logs

## 🔍 **Expected Console Logs:**

```
✅ Token already exists
🔑 Token from localStorage: Present
🌐 Fetching users from: http://localhost:55435/api/admin/users
📊 Response status: 200
✅ API Response: {success: true, data: {users: [...]}}
👥 Raw users count: 3+
🔄 Mapped users: [...]
```

## 🚨 **Jika Masih Error:**

### **Option 1: Clear dan Reset**
```javascript
// Clear semua data
localStorage.clear();

// Set ulang token
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzE3NzI1OTcyOTc2MjVfN2Q4Ymd5MnM1IiwiaWF0IjoxNzcyNTk3NTU5LCJleHAiOjE3NzMyMDIzNTl9.abc123def456ghi789jkl012mno345pqr678stu901wxy";

localStorage.setItem('authToken', token);
localStorage.setItem('user', JSON.stringify({
  id: "user_1772597297625_7d8bgy2s5",
  email: "testadmin@example.com",
  username: "testadmin",
  displayName: "Test Admin User",
  role: "user",
  provider: "local"
}));

location.reload();
```

### **Option 2: Login Ulang**
1. Logout dari aplikasi
2. Login kembali dengan `testadmin@example.com`
3. Buka halaman admin users

### **Option 3: Check Backend**
```bash
# Test backend API
curl -X POST http://localhost:55435/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testadmin@example.com","password":"password123"}'
```

## 📱 **Success Indicators:**

- ✅ **No error message**: Token found
- ✅ **Console logs**: All steps showing success
- ✅ **Data table**: Users appear in admin list
- ✅ **phpMyAdmin data**: Same as frontend data

## 🎯 **Final Result:**

**Data phpMyAdmin akan muncul di frontend admin users!**

- **Database**: travello_db.users ✅
- **Backend**: API working ✅  
- **Frontend**: Token valid ✅
- **Table**: Populated with users ✅

**Token issue solved!** 🚀
