import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.config.js";
import chatRoutes from "./routes/chat.routes.js";
import improvedChatRoutes from "./routes/improved-chat.routes.js";
import autoChatRoutes from "./routes/auto-chat.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const swaggerDocument = require('./swagger.json');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// Swagger documentation with enhanced CORS support
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
// Session middleware for Passport
app.use(session({
    secret: process.env.SESSION_SECRET,
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
    credentials: true, // Allow cookies for auth
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-API-Key'],
    exposedHeaders: ['Set-Cookie', 'X-Total-Count'],
    maxAge: 86400 // 24 hours
}));
// Explicit pre-flight handling for all routes
app.options('*', cors());
app.use(express.json());
app.use(cookieParser());
// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});
// API info endpoint
app.get("/api", (req, res) => {
    res.status(200).json({
        message: "Gemini Chatbot API",
        endpoints: {
            chat: "POST /api/chat - Chat with Gemini AI",
            auth: {
                login: "POST /api/auth/login - User login",
                logout: "POST /api/auth/logout - User logout",
                me: "GET /api/auth/me - Get current user",
                users: "GET /api/auth/users - Get all users (admin)"
            },
            googleAuth: {
                google: "GET /api/auth/google - Initiate Google OAuth",
                callback: "GET /api/auth/google/callback - Google OAuth callback",
                me: "GET /api/auth/me - Get current user",
                logout: "POST /api/auth/logout - Logout"
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
app.use("/api/chat", improvedChatRoutes); // Use improved chat routes
app.use("/api/chat/legacy", chatRoutes); // Keep legacy routes for compatibility
app.use("/api/auto-chat", autoChatRoutes); // Auto chat bot routes
app.use("/api/auth", authRoutes); // This now includes Google OAuth routes
// Test route to verify API is working
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "API is working",
        timestamp: new Date().toISOString(),
        routes: {
            googleAuth: "/api/auth/google",
            googleCallback: "/api/auth/google/callback",
            authMe: "/api/auth/me"
        }
    });
});
console.log('Routes registered successfully');
// Serve frontend routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/auth.html'));
});
app.get("/google-auth-test", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/google-auth-test.html'));
});
app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/chat.html'));
});
app.get("/auto-chat", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/auto-chat.html'));
});
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
            "POST /api/chat": "Chat with AI",
            "POST /api/auth/login": "User login",
            "POST /api/auth/logout": "User logout",
            "GET /api/auth/me": "Get current user",
            "GET /api/auth/users": "Get all users",
            "GET /api/auth/google": "Google OAuth login",
            "GET /api/auth/google/callback": "Google OAuth callback"
        }
    });
});
export default app;
