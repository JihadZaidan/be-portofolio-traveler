// Script untuk menampilkan data phpMyAdmin di frontend admin users
// Copy dan paste ini di browser console pada halaman admin

// Token fresh dari login testadmin@example.com (update setiap login)
const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzE3NzI1OTcyOTc2MjVfN2Q4Ymd5MnM1IiwiaWF0IjoxNzcyNTk3NTU5LCJleHAiOjE3NzMyMDIzNTl9.abc123def456ghi789jkl012mno345pqr678stu901wxy";

// Clear old data first
localStorage.removeItem('authToken');
localStorage.removeItem('user');

// Set token ke localStorage
localStorage.setItem('authToken', validToken);

// Set user data
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
console.log('🔑 Token:', validToken.substring(0, 50) + '...');
console.log('👤 User: testadmin@example.com');

// Verify token is set
const storedToken = localStorage.getItem('authToken');
console.log('🔍 Token verification:', storedToken ? '✅ Token stored' : '❌ Token not stored');

// Auto-refresh untuk apply changes
setTimeout(() => {
  console.log('🔄 Refreshing halaman...');
  location.reload();
}, 1500);
