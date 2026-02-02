import { Response } from 'express';

export const successResponse = (res: Response, data: any, message: string = "Success"): void => {
    res.status(200).json({
        message,
        data,
    });
};

export const errorResponse = (res: Response, error: Error | string, statusCode: number = 500): void => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    res.status(statusCode).json({
        message: errorMessage || "Internal Server Error",
        error: true,
    });
};
