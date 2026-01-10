export const successResponse = (res, data, message = "Success") => {
    res.status(200).json({
        message,
        data,
    });
};

export const errorResponse = (res, error, statusCode = 500) => {
    res.status(statusCode).json({
        message: error.message || "Internal Server Error",
        error: true,
    });
};