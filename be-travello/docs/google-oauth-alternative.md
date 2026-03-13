# Google OAuth Alternative Solutions

## 🚨 Masalah: redirect_uri_mismatch persisting

### 🔧 Solusi 1: Gunakan OAuth 2.0 Playground (Testing)

1. **Buka OAuth 2.0 Playground**
   - https://developers.google.com/oauthplayground/
   - Klik gear icon (⚙️) di kanan atas
   - Masukkan Client ID dan Client Secret Anda

2. **Setup Playground**
   - **OAuth flow**: `Authorization code`
   - **Scopes**: `https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile`
   - **Authorized redirect URI**: `http://localhost:55435/api/auth/google/callback`

3. **Test Flow**
   - Klik "Authorize APIs"
   - Login dengan Google
   - Copy authorization code
   - Test dengan backend

### 🔧 Solusi 2: Manual Testing dengan Postman

1. **Get Authorization URL**
   ```bash
   https://accounts.google.com/o/oauth2/v2/auth?
   client_id=YOUR_CLIENT_ID&
   redirect_uri=http://localhost:55435/api/auth/google/callback&
   response_type=code&
   scope=https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&
   state=random_string
   ```

2. **Test Backend Callback**
   ```bash
   curl -X GET "http://localhost:55435/api/auth/google/callback?code=AUTH_CODE_HERE&state=random_string"
   ```

### 🔧 Solusi 3: Create New Client ID (Recommended)

**Ikuti langkah-langkah di `google-oauth-quick-fix.md`**

### 🔧 Solusi 4: Temporary Disable Google OAuth

**Gunakan manual authentication saja:**

1. **Disable di backend**
   ```javascript
   // Di passport.config.js
   const enableGoogleOAuth = false;
   ```

2. **Hide button di frontend**
   ```javascript
   // Di AuthModal.tsx
   // Comment out Google button
   ```

3. **Focus pada manual auth**
   - Registration: ✅ Working
   - Login: ✅ Working
   - Database: ✅ Working

## 📱 Manual Authentication Testing

Manual authentication sudah 100% berfungsi:

```bash
# Test Registration
curl -X POST http://localhost:55435/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","displayName":"Test User","password":"password123"}'

# Test Login
curl -X POST http://localhost:55435/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🎯 Rekomendasi

**Untuk development sekarang:**
1. **Gunakan manual authentication** (sudah sempurna)
2. **Skip Google OAuth** sementara
3. **Fokus ke fitur lain dulu**
4. **Setup Google OAuth** nanti saat production

**Manual authentication sudah cukup untuk semua kebutuhan development!** 🚀
