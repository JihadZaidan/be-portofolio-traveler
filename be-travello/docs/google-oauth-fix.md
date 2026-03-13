# Google OAuth Redirect URI Fix

## Problem
Error 400: redirect_uri_mismatch saat mencoba login dengan Google.

## Cause
Redirect URI yang terdaftar di Google Cloud Console tidak cocok dengan yang digunakan di aplikasi.

## Solution

### 1. Buka Google Cloud Console
- Kunjungi: https://console.cloud.google.com/
- Pilih project yang digunakan
- Menu: APIs & Services → Credentials

### 2. Edit OAuth 2.0 Client ID
- Cari client ID: `861209908201-nqe32tsj61ht3msht9rr6ve2el5dlfkr.apps.googleusercontent.com`
- Klik edit (ikon pencil)

### 3. Update Authorized Redirect URIs
Hapus URI lama dan tambahkan yang baru:

**Authorized Redirect URis:**
```
http://localhost:55435/api/auth/google/callback
```

**Additional URIs (if needed for development):**
```
http://localhost:55435/api/auth/google/callback
http://127.0.0.1:55435/api/auth/google/callback
```

### 4. Save Changes
- Klik "Save" atau "Update"
- Tunggu beberapa menit untuk perubahan生效

### 5. Test Google OAuth
- Restart backend server
- Coba login dengan Google lagi

## Current Configuration
- **Backend URL**: http://localhost:55435
- **Callback URL**: http://localhost:55435/api/auth/google/callback
- **Frontend URL**: http://localhost:5173

## Verification
Setelah perbaikan, Google OAuth seharusnya berfungsi dan user akan di-redirect kembali ke aplikasi setelah login.
