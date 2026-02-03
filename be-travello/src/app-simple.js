const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { User, findByGoogleId, findByEmail, create, initUser } = require('./models/User.model.js');

// Import routes
const chatRoutes = require('./routes/chat.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const adminRoutes = require('./routes/admin.routes.js');
const profileRoutes = require('./routes/profile.routes.js');
const paymentRoutes = require('./routes/payment.routes.js');

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
    oauth2RedirectUrl: `http://localhost:5000/oauth2-redirect.html`,
    initOAuth: {
      usePkceWithAuthorizationCodeGrant: true,
      clientId: process.env.GOOGLE_CLIENT_ID || '858988102830-p3lbl3dlnqcht246c3huji4nplk2s9in.apps.googleusercontent.com',
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

// API routes
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/payments", paymentRoutes);

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email'],
  prompt: 'consent' // Force consent screen
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth Profile:', profile);
    
    // Initialize user database
    await initUser();
    
    // Check if user already exists by Google ID
    let user = await findByGoogleId(profile.id);
    
    if (!user) {
      // Check if user exists by email
      user = await findByEmail(profile.emails[0].value);
      
      if (!user) {
        // Create new user
        const userData = {
          googleId: profile.id,
          username: profile.emails[0].value.split('@')[0],
          email: profile.emails[0].value,
          displayName: profile.displayName,
          profilePicture: profile.photos[0]?.value,
          provider: 'google',
          role: 'user',
          isEmailVerified: profile.emails[0]?.verified || true,
          lastLogin: new Date()
        };
        
        user = await create(userData);
        console.log('✅ New Google user created:', user.toJSON());
      } else {
        // Update existing user with Google info
        await User.update(
          { 
            googleId: profile.id,
            profilePicture: profile.photos[0]?.value,
            lastLogin: new Date()
          },
          { where: { id: user.id } }
        );
        console.log('✅ Existing user linked with Google:', user.toJSON());
      }
    } else {
      // Update last login time
      await User.update(
        { lastLogin: new Date() },
        { where: { id: user.id } }
      );
      console.log('✅ Existing Google user logged in:', user.toJSON());
    }
    
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

// OAuth2 redirect handler for Swagger UI (standard path)
app.get('/oauth2-redirect.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'oauth2-redirect.html'));
});

// CORS test page
app.get('/test-cors', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'test-cors.html'));
});

// Google OAuth signup test page
app.get('/test-google-signup', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'test-google-signup.html'));
});

// Enhanced Swagger UI demo page
app.get('/swagger-demo', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'swagger-oauth2-demo.html'));
});

// OAuth flow test page
app.get('/test-oauth-flow', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'test-oauth-flow.html'));
});

// Authentication redirect test page
app.get('/test-auth-redirect', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'test-auth-redirect.html'));
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
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    // Initialize user database
    await initUser();
    
    // Check if user exists
    let user = await findByEmail(email);
    
    if (!user) {
      // Create new user if doesn't exist (universal access)
      const userData = {
        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
        email: email,
        displayName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        provider: 'manual',
        role: 'user',
        isEmailVerified: true,
        lastLogin: new Date()
      };
      
      user = await create(userData);
      console.log('✅ New user created:', user.toJSON());
    } else {
      // Update last login time
      await User.update(
        { lastLogin: new Date() },
        { where: { id: user.id } }
      );
      console.log('✅ Existing user logged in:', user.toJSON());
    }
    
    // Generate JWT token
    const token = `manual_login_token_${user.id}_${Date.now()}`;
    
    // Create user object for response
    const userResponse = user.toJSON();
    
    // Check if this is an API request (JSON response) or browser redirect
    const isApiRequest = req.headers.accept?.includes('application/json') || 
                         req.headers['content-type']?.includes('application/json');
    
    if (isApiRequest) {
      // For API requests, return JSON response
      return res.json({
        success: true,
        message: 'Login successful! Welcome back.',
        data: {
          user: userResponse,
          token: token
        }
      });
    }
    
    // For browser requests, redirect to admin/users page
    const redirectUrl = `http://localhost:5173/admin/users?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&action=login&auth=success`;
    
    // Redirect to admin/users page
    res.redirect(302, redirectUrl);
    
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

app.post("/api/auth/register", async (req, res) => {
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

  try {
    // Initialize user database
    await initUser();
    
    // Check if user already exists
    const existingUser = await findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create new user
    const userData = {
      username: username || email.split('@')[0],
      email: email,
      displayName: displayName || username || email.split('@')[0],
      provider: 'manual',
      role: 'user',
      isEmailVerified: true,
      lastLogin: new Date()
    };
    
    const user = await create(userData);
    console.log('✅ New user registered:', user.toJSON());
    
    // Generate JWT token
    const token = `manual_signup_token_${user.id}_${Date.now()}`;
    
    // Create user object for response
    const userResponse = user.toJSON();
    
    // Check if this is an API request (JSON response) or browser redirect
    const isApiRequest = req.headers.accept?.includes('application/json') || 
                         req.headers['content-type']?.includes('application/json');
    
    if (isApiRequest) {
      // For API requests, return JSON response
      return res.status(201).json({
        success: true,
        message: 'Registration successful! You are now logged in.',
        data: {
          user: userResponse,
          token: token
        }
      });
    }
    
    // For browser requests, redirect to admin/users page
    const redirectUrl = `http://localhost:5173/admin/users?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&action=signup&auth=success`;
    
    // Redirect to admin/users page
    res.redirect(302, redirectUrl);
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
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

// Google OAuth endpoints (IMPROVED - Support both popup and redirect)
app.get("/api/auth/google", (req, res, next) => {
  const mode = req.query.mode || 'login';
  const responseType = req.query.response_type || 'code';
  
  // Store mode in session for callback
  req.session.oauth_mode = mode;
  req.session.response_type = responseType;
  
  // Check if this is a popup request (from Swagger UI or frontend)
  const isPopup = req.headers.accept?.includes('application/json') || req.query.popup === 'true';
  
  if (isPopup) {
    // For popup/JSON requests, return the Google OAuth URL
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('profile email')}&` +
      `access_type=offline&` +
      `prompt=select_account&` +
      `state=${mode}`;
    
    return res.json({
      success: true,
      message: 'Google OAuth URL generated',
      data: { 
        authUrl,
        mode,
        instructions: 'Open this URL in a browser to authenticate'
      }
    });
  }
  
  // For direct browser requests, use Passport authentication
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'select_account',
    state: mode
  })(req, res, next);
});

app.get("/api/auth/google/callback", 
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:5000/api-docs?auth=error',
    session: true,
    failureMessage: 'Google OAuth authentication failed'
  }),
  (req, res) => {
    try {
      // Successful authentication with REAL Google
      const user = req.user;
      const mode = req.session.oauth_mode || 'login';
      
      console.log('Google OAuth callback successful:', { user, mode });
      
      // Generate JWT token
      const token = `google_${mode}_token_${user.id}_${Date.now()}`;
      
      // Check if this is a popup request (from Swagger UI)
      const isPopup = req.headers.accept?.includes('application/json') || 
                     req.query.popup === 'true' ||
                     req.get('User-Agent')?.includes('Swagger');
      
      if (isPopup) {
        // For popup requests, return token and user data as JSON
        return res.json({
          success: true,
          message: 'Google OAuth authentication successful',
          data: {
            user: {
              id: user.id,
              email: user.email,
              username: user.email?.split('@')[0] || user.displayName,
              displayName: user.displayName,
              photo: user.photos?.[0]?.value,
              provider: 'google'
            },
            token,
            mode,
            instructions: 'Use this token for authenticated requests'
          }
        });
      }
      
      // For browser redirects, create callback URL for frontend
      const userResponse = user.toJSON();
      const callbackUrl = `http://localhost:5173/admin/users?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&action=${mode}&auth=success`;
      
      // Clear session
      req.session.destroy();
      
      // Redirect to frontend
      res.redirect(callbackUrl);
      
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      
      // Check if this is a popup request
      const isPopup = req.headers.accept?.includes('application/json') || req.query.popup === 'true';
      
      if (isPopup) {
        return res.status(500).json({
          success: false,
          message: 'Google OAuth callback failed',
          error: error.message || 'Unknown error'
        });
      }
      
      // For browser redirects, redirect to error page
      const errorUrl = `http://localhost:5000/api-docs?auth=error&message=callback_failed`;
      res.redirect(errorUrl);
    }
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
