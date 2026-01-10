export const errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(isDevelopment && { stack: err.stack }),
    });
};