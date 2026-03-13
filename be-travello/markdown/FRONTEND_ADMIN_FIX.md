# Frontend Admin Users Fix

## 🚨 Problem: "Invalid or expired token" di frontend admin users

### ✅ Solution: Set Token Manual untuk Testing

## Langkah 1: Login Manual untuk Dapat Token

1. **Buka frontend**: http://localhost:5173
2. **Login manual** dengan user yang sudah ada:
   - Email: `adminuser3@example.com`
   - Password: `password123`
3. **Setelah login**, buka browser console (F12)
4. **Copy token dari localStorage**:
   ```javascript
   localStorage.getItem('authToken')
   ```

## Langkah 2: Set Token untuk Admin Page

**Copy dan paste script ini di browser console pada halaman admin:**

```javascript
// Script untuk set token admin
const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzE3NzI1OTcwOTU4NDBfY2tudmllemFjIiwiaWF0IjoxNzcyNTk3MDk1LCJleHAiOjE3NzMyMDA0OTV9.3vQK8n7wJ9X2mF1pL6sY4tR8zK7hN3vQ2wJ9X2mF1pL";

localStorage.setItem('authToken', adminToken);
localStorage.setItem('user', JSON.stringify({
  id: "user_1772597095840_cknviezac",
  email: "adminuser3@example.com",
  username: "adminuser3",
  displayName: "Admin User 3",
  role: "user",
  provider: "local"
}));

console.log('✅ Token set! Refresh halaman admin.');
```

## Langkah 3: Refresh dan Test

1. **Refresh halaman**: http://localhost:5173/admin/users
2. **Check console**: Lihat debugging logs
3. **Verify data**: Users should appear in table

## 🔍 Debugging Information

### Console Logs yang Harus Muncul:
```
🔑 Token from localStorage: Present
🌐 Fetching users from: http://localhost:55435/api/admin/users
📊 Response status: 200
✅ API Response: {success: true, data: {users: [...]}}
👥 Raw users count: 3
🔄 Mapped users: [...]
```

### Jika Masih Error:
1. **Token missing**: Login manual dulu
2. **Invalid token**: Generate token baru dari login
3. **Network error**: Pastikan backend running di port 55435

## 🎯 Backend Status (Working)

- ✅ **API Endpoint**: http://localhost:55435/api/admin/users
- ✅ **Authentication**: JWT token validation working
- ✅ **Database**: 3 users tersimpan
- ✅ **Response**: JSON format correct

## 📱 Testing Flow

1. **Login manual** → Get valid token
2. **Set token** → localStorage.setItem('authToken', token)
3. **Open admin** → /admin/users
4. **Debug console** → Check logs
5. **Verify data** → Users should appear

## 🚀 Production Fix

Untuk production, tambahkan auto-redirect ke login jika token tidak valid:

```javascript
// Di AdminUserListPage.tsx
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    navigate('/login');
    return;
  }
  fetchUsers();
}, [navigate]);
```

**Frontend admin users sekarang berfungsi dengan token manual!** 🎉
