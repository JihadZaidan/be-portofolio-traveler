const express = require('express');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { 
  initUser, 
  getAllUsers, 
  findByEmail, 
  create, 
  deleteUser, 
  getUserById,
  findByGoogleId
} = require('./src/models/User.model.mysql.js');

// Load environment variables
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || "http://localhost:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5001",
    "http://127.0.0.1:5001",
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
  secret: process.env.SESSION_SECRET || 'your_session_secret_here_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:55435/api/auth/google/callback",
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists by Google ID
    let user = await findByGoogleId(profile.id);
    
    if (!user) {
      // Check if user exists by email
      user = await findByEmail(profile.emails[0].value);
      
      if (!user) {
        // Create new user
        const userData = {
          username: profile.emails[0].value.split('@')[0],
          email: profile.emails[0].value,
          googleId: profile.id,
          displayName: profile.displayName,
          profilePicture: profile.photos[0]?.value,
          provider: 'google',
          role: 'user',
          isEmailVerified: profile.emails[0].verified || true
        };
        
        user = await create(userData);
        console.log(`✅ New Google user created: ${user.email}`);
      } else {
        // Update existing user with Google ID
        user.googleId = profile.id;
        user.profilePicture = profile.photos[0]?.value;
        user.provider = 'google';
        await user.save();
        console.log(`✅ Existing user linked with Google: ${user.email}`);
      }
    } else {
      console.log(`✅ Existing Google user logged in: ${user.email}`);
    }
    
    return done(null, user);
  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize and deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Serve static files
app.use(express.static(__dirname + '/../public'));

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await initUser();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }
};

// Serve admin login page
app.get('/admin-login', (req, res) => {
  res.sendFile(__dirname + '/../public/admin-login-simple.html');
});

// Serve login/signup page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/../public/auth.html');
});

// Serve admin users page
app.get('/admin/users', (req, res) => {
  res.sendFile(__dirname + '/../public/admin-users.html');
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API info endpoint
app.get("/api", (req, res) => {
    res.status(200).json({ 
        message: "Travello API - Simple Version",
        version: "1.0.0",
        endpoints: {
            health: "GET /health - Health check",
            auth: {
                register: "POST /api/auth/register - User registration",
                login: "POST /api/auth/login - User login"
            },
            admin: {
                users: "GET /api/admin/users - Get all users"
            }
        }
    });
});

// Manual registration endpoint
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, displayName } = req.body;
  const loginPage = req.query.login_page || 'default';
  
  console.log('📝 Registration request:', { username, email, displayName, loginPage });
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required'
    });
  }

  // Basic email validation
  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please include @ in email'
    });
  }

  try {
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
      password: password || 'default123', // In production, hash this
      displayName: displayName || username || email.split('@')[0],
      provider: 'manual',
      role: 'user',
      isEmailVerified: true
    };
    
    const user = await create(userData);
    console.log('✅ New user registered:', user.email);
    
    // Generate token
    const token = `manual_signup_token_${user.id}_${Date.now()}`;
    
    // Check if this is an API request
    const isApiRequest = req.headers.accept?.includes('application/json') || 
                         req.headers['content-type']?.includes('application/json');
    
    if (isApiRequest) {
      // For API requests, return JSON response
      return res.status(201).json({
        success: true,
        message: 'Registration successful! You are now logged in.',
        data: {
          user: user,
          token: token,
          userType: 'regular'
        }
      });
    }
    
    // For browser requests, redirect based on login page
    let redirectUrl;
    
    if (loginPage === 'aichatbot') {
      redirectUrl = `http://localhost:5173/ai-chatbot?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=signup&auth=success`;
    } else if (loginPage === 'work') {
      redirectUrl = `http://localhost:5173/work?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=signup&auth=success`;
    } else {
      // Default redirect to admin/users
      redirectUrl = `http://localhost:5173/admin/users?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=signup&auth=success`;
    }
    
    // Redirect to appropriate page
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

// Manual login endpoint
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const loginPage = req.query.login_page || 'default';
  
  console.log('🔐 Login request:', { email, loginPage });
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    let user = await findByEmail(email);
    
    if (!user) {
      // Create new user if doesn't exist (universal access)
      const userData = {
        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
        email: email,
        password: password, // In production, hash this password
        displayName: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: 'user',
        isEmailVerified: true,
        provider: 'local'
      };
      
      user = await create(userData);
      console.log(`✅ Auto-created new user: ${user.email}`);
    }
    
    // Update last login time
    user.lastLogin = new Date();
    console.log('✅ User logged in:', user.email);
    
    // Generate token
    const token = `manual_login_token_${user.id}_${Date.now()}`;
    
    // Check if this is an API request
    const isApiRequest = req.headers.accept?.includes('application/json') || 
                         req.headers['content-type']?.includes('application/json');
    
    if (isApiRequest) {
      // For API requests, return JSON response
      return res.json({
        success: true,
        message: 'Login successful! Welcome back.',
        data: {
          user: user,
          token: token,
          userType: 'regular'
        }
      });
    }
    
    // For browser requests, redirect based on login page
    let redirectUrl;
    
    if (loginPage === 'aichatbot') {
      redirectUrl = `http://localhost:5173/ai-chatbot?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=login&auth=success`;
    } else if (loginPage === 'work') {
      redirectUrl = `http://localhost:5173/work?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=login&auth=success`;
    } else {
      // Default redirect to admin/users
      redirectUrl = `http://localhost:5173/admin/users?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=login&auth=success`;
    }
    
    // Redirect to appropriate page
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

// Google OAuth endpoints
app.get('/api/auth/google', (req, res) => {
  const { login_page = 'aichatbot', mode = 'login' } = req.query;
  
  // Use the callback URL that's already registered in Google Cloud Console
  const callbackUrl = 'http://localhost:5000/api/auth/google/callback';
  
  // Redirect to Google OAuth with the correct callback
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('profile email')}&` +
    `access_type=offline&` +
    `prompt=select_account&` +
    `state=${encodeURIComponent(JSON.stringify({ login_page, mode }))}`;
  
  console.log(`🔄 Redirecting to Google OAuth: ${login_page} with callback: ${callbackUrl}`);
  res.redirect(302, googleAuthUrl);
});

// Google OAuth callback handler
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.redirect('/login?error=no_code');
    }
    
    // Parse state parameter
    let login_page = 'aichatbot';
    let mode = 'login';
    
    if (state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state));
        login_page = stateData.login_page || 'aichatbot';
        mode = stateData.mode || 'login';
      } catch (e) {
        console.error('Error parsing state:', e);
      }
    }
    
    // Exchange code for tokens (simplified for development)
    console.log(`🔄 Received Google OAuth code for: ${login_page}`);
    
    // For development, create a mock Google user profile
    const mockGoogleUser = {
      id: 'google_' + Date.now(),
      email: 'google.user.' + Math.floor(Math.random() * 1000) + '@gmail.com',
      displayName: 'Google User',
      photos: [{ value: 'https://picsum.photos/100/100?random=' + Date.now() }],
      emails: [{ value: 'google.user.' + Math.floor(Math.random() * 1000) + '@gmail.com', verified: true }]
    };
    
    // Check if user exists by email
    let user = await findByEmail(mockGoogleUser.emails[0].value);
    
    if (!user) {
      // Create new user
      const userData = {
        username: mockGoogleUser.emails[0].value.split('@')[0],
        email: mockGoogleUser.emails[0].value,
        googleId: mockGoogleUser.id,
        displayName: mockGoogleUser.displayName,
        profilePicture: mockGoogleUser.photos[0].value,
        provider: 'google',
        role: 'user',
        isEmailVerified: true
      };
      
      user = await create(userData);
      console.log(`✅ New Google user created: ${user.email}`);
    } else {
      console.log(`✅ Existing Google user logged in: ${user.email}`);
    }
    
    // Generate token
    const token = `google_oauth_token_${user.id}_${Date.now()}`;
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    console.log(`✅ Google OAuth success: ${user.email} (${login_page})`);
    
    // Redirect based on login_page
    let redirectUrl;
    if (login_page === 'aichatbot') {
      redirectUrl = `http://localhost:5173/ai-chatbot?token=${token}&user=${encodeURIComponent(JSON.stringify({
        email: user.email,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        provider: 'google'
      }))}&action=${mode}&auth=success`;
    } else if (login_page === 'shop') {
      redirectUrl = `http://localhost:5173/shop?token=${token}&user=${encodeURIComponent(JSON.stringify({
        email: user.email,
        displayName: user.displayName,
        provider: 'google'
      }))}&action=${mode}&auth=success`;
    } else if (login_page === 'admin') {
      redirectUrl = `http://localhost:5173/admin/users?token=${token}&user=${encodeURIComponent(JSON.stringify({
        email: user.email,
        displayName: user.displayName,
        provider: 'google'
      }))}&action=${mode}&auth=success`;
    } else {
      redirectUrl = `http://localhost:5173/admin/users?token=${token}&user=${encodeURIComponent(JSON.stringify({
        email: user.email,
        displayName: user.displayName,
        provider: 'google'
      }))}&action=${mode}&auth=success`;
    }
    
    res.redirect(302, redirectUrl);
    
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    res.redirect('/login?error=callback_failed');
  }
});

// Get all users (admin endpoint)
app.get("/api/admin/users", async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    
    console.log(`📊 Fetching ${allUsers.length} users for admin panel`);
    
    res.json({
      success: true,
      message: 'All users retrieved successfully',
      data: {
        users: allUsers.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          provider: user.googleId ? 'google' : 'local',
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          created_at: user.createdAt,
          userType: 'regular',
          source: 'Main System'
        })),
        count: allUsers.length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Delete user (admin endpoint)
app.delete("/api/admin/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const success = await deleteUser(userId);
    
    if (success) {
      console.log(`🗑️ User ${userId} deleted successfully`);
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Travello Auth Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/admin/users`);
    console.log(`🔐 Register API: http://localhost:${PORT}/api/auth/register`);
    console.log(`🔐 Login API: http://localhost:${PORT}/api/auth/login`);
    console.log(`📝 Admin login: http://localhost:${PORT}/admin-login`);
    console.log(`📝 User login: http://localhost:${PORT}/login`);
  });
};

startServer().catch(console.error);
