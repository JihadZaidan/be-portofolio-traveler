# 🔧 GitHub OAuth Setup Guide

## 📋 Langkah 1: Buat GitHub OAuth Application

### 1.1 Buka GitHub Developer Settings
1. Login ke GitHub: https://github.com
2. Klik profile photo → **Settings**
3. Scroll ke bawah → **Developer settings**
4. Klik **OAuth Apps** → **New OAuth App**

### 1.2 Create OAuth App
1. **Application name:** TRAVELLO
2. **Homepage URL:** `http://localhost:5173`
3. **Authorization callback URL:** `http://localhost:5173/auth/github/callback`
4. Klik **Register application**

### 1.3 Copy Credentials
Setelah dibuat, Anda akan mendapatkan:
- **Client ID:** (string panjang)
- **Client Secret:** (klik "Generate a new client secret")

## 🔧 Langkah 2: Update Environment Variables

Buka file `.env` di project root:

```env
# ===============================
# GITHUB OAUTH
# ===============================
GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID_HERE
GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET_HERE
GITHUB_CALLBACK_URL=http://localhost:5173/auth/github/callback
```

**Ganti:**
- `YOUR_GITHUB_CLIENT_ID_HERE` dengan Client ID dari GitHub
- `YOUR_GITHUB_CLIENT_SECRET_HERE` dengan Client Secret dari GitHub

## 🔧 Langkah 3: Test GitHub OAuth

### 3.1 Expected Flow:
1. User klik "Login with GitHub"
2. Redirect ke GitHub authorization page
3. User approve permissions
4. Redirect kembali ke frontend dengan code
5. Backend process code dan generate token
6. Login berhasil

## 🐛 GitHub OAuth Issues

### Error: "redirect_uri_mismatch"
**Solution:** Pastikan callback URL sama:
- GitHub App: `http://localhost:5173/auth/github/callback`
- .env: `GITHUB_CALLBACK_URL=http://localhost:5173/auth/github/callback`

### Error: "client_secret_expired"
**Solution:** Generate new client secret di GitHub OAuth App settings

## 📱 Production Setup

Untuk production:
1. Update Homepage URL dan callback URL
2. Gunakan HTTPS URLs
3. Update .env dengan production URLs

## ✅ Quick Setup Commands

```bash
# 1. Buka GitHub OAuth Apps
# https://github.com/settings/applications/new

# 2. Isi form:
# Application name: TRAVELLO
# Homepage URL: http://localhost:5173
# Callback URL: http://localhost:5173/auth/github/callback

# 3. Copy Client ID dan generate Client Secret

# 4. Update .env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```
