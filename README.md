# BE-Portfolio-Traveler

Backend portfolio project for traveler application with authentication and API documentation.

## Authentication & Swagger Configuration

### ✅ Implemented: Redirect/Popup Approach (Recommended)

We have implemented the first recommended approach for handling authentication with Swagger UI using redirect/popup flow with PKCE support.

#### Features Implemented:

1. **OAuth2 Redirect/Popup Flow**
   - Configured Swagger UI with `oauth2RedirectUrl` pointing to `/swagger-oauth2-redirect`
   - PKCE (Proof Key for Code Exchange) support enabled
   - Google OAuth2 authorization with proper scopes (`profile`, `email`)

2. **Security Schemes**
   - **Bearer Token Authentication**: JWT tokens for API access
   - **Google OAuth2**: OAuth2 flow with authorization code grant
   - Both authentication methods supported on protected endpoints

3. **OAuth2 Redirect Handler**
   - Custom redirect page at `/swagger-oauth2-redirect`
   - Handles authorization code exchange with parent window
   - Automatic popup closure after successful authentication

#### How to Use:

1. Navigate to `http://localhost:5000/api-docs`
2. Click the "Authorize" button in Swagger UI
3. Select "googleOAuth" and click "Authorize"
4. Complete Google authentication in the popup
5. The popup will close automatically and token will be stored
6. Use "Try it out" features with authenticated endpoints

#### Configuration:

- **Client ID**: Set via `GOOGLE_CLIENT_ID` environment variable
- **Client Secret**: Set via `GOOGLE_CLIENT_SECRET` environment variable  
- **Redirect URL**: `http://localhost:5000/swagger-oauth2-redirect`
- **Scopes**: `profile`, `email`
- **PKCE**: Enabled for enhanced security

### Alternative Approaches (Not Implemented):

#### 2. Proxy through the backend
Let Swagger call an endpoint on your backend (a single origin). Your controlled backend will exchange the code for a token with Google, avoiding CORS issues from the browser.

#### 3. Set CORS on the server receiving XHR
If direct XHR is necessary, ensure the target server (not Google) sends `Access-Control-Allow-Origin` that allows the Swagger origin. This is usually not possible for Google's own endpoints.

## Project Structure

- `be-travello/` - Backend application
- `fe-travello/` - Frontend application
- `src/` - Source files
- `dist/` - Build output

## Setup

Refer to the following documentation files for detailed setup instructions:

- `GOOGLE_OAUTH_SETUP.md` - Google OAuth configuration
- `DATABASE_SETUP.md` - Database setup guide
- `FRONTEND_GUIDE.md` - Frontend setup
- `CHAT_API_DOCS.md` - Chat API documentation

## Testing

Use the provided test files:
- `test-auth-100-percent.sh` - Complete authentication testing
- `test-oauth-flow.sh` - OAuth flow testing
- `test-auth-api.html` - Authentication API testing
- Various HTML test files for different components
