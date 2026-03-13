const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token and verify admin role
const authenticateAdminToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = (authHeader && authHeader.split(' ')[1]) || req.cookies?.authToken; // Bearer TOKEN or Cookie

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        // Development: Allow admin-local-token for testing
        if (token === 'admin-local-token') {
            req.user = {
                id: 'admin-dev',
                email: 'admin@travello.com',
                username: 'admin',
                role: 'admin',
                displayName: 'Admin User'
            };
            return next();
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }

            // Check if user has admin role
            if (decoded.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            // Ensure userId is properly set
            req.user = {
                userId: decoded.userId || decoded.id,
                email: decoded.email,
                username: decoded.username,
                role: decoded.role,
                displayName: decoded.displayName
            };
            next();
        });

    } catch (error) {
        console.error('❌ Admin auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = (authHeader && authHeader.split(' ')[1]) || req.cookies?.authToken; // Bearer TOKEN or Cookie

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }

            // Ensure userId is properly set
            req.user = {
                userId: decoded.userId || decoded.id,
                email: decoded.email,
                username: decoded.username,
                role: decoded.role,
                displayName: decoded.displayName
            };
            next();
        });

    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                req.user = null;
            } else {
                req.user = decoded;
            }
            next();
        });

    } catch (error) {
        console.error('❌ Optional auth middleware error:', error);
        req.user = null;
        next();
    }
};

module.exports = {
    authenticateToken,
    authenticateAdminToken,
    optionalAuth
};
