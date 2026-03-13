# Google OAuth Development Setup

## Quick Fix untuk Development

### Option 1: Update Google Cloud Console (Recommended)

1. **Buka Google Cloud Console**
   - https://console.cloud.google.com/apis/credentials
   - Pilih project Anda

2. **Edit OAuth 2.0 Client ID**
   - Client ID: `861209908201-nqe32tsj61ht3msht9rr6ve2el5dlfkr.apps.googleusercontent.com`
   - Klik edit (ikon pencil)

3. **Update Authorized Redirect URIs**
   ```
   http://localhost:55435/api/auth/google/callback
   ```

4. **Save dan tunggu 1-2 menit**

### Option 2: Gunakan Environment Variables

Jika tidak bisa akses Google Cloud Console, gunakan credentials alternatif:

```bash
# Set environment variables
$env:GOOGLE_CLIENT_ID="your_client_id_here"
$env:GOOGLE_CLIENT_SECRET="your_client_secret_here"
$env:GOOGLE_CALLBACK_URL="http://localhost:55435/api/auth/google/callback"

# Restart server
npm start
```

### Option 3: Disable Google OAuth (Temporary)

Untuk testing manual registration/login saja:

```javascript
// Di passport.config.js, comment out Google Strategy
/*
if (googleClientId && googleClientSecret) {
    // ... Google OAuth configuration
}
*/
```

## Current Backend Status
- ✅ Manual Registration: Working
- ✅ Manual Login: Working  
- ✅ Database Integration: Working
- ✅ Admin Endpoints: Working
- ⚠️ Google OAuth: Need redirect URI fix

## Testing Manual Auth
```bash
# Registration
curl -X POST http://localhost:55435/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","displayName":"Test User","password":"password123"}'

# Login
curl -X POST http://localhost:55435/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Frontend Integration
Frontend sudah dikonfigurasi untuk port 55435 dan siap digunakan untuk manual authentication.
