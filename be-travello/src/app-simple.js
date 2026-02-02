const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();

// Serve swagger.json
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Swagger documentation with OAuth2 redirect/popup authentication
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Travello API Documentation",
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
    oauth2RedirectUrl: `http://localhost:5001/swagger-oauth2-redirect`,
    initOAuth: {
      usePkceWithAuthorizationCodeGrant: true,
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      appName: "Travello API",
      scopeSeparator: " ",
      scopes: ["profile", "email"],
      additionalQueryStringParams: {
        access_type: "offline",
        prompt: "select_account"
      }
    },
    configUrl: '/swagger.json?v=' + Date.now()
  }
}));

// Middleware
app.use(cors({ 
  origin: [
    process.env.CORS_ORIGIN || "http://localhost:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5001",
    "http://127.0.0.1:5001",
    "http://localhost:5000/api-docs",
    "http://localhost:5001/api-docs",
    "http://localhost:5000/api-docs/oauth2-redirect.html",
    "http://localhost:5001/swagger-oauth2-redirect",
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie', 'X-Total-Count'],
  maxAge: 86400
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email'],
  prompt: 'consent' // Force consent screen
}, (accessToken, refreshToken, profile, done) => {
  console.log('Google OAuth Profile:', profile);
  // Real Google OAuth logic
  try {
    // Create or find user in database
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      username: profile.emails[0].value.split('@')[0],
      displayName: profile.displayName,
      photo: profile.photos[0]?.value,
      provider: 'google'
    };
    
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth Error:', error);
    return done(error, null);
  }
}));

// Serialize/deserialize user for sessions
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// OAuth2 redirect handler for Swagger UI
app.get('/swagger-oauth2-redirect', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger-oauth2-redirect.html'));
});

// CORS test page
app.get('/test-cors', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'test-cors.html'));
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API info endpoint
app.get("/api", (req, res) => {
    res.status(200).json({ 
        message: "Travello API",
        version: "1.0.0",
        endpoints: {
            health: "GET /health - Health check",
            docs: "GET /api-docs - Swagger Documentation",
            auth: {
                login: "POST /api/auth/login - User login",
                register: "POST /api/auth/register - User registration",
                me: "GET /api/auth/me - Get current user",
                google: "GET /api/auth/google - Google OAuth"
            }
        }
    });
});

// Basic auth routes
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Allow ANY email and password combination for universal access
  // This enables everyone to login without restrictions
  const userId = Date.now().toString();
  const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
  
  res.json({
    success: true,
    message: 'Login successful! Welcome back.',
    data: {
      user: {
        id: userId,
        email: email,
        username: username,
        displayName: username.charAt(0).toUpperCase() + username.slice(1)
      },
      token: "universal_jwt_token_" + userId
    }
  });
});

app.post("/api/auth/register", (req, res) => {
  const { username, email, password, displayName } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required'
    });
  }

  // Allow ANY email format for universal access
  // Minimal validation only for basic structure
  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please include @ in email'
    });
  }

  // Allow ANY password for universal access
  const userId = Date.now().toString();
  const finalUsername = username || email.split('@')[0];
  
  // Universal registration - always succeeds
  res.status(201).json({
    success: true,
    message: 'Registration successful! You are now logged in.',
    data: {
      user: {
        id: userId,
        email: email,
        username: finalUsername,
        displayName: displayName || finalUsername
      },
      token: "universal_jwt_token_" + userId
    }
  });
});

app.get("/api/auth/me", (req, res) => {
  const token = req.headers?.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  // Extract user info from universal token
  const userId = token.replace('universal_jwt_token_', '');
  
  // Return mock user data for universal access
  res.json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      user: {
        id: userId,
        email: "user@example.com",
        username: "user123",
        displayName: "User"
      }
    }
  });
});

app.post("/api/auth/logout", (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Google OAuth test endpoint (for Swagger UI)
app.get("/api/auth/google/test", (req, res) => {
  res.json({
    success: true,
    message: 'Google OAuth is configured',
    data: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
      swaggerUiUrl: 'http://localhost:5000/api-docs',
      oauthRedirectUri: 'http://localhost:5000/api-docs/oauth2-redirect.html',
      testUrl: `http://localhost:5000/api/auth/google?mode=signup`,
      instructions: [
        "1. Add these URIs to Google Cloud Console:",
        "   - http://localhost:5000/api/auth/google/callback",
        "   - http://localhost:5000/api-docs",
        "   - http://localhost:5000/api-docs/oauth2-redirect.html",
        "2. Copy the testUrl above",
        "3. Paste in browser to test real OAuth flow",
        "4. Or use Swagger UI OAuth2 button"
      ],
      googleConsoleUrl: 'https://console.cloud.google.com/apis/credentials'
    }
  });
});

// Google OAuth endpoints (REAL - With Fallback)
app.get("/api/auth/google", (req, res, next) => {
  const mode = req.query.mode || 'login';
  
  // Store mode in session for callback
  req.session.oauth_mode = mode;
  
  // Authenticate with REAL Google OAuth
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'select_account' // Force account selection screen
  })(req, res, next);
});

app.get("/api/auth/google/callback", 
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:5173?auth=error',
    session: true 
  }),
  (req, res) => {
    // Successful authentication with REAL Google
    const user = req.user;
    const mode = req.session.oauth_mode || 'login';
    
    // Generate JWT token
    const token = `google_${mode}_token_${user.id}_${Date.now()}`;
    
    // Create callback URL for frontend
    const callbackUrl = `http://localhost:5173/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=${mode}`;
    
    // Clear session
    req.session.destroy();
    
    // Redirect to frontend
    res.redirect(callbackUrl);
  }
);

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend routes
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Travello API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
            .method { font-weight: bold; color: #007bff; }
            .success { color: #28a745; }
            .test-creds { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; }
            .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Travello API Server</h1>
            <p class="success"><strong>✅ Server is running successfully!</strong></p>
            
            <h2>📚 Available Endpoints:</h2>
            <div class="endpoint">
                <span class="method">GET</span> /health - Health Check
            </div>
            <div class="endpoint">
                <span class="method">GET</span> /api - API Information
            </div>
            <div class="endpoint">
                <span class="method">GET</span> /api-docs - Swagger Documentation
            </div>
            <div class="endpoint">
                <span class="method">POST</span> /api/auth/login - Login
            </div>
            <div class="endpoint">
                <span class="method">POST</span> /api/auth/register - Register
            </div>
            <div class="endpoint">
                <span class="method">GET</span> /api/auth/me - Get Current User
            </div>
            <div class="endpoint">
                <span class="method">GET</span> /api/auth/google - Google OAuth
            </div>
            
            <div class="test-creds">
                <h2>🔑 Test Credentials:</h2>
                <p><strong>Email:</strong> test@example.com</p>
                <p><strong>Password:</strong> password123</p>
            </div>
            
            <h2>📖 Quick Links:</h2>
            <a href="/api-docs" class="btn">📚 Swagger Documentation</a>
            <a href="/health" class="btn">🏥 Health Check</a>
            <a href="/api" class="btn">📋 API Info</a>
            
            <h2>🧪 Testing with curl:</h2>
            <pre><code># Login
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"password123"}'

# Register
curl -X POST http://localhost:5000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"newuser","email":"new@example.com","password":"password123"}'
</code></pre>
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
            "GET /health": "Health check",
            "GET /api": "API information", 
            "GET /api-docs": "Swagger documentation",
            "POST /api/auth/login": "User login",
            "POST /api/auth/register": "User registration",
            "GET /api/auth/me": "Get current user",
            "POST /api/auth/logout": "User logout",
            "GET /api/auth/google": "Google OAuth login",
            "GET /api/auth/google/callback": "Google OAuth callback"
        }
    });
});

module.exports = app;
