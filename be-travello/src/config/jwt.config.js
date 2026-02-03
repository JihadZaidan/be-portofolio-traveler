import jwt from 'jsonwebtoken';

/**
 * JWT Configuration
 * Handles JWT token generation and verification
 */

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

/**
 * Generate JWT token for user authentication
 * @param {Object} user - User object containing user information
 * @param {string} user.id - User ID
 * @param {string} user.email - User email
 * @param {string} user.username - User username
 * @param {string} user.displayName - User display name
 * @param {string} mode - Authentication mode (login/signup)
 * @returns {string} JWT token
 */
export const generateToken = (user, mode = 'login') => {
    const payload = {
        id: user.id,
        email: user.email,
        username: user.username || user.email?.split('@')[0],
        displayName: user.displayName || user.username,
        provider: user.provider || 'local',
        mode: mode,
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'travello-api',
        audience: 'travello-client'
    });
};

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (userId) => {
    const payload = {
        userId: userId,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'travello-api',
        audience: 'travello-client'
    });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET, {
            issuer: 'travello-api',
            audience: 'travello-client'
        });
    } catch (error) {
        throw new Error(`Token verification failed: ${error.message}`);
    }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
    try {
        return jwt.decode(token, { complete: true });
    } catch (error) {
        throw new Error(`Token decoding failed: ${error.message}`);
    }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return true;
        }
        return Date.now() >= decoded.exp * 1000;
    } catch (error) {
        return true;
    }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} JWT token or null if not found
 */
export const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
};

/**
 * Middleware to verify JWT token in requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required',
                error: 'MISSING_TOKEN'
            });
        }

        // For development, allow mock tokens
        if (token.startsWith('mock_jwt_token_') || token.startsWith('google_')) {
            const mockUser = {
                id: token.split('_').pop() || '12345',
                email: 'user@example.com',
                username: 'testuser',
                displayName: 'Test User',
                provider: 'mock'
            };
            req.user = mockUser;
            return next();
        }

        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

export default {
    generateToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    isTokenExpired,
    extractTokenFromHeader,
    authenticateToken
};
