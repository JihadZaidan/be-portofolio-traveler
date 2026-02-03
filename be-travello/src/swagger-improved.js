const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:5173',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve oauth2-redirect.html from src directory
app.get('/oauth2-redirect.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'oauth2-redirect.html'));
});

// Enhanced Swagger UI configuration with OAuth2
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: "none",
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    tryItOutEnabled: true,
    oauth2RedirectUrl: `http://localhost:${PORT}/oauth2-redirect.html`,
    initOAuth: {
      // Use PKCE for enhanced security (recommended for public clients)
      usePkceWithAuthorizationCodeGrant: true,
      
      // Google OAuth Client Configuration
      clientId: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id_here',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret_here',
      appName: "Travello API",
      
      // OAuth2 Scopes
      scopeSeparator: " ",
      scopes: ["profile", "email"],
      
      // Additional query parameters for Google OAuth
      additionalQueryStringParams: {
        access_type: "offline",    // Get refresh token
        prompt: "select_account",  // Force account selection
        include_granted_scopes: "true"
      },
      
      // Custom configuration for better UX
      redirectUrl: `http://localhost:${PORT}/oauth2-redirect.html`,
      
      // Enable token persistence
      persistAuthorization: true
    },
    
    // Custom CSS for better UI
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #4285f4; }
      .swagger-ui .scheme-container { background: #f8f9fa; }
      .authorize__btn { background: #4285f4 !important; }
      .authorize__btn:hover { background: #357ae8 !important; }
      .swagger-ui .opblock.opblock.post .opblock-summary { 
        background: #4285f4; 
        border-color: #4285f4; 
      }
      .swagger-ui .opblock.opblock.post .opblock-summary:hover { 
        background: #357ae8; 
        border-color: #357ae8; 
      }
    `,
    
    // Event handlers for OAuth2 flow
    onComplete: function() {
      console.log('Swagger UI loaded successfully');
      addOAuth2EventListeners();
    },
    
    // Error handling
    onError: function(error) {
      console.error('Swagger UI Error:', error);
      showNotification('Error loading Swagger UI: ' + error.message, 'error');
    }
  }
};

// Setup Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    message: "Travello API is running"
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: "Travello API",
    version: "1.0.0",
    endpoints: {
      docs: "GET /api-docs - Swagger Documentation with OAuth2",
      health: "GET /health - Health Check",
      auth: {
        google: "GET /api/auth/google - Google OAuth",
        login: "POST /api/auth/login - Manual Login",
        register: "POST /api/auth/register - Manual Registration"
      },
      admin: {
        users: "GET /api/admin/users - Get All Users"
      }
    }
  });
});

// Google OAuth test endpoint
app.get('/api/auth/google/test', (req, res) => {
  res.json({
    success: true,
    message: 'Google OAuth is configured',
    data: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
      swaggerUiUrl: `http://localhost:${PORT}/api-docs`,
      oauthRedirectUri: `http://localhost:${PORT}/oauth2-redirect.html`,
      testUrl: `http://localhost:${PORT}/api/auth/google?mode=signup`,
      instructions: [
        "1. Add these URIs to Google Cloud Console:",
        `   - http://localhost:${PORT}/api/auth/google/callback`,
        `   - http://localhost:${PORT}/oauth2-redirect.html`,
        "2. Click 'Authorize' in Swagger UI",
        "3. Select 'googleOAuth' and complete authentication",
        "4. Token will be stored for API requests"
      ],
      googleConsoleUrl: 'https://console.cloud.google.com/apis/credentials'
    }
  });
});

// Google OAuth endpoint (simplified for testing)
app.get('/api/auth/google', (req, res) => {
  const mode = req.query.mode || 'login';
  
  const authUrl = `https://accounts.google.com/oauth/authorize?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/api/auth/google/callback`)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('profile email')}&` +
    `access_type=offline&` +
    `prompt=select_account&` +
    `state=${mode}`;
  
  res.json({
    success: true,
    message: 'Google OAuth URL generated',
    data: { 
      authUrl,
      mode,
      instructions: 'Open this URL in a browser to authenticate with Google'
    }
  });
});

// Add event listeners for OAuth2 flow
function addOAuth2EventListeners() {
  // Listen for OAuth2 authorization events
  if (typeof window !== 'undefined') {
    window.addEventListener('message', function(event) {
      // Verify origin for security
      if (event.origin !== `http://localhost:${PORT}`) return;
      
      if (event.data.type === 'authorization_code') {
        console.log('OAuth2 authorization code received:', event.data.code);
        showNotification('OAuth2 authorization successful!', 'success');
      } else if (event.data.type === 'authorization_error') {
        console.error('OAuth2 authorization error:', event.data.error);
        showNotification('OAuth2 authorization failed: ' + event.data.error, 'error');
      }
    });
  }
}

// Show notification to user (server-side alternative)
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// Default route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Travello API</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #4285f4; text-align: center; }
            .links { text-align: center; margin-top: 30px; }
            .btn { display: inline-block; margin: 10px; padding: 12px 24px; background: #4285f4; color: white; text-decoration: none; border-radius: 5px; }
            .btn:hover { background: #357ae8; }
            .status { background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Travello API</h1>
            <div class="status">
                ✅ Server is running successfully on port ${PORT}
            </div>
            <div class="links">
                <a href="/api-docs" class="btn">📚 API Documentation</a>
                <a href="/health" class="btn">🏥 Health Check</a>
                <a href="/api/auth/google/test" class="btn">🔐 Test Google OAuth</a>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: {
      "GET /": "Home page",
      "GET /health": "Health check",
      "GET /api": "API information",
      "GET /api-docs": "Swagger documentation with OAuth2",
      "GET /api/auth/google/test": "Test Google OAuth configuration",
      "GET /api/auth/google": "Google OAuth endpoint"
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔐 Google OAuth: http://localhost:${PORT}/api/auth/google`);
  console.log(`🌍 Frontend: http://localhost:${PORT}/`);
});

module.exports = app;
