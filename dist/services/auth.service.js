import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
class AuthService {
    static generateTokens(user) {
        const accessToken = jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
        const refreshToken = jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
        return { accessToken, refreshToken };
    }
    static verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        }
        catch (error) {
            console.error('Token verification error:', error);
            return null;
        }
    }
    static async refreshTokens(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);
            if (!user) {
                return null;
            }
            return this.generateTokens(user);
        }
        catch (error) {
            console.error('Token refresh error:', error);
            return null;
        }
    }
}
export default AuthService;
