# Google OAuth Setup Guide for TRAVELLO

## 🚀 Quick Setup (5 Menit)

### Langkah 1: Buat Project Baru di Google Cloud Console

1. **Buka Google Cloud Console**
   - https://console.cloud.google.com/
   - Klik dropdown project di atas
   - Klik "NEW PROJECT"
   - Project name: `TRAVELLO-Development`
   - Klik "CREATE"

### Langkah 2: Enable Google+ API

1. **Menu**: APIs & Services → Library
2. **Search**: "Google+ API" atau "People API"
3. **Klik**: "Enable"

### Langkah 3: Configure OAuth Consent Screen

1. **Menu**: APIs & Services → OAuth consent screen
2. **Pilih**: "External"
3. **Isi aplikasi details**:
   - App name: `TRAVELLO Development`
   - User support email: `your-email@gmail.com`
   - Developer contact: `your-email@gmail.com`
4. **Klik**: "SAVE AND CONTINUE"

### Langkah 4: Add Scopes

1. **Klik**: "+ ADD OR REMOVE SCOPES"
2. **Search dan tambahkan**:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `.../openid`
3. **Klik**: "UPDATE"

### Langkah 5: Add Test Users

1. **Klik**: "+ ADD USERS"
2. **Masukkan email Anda**: `your-email@gmail.com`
3. **Klik**: "SAVE AND CONTINUE"

### Langkah 6: Create OAuth 2.0 Client ID

1. **Menu**: APIs & Services → Credentials
2. **Klik**: "+ CREATE CREDENTIALS"
3. **Pilih**: "OAuth 2.0 Client ID"
4. **Application type**: "Web application"
5. **Name**: `TRAVELLO Web Client`
6. **Authorized redirect URIs**:
   ```
   http://localhost:55435/api/auth/google/callback
   ```
7. **Klik**: "CREATE"

### Langkah 7: Copy Credentials

**Client ID** (contoh):
```
123456789-abcdef.apps.googleusercontent.com
```

**Client Secret** (contoh):
```
GOCSPX-abcdefghijklmnopqrstuvwxyz123456
```

## 🔧 Update Configuration

### Update .env file:
```bash
# Ganti dengan credentials baru
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz123456
GOOGLE_CALLBACK_URL=http://localhost:55435/api/auth/google/callback
```

### Restart Backend:
```bash
# Kill existing server
taskkill /F /IM node.exe

# Start dengan credentials baru
cd be-travello
npm start
```

## ✅ Verification

Setelah setup selesai:
1. **Backend**: Google OAuth configured successfully
2. **Frontend**: Google login button muncul
3. **Test**: Klik "Sign up with Google"
4. **Success**: Redirect ke aplikasi setelah login

## 🚨 Common Issues & Solutions

### Issue: "redirect_uri_mismatch"
**Solution**: Pastikan redirect URI di Google Cloud Console sama persis:
```
http://localhost:55435/api/auth/google/callback
```

### Issue: "access_denied"
**Solution**: Tambahkan email Anda di "Test users" di OAuth consent screen

### Issue: "invalid_client"
**Solution**: Periksa Client ID dan Client Secret di .env

## 📱 Testing Flow

1. **Buka frontend**: http://localhost:5173
2. **Klik**: "Sign up with Google"
3. **Login**: Gunakan Google account
4. **Success**: User dibuat di database
5. **Redirect**: Ke ai-chatbot atau halaman yang dituju
