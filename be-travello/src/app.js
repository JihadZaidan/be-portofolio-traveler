const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');

// Swagger UI imports
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');

// Load environment variables
dotenv.config();

// Database connection
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');

// Connect to MySQL/MariaDB (primary database for phpMyAdmin)
let mysqlConnection = null;

async function connectMySQL() {
    try {
        if (process.env.DATABASE_TYPE === 'mysql') {
            mysqlConnection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || '127.0.0.1',
                port: Number(process.env.MYSQL_PORT) || 3306,
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'travello_db'
            });
            
            console.log('✅ MySQL User model initialized');
            console.log('🗄️ Connected to MySQL/MariaDB');
            
            // Create users table if not exists
            await mysqlConnection.execute(`
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(255) PRIMARY KEY,
                    googleId VARCHAR(255),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    displayName VARCHAR(255),
                    password VARCHAR(255),
                    profilePicture TEXT,
                    avatar TEXT,
                    provider ENUM('local', 'google', 'facebook') DEFAULT 'local',
                    loginPage VARCHAR(50) DEFAULT 'default',
                    phone VARCHAR(20),
                    dateOfBirth DATE,
                    gender ENUM('male', 'female', 'other') DEFAULT 'other',
                    address_street TEXT,
                    address_city VARCHAR(100),
                    address_province VARCHAR(100),
                    address_postalCode VARCHAR(10),
                    address_country VARCHAR(100) DEFAULT 'Indonesia',
                    travelPreferences_favoriteDestinations JSON,
                    travelPreferences_travelStyle VARCHAR(50) DEFAULT 'budget',
                    travelPreferences_interests JSON,
                    isVerified BOOLEAN DEFAULT false,
                    isActive BOOLEAN DEFAULT true,
                    lastLogin TIMESTAMP NULL,
                    role ENUM('user', 'admin') DEFAULT 'user',
                    totalTransactions INT DEFAULT 0,
                    totalSpent DECIMAL(10,2) DEFAULT 0.00,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            
            console.log('📋 Users table created/verified');
            
        } else {
            console.log('⚠️  MySQL not configured, skipping MySQL connection');
        }
    } catch (error) {
        console.error('❌ MySQL connection failed:', error);
    }
}

// Connect to MongoDB (for AdminChat model)
async function connectMongoDB() {
    try {
        if (process.env.DATABASE_TYPE !== 'mongodb') {
            console.log('ℹ️  MongoDB disabled (DATABASE_TYPE is not "mongodb")');
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travello_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds timeout
            bufferMaxEntries: 0, // Disable mongoose buffering
            bufferCommands: false, // Disable mongoose buffering
        });
        console.log('✅ MongoDB connected');
        
        // Test connection
        const db = mongoose.connection.db;
        await db.admin().ping();
        console.log('✅ MongoDB connection verified');
    } catch (error) {
        console.log('⚠️  MongoDB not connected, using MySQL only');
        console.error('MongoDB connection error:', error.message);
    }
}

// Initialize models
async function initializeModels() {
    try {
        // Wait for UserMySQL to initialize properly
        const UserMySQL = require('./models/UserMySQL');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Give time for connection
        
        require('./models/AdminChat');
        require('./models/Portfolio');
        require('./models/Transaction');
        
        // Initialize ShopItem with proper error handling
        try {
            const ShopItem = require('./models/ShopItem');
            console.log('✅ ShopItem model initialized');
        } catch (error) {
            console.error('❌ Error initializing ShopItem model:', error);
        }
        
        // Initialize AdminChatMySQL tables
        try {
            const AdminChatMySQL = require('./models/AdminChatMySQL');
            console.log('🔄 Initializing AdminChatMySQL tables...');
            await AdminChatMySQL.initializeTable();
            console.log('✅ AdminChatMySQL tables initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing AdminChatMySQL:', error);
        }
        
        console.log('📋 Database models initialized');
    } catch (error) {
        console.error('❌ Error initializing models:', error);
    }
}

// Initialize connections and models
async function initializeApp() {
    await connectMySQL();
    await connectMongoDB();
    await initializeModels();
    
    // Start server after initialization
    startServer();
}

// Start server function
function startServer() {
    server.listen(PORT, () => {
        console.log(`🚀 TRAVELLO Server running on port ${PORT}`);
        console.log(`📁 Static files served from: ${path.join(__dirname, '../public')}`);
        console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🔌 Socket.IO server ready for real-time chat`);
    });
}

const app = express();
const PORT = process.env.PORT || 55435;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'http://localhost:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize Passport
const passport = require('./config/passport.config');
app.use(passport.initialize());

// Session middleware for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'travello-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
const landingPageRoutes = require('./routes/landingPage.routes');
const travelJournalRoutes = require('./routes/travelJournal.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const certServiceRoutes = require('./routes/certService.routes');
const experienceRoutes = require('./routes/experience.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const dynamicAuthRoutes = require('./routes/dynamic-auth.routes');
const shopRoutes = require('./routes/shop.routes');
const paymentRoutes = require('./routes/payment.routes');
const debugRoutes = require('./routes/debug.routes');
const mediaRoutes = require('./routes/media.routes');
const { chat } = require('./controllers/ai-chatbot.controller');

// Test Midtrans service initialization
try {
    const midtransService = require('./services/midtrans.service');
    console.log('🔧 Midtrans service loaded successfully');
} catch (error) {
    console.error('❌ Failed to load Midtrans service:', error.message);
}

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'TRAVELLO API Documentation'
}));

// API JSON Documentation
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/api/landing-page', landingPageRoutes);
app.use('/api/travel-journal', travelJournalRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/cert-service', certServiceRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dynamic-auth', dynamicAuthRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/debug', debugRoutes);

// AI Chatbot endpoint
app.post('/api/chat', chat);

// Socket.IO Chat Controller
const SocketChatController = require('./controllers/socket-chat.controller');
const socketChatController = new SocketChatController();

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('🔗 Socket.IO client connected:', socket.id);
  socketChatController.handleConnection(io, socket);
});

// Broadcast connection stats every 30 seconds
setInterval(() => {
  const stats = socketChatController.getStats();
  io.emit('connection_stats', stats);
  console.log('📊 Connection Stats:', stats);
}, 30000);

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/auth.html'));
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TRAVELLO Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start server
// Note: server is started in startServer() function called from initializeApp()

// Initialize connections and models
initializeApp();

module.exports = app;
