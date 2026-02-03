# Google OAuth Setup Guide

## 📋 Prerequisites

1. **Google Cloud Console Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity Toolkit API"

## 🔧 Create OAuth 2.0 Credentials

1. **Go to Credentials**
   - Navigate to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" > "OAuth 2.0 Client IDs"

2. **Configure OAuth Consent Screen**
   - Choose "External" for User Type
   - Fill in required fields:
     - **App name**: TRAKOWI Travel Assistant
     - **User support email**: your-email@example.com
     - **Developer contact information**: your-email@example.com

3. **Scopes**
   - Add the following scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`

4. **Test Users** (Development)
   - Add your test email addresses
   - This allows testing before app is verified

5. **Create OAuth 2.0 Client ID**
   - **Application type**: Web application
   - **Name**: TRAKOWI Web Client
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:3001/api/auth/google/callback`

## 📝 Environment Configuration

Create `.env` file in backend root:

```env
# ===============================
# GOOGLE OAUTH
# ===============================
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# ===============================
# JWT CONFIGURATION
# ===============================
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# ===============================
# SESSION CONFIGURATION
# ===============================
SESSION_SECRET=your_session_secret_here_change_in_production
```

## 🚀 Testing the Integration

1. **Start Backend Server**
   ```bash
   cd be-portofolio-traveller
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd fe-portofolio-traveler
   npm run dev
   ```

3. **Test Google Login**
   - Go to `http://localhost:5173`
   - Click "Login Page" button
   - Click "Continue with Google"
   - Complete Google authentication
   - Should redirect back to app with success

## 🔍 Debugging

### Common Issues:

1. **redirect_uri_mismatch**
   - Check that redirect URI in Google Console matches exactly:
   - `http://localhost:3001/api/auth/google/callback`

2. **invalid_client**
   - Verify CLIENT_ID and CLIENT_SECRET are correct
   - Ensure no extra spaces or characters

3. **CORS Issues**
   - Check that `http://localhost:5173` is in authorized JavaScript origins

4. **Token Issues**
   - Verify JWT_SECRET is set in backend
   - Check token expiration settings

### Test Endpoints:

- **Health Check**: `GET http://localhost:3001/health`
- **API Info**: `GET http://localhost:3001/api`
- **Google OAuth Start**: `GET http://localhost:3001/api/auth/google`
- **Current User**: `GET http://localhost:3001/api/auth/me`

## 📱 Production Deployment

For production, update these values:

```env
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

Also update in Google Console:
- **Authorized JavaScript origins**: `https://yourdomain.com`
- **Authorized redirect URIs**: `https://yourdomain.com/api/auth/google/callback`

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file to version control
   - Use strong secrets for JWT and SESSION

2. **HTTPS in Production**
   - Always use HTTPS in production
   - Update all URLs to use `https://`

3. **Domain Verification**
   - Verify your domain in Google Console
   - This removes the "unverified app" warning

## 🎯 Next Steps

1. ✅ Setup Google OAuth credentials
2. ✅ Configure environment variables
3. ✅ Test authentication flow
4. 🔄 Implement user profile management
5. 🔄 Add role-based access control
6. 🔄 Implement refresh tokens
