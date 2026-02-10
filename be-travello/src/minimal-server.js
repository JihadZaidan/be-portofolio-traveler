const express = require('express');
const cors = require('cors');

const app = express();

// Middleware - CORS
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
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-API-Key'],
  exposedHeaders: ['Set-Cookie', 'X-Total-Count'],
  maxAge: 86400
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Experience routes
const experienceRoutes = require('./routes/experience.routes.js');
app.use('/api/experiences', experienceRoutes);

// Certification routes
const certificationRoutes = require('./routes/certification.routes.js');
app.use('/api/certifications', certificationRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API info endpoint
app.get("/api", (req, res) => {
    res.status(200).json({ 
        message: "TRAVELLO API",
        endpoints: {
            experiences: "GET /api/experiences - Get all experiences",
            certifications: "GET /api/certifications - Get all certifications",
            health: "GET /health - Health check"
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Catch-all handler for undefined routes (must be last)
app.use((req, res) => {
    res.status(404).json({ 
        error: "Route not found",
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableRoutes: {
            "GET /health": "Health check",
            "GET /api": "API information",
            "GET /api/experiences": "Get all experiences",
            "POST /api/experiences": "Create experience",
            "PUT /api/experiences/:id": "Update experience",
            "DELETE /api/experiences/:id": "Delete experience",
            "GET /api/certifications": "Get all certifications",
            "POST /api/certifications": "Create certification",
            "PUT /api/certifications/:id": "Update certification",
            "DELETE /api/certifications/:id": "Delete certification"
        }
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`💬 Experience API: http://localhost:${PORT}/api/experiences`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = app;
