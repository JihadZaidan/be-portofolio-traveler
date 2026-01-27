# 🔧 Google OAuth Setup Guide

## 📋 Langkah 1: Buat Google OAuth Application

### 1.1 Buka Google Cloud Console
1. Kunjungi: https://console.cloud.google.com/
2. Login dengan Google account Anda
3. Buat project baru atau pilih existing project

### 1.2 Enable Google+ API
1. Di sidebar, klik **APIs & Services → Library**
2. Search: **"Google+ API"** atau **"People API"**
3. Klik **Enable**

### 1.3 Buat OAuth 2.0 Credentials
1. Klik **APIs & Services → Credentials**
2. Klik **+ CREATE CREDENTIALS → OAuth 2.0 Client IDs**
3. Jika diminta, configure **OAuth consent screen** terlebih dahulu:
   - **User Type:** External
   - **App name:** TRAVELLO
   - **User support email:** email Anda
   - **Developer contact information:** email Anda
   - **Scopes:** Add scope: `email`, `profile`
   - **Test users:** Tambahkan email Anda untuk testing
   - **Save and Continue**

### 1.4 Create OAuth Client ID
1. **Application type:** Web application
2. **Name:** TRAVELLO Web Client
3. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:3000
   ```
4. **Authorized redirect URIs:**
   ```
   http://localhost:5000/api/auth/google/callback
   http://localhost:5000/auth/google/callback
   ```
5. Klik **Create**

### 1.5 Copy Credentials
Setelah berhasil, Anda akan mendapatkan:
- **Client ID:** `xxxxx.apps.googleusercontent.com`
- **Client Secret:** `xxxxx`

## 🔧 Langkah 2: Update Environment Variables

Buka file `.env` di project root:

```env
# ===============================
# GOOGLE OAUTH
# ===============================
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CORS_ORIGIN=http://localhost:5173
```

**Ganti:**
- `YOUR_CLIENT_ID_HERE` dengan Client ID dari Google
- `YOUR_CLIENT_SECRET_HERE` dengan Client Secret dari Google

## 🔧 Langkah 3: Test Google OAuth

### 3.1 Start Backend Server
```bash
cd be-travello
npm run dev
```

### 3.2 Test OAuth Flow
1. Buka browser: http://localhost:5000/api/auth/google/config
2. Pastikan semua config ter-set dengan benar
3. Test login: http://localhost:5000/api/auth/google

### 3.3 Expected Flow:
1. Redirect ke Google login page
2. Pilih Google account
3. Approve permissions
4. Redirect kembali ke frontend dengan token
5. Login berhasil

## 🎯 Frontend Integration

### 4.1 Login Button Component
```javascript
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};

<button onClick={handleGoogleLogin}>
  Login with Google
</button>
```

### 4.2 Handle OAuth Callback
Di frontend, handle URL parameters:
```javascript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const auth = params.get('auth');
  const token = params.get('token');
  
  if (auth === 'success' && token) {
    // Save token to localStorage/cookies
    localStorage.setItem('token', token);
    // Redirect to dashboard
    window.location.href = '/dashboard';
  }
  
  if (auth === 'error') {
    const message = params.get('message');
    console.error('Google auth failed:', message);
  }
}, []);
```

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Pastikan redirect URI di Google Console sama dengan yang di .env:
- Google Console: `http://localhost:5000/api/auth/google/callback`
- .env: `GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback`

### Error: "invalid_client"
**Solution:** Periksa Client ID dan Client Secret di .env

### Error: "access_denied"
**Solution:** 
1. Pastikan email Anda ada di **Test users** di OAuth consent screen
2. Atau publish aplikasi (production)

### Error: "idpiframe_initialization_failed"
**Solution:** Clear browser cache atau gunakan incognito mode

## 📱 Testing di Production

Untuk production:
1. Update authorized origins dan redirect URIs
2. Publish OAuth consent screen
3. Update .env dengan production URLs
4. Enable HTTPS

## ✅ Success Criteria

- [ ] Google OAuth credentials ter-set dengan benar
- [ ] User bisa login dengan Google account
- [ ] User data tersimpan di database
- [ ] JWT token ter-generate dengan benar
- [ ] Frontend menerima token dan redirect ke dashboard
- [ ] Logout functionality berjalan

## 🚀 Next Steps

Setelah Google OAuth berhasil:
1. Implement role-based access control
2. Add profile management
3. Implement session management
4. Add security features (rate limiting, etc.)
