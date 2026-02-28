const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { passport } = require("./config/passport.config.js");
const http = require('http');
const { Server } = require('socket.io');
const chatRoutes = require('./routes/chat.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const profileRoutes = require('./routes/profile.routes.js');
const paymentRoutes = require('./routes/payment.routes.js');
const adminTransactionRoutes = require('./routes/admin-transaction.routes.js');
const adminRoutes = require('./routes/admin.routes.js');
const socketChatRoutes = require('./routes/socket-chat.routes.js');
const userAdminChatRoutes = require('./routes/user-admin-chat.routes.js');
const certificationRoutes = require('./routes/certification.routes.js');
const experienceRoutes = require('./routes/experience.routes.js');
// const portfolioRoutes = require('./routes/portfolio.routes.js'); // Temporarily disabled
const landingPageRoutes = require('./routes/landing-page.routes.js');
const travelJournalRoutes = require('./routes/travel-journal.routes.js');
const { initChatMessage } = require('./models/ChatMessage.model.js');
const { initUserAdminChatMessage } = require('./models/UserAdminChatMessage.model.js');
// const { initPortfolio } = require('./models/Portfolio.model.mysql.js'); // Temporarily disabled
const { initTravelJournal } = require('./models/TravelJournal.model.mysql.js');
const SocketChatController = require('./controllers/socket-chat.controller.js');
console.log('🔧 Experience routes imported:', typeof experienceRoutes);
const { errorHandler } = require("./middlewares/error.middleware.js");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const path = require('path');

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
app.use("/api/admin", adminRoutes);
app.use("/api/socket/chat", socketChatRoutes);
app.use("/api/user-admin-chat", userAdminChatRoutes);
app.use("/api/certifications", certificationRoutes);
console.log('🔧 Loading experience routes...');
app.use("/api/experiences", experienceRoutes);
console.log('✅ Experience routes loaded');
// app.use("/api/portfolios", portfolioRoutes); // Temporarily disabled
// console.log('✅ Portfolio routes loaded');
app.use("/api/landing-pages", landingPageRoutes);
console.log('✅ Landing pages routes loaded');
// app.use("/api/travel-journal", travelJournalRoutes); // Temporarily disabled
// console.log('✅ Travel journal routes loaded');

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

// Initialize Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Socket.IO chat controller
SocketChatController.initializeSocket(io);

// Initialize database models
initChatMessage().catch(console.error);
initUserAdminChatMessage().catch(console.error);
// initPortfolio().catch(console.error); // Temporarily disabled
// initTravelJournal().catch(console.error); // Temporarily disabled

module.exports = server;
