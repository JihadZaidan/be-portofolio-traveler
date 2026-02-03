import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.config.js";
import chatRoutes from './routes/chat.routes.js';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminTransactionRoutes from './routes/admin-transaction.routes.js';
import { errorHandler } from "./middlewares/error.middleware.js";
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const swaggerDocument = require('./swagger.json');

const app = express();

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
    }
  }
}));

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret_here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware - Enhanced CORS for Swagger UI
app.use(cors({ 
  origin: [
    process.env.CORS_ORIGIN || "http://localhost:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5000/api-docs",
    "http://127.0.0.1:5000/api-docs",
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-API-Key'],
  exposedHeaders: ['Set-Cookie', 'X-Total-Count'],
  maxAge: 86400
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '..', 'public')));

// Explicit route for OAuth2 redirect
app.get('/swagger-oauth2-redirect', (req, res) => {
    res.sendFile(path.join(__dirname, 'swagger-oauth2-redirect.html'));
});

// Explicit route for google-auth-test
app.get('/google-auth-test', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'google-auth-test.html'));
});

// Explicit route for auth page
app.get('/auth.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'auth.html'));
});

// Explicit route for dashboard
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

// Explicit route for payment
app.get('/payment.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'payment.html'));
});

// Explicit route for shop/payment
app.get('/shop/payment', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'payment.html'));
});

// Default route redirect to auth
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'auth.html'));
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API info endpoint
app.get("/api", (req, res) => {
    res.status(200).json({ 
        message: "TRAVELLO API",
        endpoints: {
            chat: "POST /api/chat - Chat with Gemini AI",
            auth: {
                login: "POST /api/auth/login - User login",
                register: "POST /api/auth/register - User registration",
                logout: "POST /api/auth/logout - User logout",
                me: "GET /api/auth/me - Get current user",
                google: "GET /api/auth/google - Google OAuth login",
                googleCallback: "GET /api/auth/google/callback - Google OAuth callback",
                config: "GET /api/auth/config - Check OAuth config"
            },
            profile: {
                get: "GET /api/profile - Get user profile",
                update: "PUT /api/profile - Update user profile",
                updatePassword: "PUT /api/profile/password - Update password",
                uploadPicture: "PUT /api/profile/picture - Upload profile picture",
                delete: "DELETE /api/profile - Delete account"
            },
            payments: {
                process: "POST /api/payments/process - Process payment",
                methods: "GET /api/payments/methods - Get payment methods",
                history: "GET /api/payments/history - Get payment history",
                details: "GET /api/payments/details/:paymentId - Get payment details",
                refund: "POST /api/payments/refund/:paymentId - Refund payment",
                verify: "GET /api/payments/verify/:paymentId - Verify payment status"
            },
            health: "GET /health - Health check"
        }
    });
});

// Works endpoint (portfolio/projects)
app.get("/works", (req, res) => {
    res.status(200).json({ 
        message: "Portfolio Works API",
        data: {
            projects: [
                {
                    id: 1,
                    title: "AI Chatbot",
                    description: "Interactive chatbot powered by Gemini AI",
                    technology: ["React", "Node.js", "Gemini API"],
                    status: "completed"
                },
                {
                    id: 2,
                    title: "Portfolio Website",
                    description: "Personal portfolio and travel blog",
                    technology: ["React", "Vite", "Tailwind CSS"],
                    status: "in-progress"
                }
            ]
        }
    });
});

// API routes
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin/transactions", adminTransactionRoutes);

// Error handling
app.use(errorHandler);

// Catch-all handler for undefined routes (must be last)
app.use((req, res) => {
    res.status(404).json({ 
        error: "Route not found",
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableRoutes: {
            "GET /health": "Health check",
            "GET /api": "API information",
            "GET /works": "Portfolio works",
            "POST /api/chat": "Chat with AI"
        }
    });
});

export default app;
