import "dotenv/config";
import { validateEnv } from "./config/env.validation.js";
import { testConnection } from "./config/database.config.js";
import { initUser } from "./models/User.model.js";
import app from "./app.js";
// Validate environment variables
validateEnv();
// Initialize database
const initializeApp = async () => {
    try {
        // Test database connection
        await testConnection();
        // Initialize User table
        await initUser();
        console.log('✅ Database initialized successfully');
        // Start server
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
            console.log(`🔐 Google OAuth: http://localhost:${PORT}/api/auth/google`);
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
    }
    catch (error) {
        console.error('❌ Failed to initialize app:', error);
        process.exit(1);
    }
};
// Start to application
initializeApp();
