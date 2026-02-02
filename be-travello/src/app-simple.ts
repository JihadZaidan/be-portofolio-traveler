import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const swaggerDocument = require('./swagger.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();

// Swagger documentation
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
    tryItOutEnabled: true
  }
}));

// Middleware
app.use(cors({ 
  origin: [
    process.env.CORS_ORIGIN || "http://localhost:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
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
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API info endpoint
app.get("/api", (req: Request, res: Response) => {
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

// Basic auth routes (simplified)
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Mock authentication for testing
  if (email === "test@example.com" && password === "password123") {
    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      data: {
        user: {
          id: "1",
          email: "test@example.com",
          username: "testuser",
          displayName: "Test User"
        },
        token: "mock_jwt_token_for_testing"
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

app.post("/api/auth/register", (req: Request, res: Response) => {
  const { username, email, password, displayName } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required'
    });
  }

  // Mock registration for testing
  res.status(201).json({
    success: true,
    message: 'Registration successful! You are now logged in.',
    data: {
      user: {
        id: Date.now().toString(),
        email: email,
        username: username,
        displayName: displayName || username
      },
      token: "mock_jwt_token_for_testing"
    }
  });
});

app.get("/api/auth/me", (req: Request, res: Response) => {
  const token = req.headers?.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  // Mock user data for testing
  res.json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      user: {
        id: "1",
        email: "test@example.com",
        username: "testuser",
        displayName: "Test User"
      }
    }
  });
});

app.post("/api/auth/logout", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Google OAuth endpoints (mock)
app.get("/api/auth/google", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Google OAuth endpoint - Configure Google OAuth in production',
    data: {
      googleAuthUrl: "https://accounts.google.com/oauth/authorize?..."
    }
  });
});

app.get("/api/auth/google/callback", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Google OAuth callback - Configure Google OAuth in production',
    data: {
      user: {
        id: "google_user_id",
        email: "user@gmail.com",
        username: "gmailuser",
        displayName: "Google User"
      },
      token: "mock_google_oauth_token"
    }
  });
});

// Test route
app.get("/api/test", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API is working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend routes
app.get("/", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Travello API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .method { font-weight: bold; color: #007bff; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Travello API Server</h1>
            <p>Server is running successfully!</p>
            
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
            
            <h2>🔑 Test Credentials:</h2>
            <p>Email: test@example.com</p>
            <p>Password: password123</p>
            
            <h2>📖 Documentation:</h2>
            <p><a href="/api-docs">View Swagger Documentation</a></p>
        </div>
    </body>
    </html>
  `);
});

// Error handling
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
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

export default app;
