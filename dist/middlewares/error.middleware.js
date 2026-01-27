const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log error
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { ...error, message, statusCode: 404 };
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { ...error, message, statusCode: 400 };
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = 'Validation Error';
        error = { ...error, message, statusCode: 400 };
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { ...error, message, statusCode: 401 };
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { ...error, message, statusCode: 401 };
    }
    // Sequelize errors
    if (err.name === 'SequelizeValidationError') {
        const message = 'Validation Error';
        error = { ...error, message, statusCode: 400 };
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
        const message = 'Duplicate field value';
        error = { ...error, message, statusCode: 400 };
    }
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        const message = 'Foreign key constraint error';
        error = { ...error, message, statusCode: 400 };
    }
    // Default error
    const statusCode = error.statusCode || 500;
    const status = error.status || 'error';
    res.status(statusCode).json({
        success: false,
        error: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
export { errorHandler };
