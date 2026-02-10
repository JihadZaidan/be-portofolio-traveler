require('dotenv').config();
const server = require('./src/app.js');

// Start server (Socket.IO already initialized in app.js)
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
    console.log(`🔐 Google OAuth: http://localhost:${PORT}/api/auth/google`);
    console.log(`🌍 Frontend: http://localhost:${PORT}/`);
    console.log(`🔌 Socket.IO: ws://localhost:${PORT}`);
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
