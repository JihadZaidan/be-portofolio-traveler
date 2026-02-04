import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/passport.config.js';
import { User } from '../models/User.model.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: No token provided',
        error: 'Authentication token is required'
      });
      return;
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: User not found',
        error: 'User associated with token does not exist'
      });
      return;
    }

    req.user = user.toJSON();
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Invalid token',
      error: error instanceof Error ? error.message : 'Token verification failed'
    });
  }
};

// Keep the old name for backward compatibility
export const isAuthenticated = authenticateToken;
