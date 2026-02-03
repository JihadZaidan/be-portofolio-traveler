import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/passport.config.js';
import { User } from '../models/User.model.js';

interface AuthenticatedRequest extends Request {
    user?: any;
}

interface ProfileUpdateData {
    username?: string;
    displayName?: string;
    email?: string;
}

class ProfileController {
    // Middleware to verify token
    static async authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');
            
            if (!token) {
                res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
                return;
            }

            const decoded = verifyToken(token);
            const user = await User.findByPk(decoded.id);
            
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            req.user = user;
            next();
        } catch (error: any) {
            console.error('Authentication error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    }

    // Get current user profile
    static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;

            res.json({
                success: true,
                message: 'Profile retrieved successfully',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        displayName: user.displayName,
                        profilePicture: user.profilePicture,
                        role: user.role,
                        isEmailVerified: user.isEmailVerified,
                        googleId: user.googleId,
                        lastLogin: user.lastLogin,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                }
            });
        } catch (error: any) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Update user profile
    static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            const { username, displayName, email }: ProfileUpdateData = req.body;

            // Validate email format if provided
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid email format'
                    });
                    return;
                }
            }

            // Update user data
            const updateData: ProfileUpdateData = {};
            if (username) updateData.username = username.trim();
            if (displayName) updateData.displayName = displayName.trim();
            if (email) updateData.email = email.toLowerCase().trim();

            const [updatedRowsCount] = await User.update(updateData, { where: { id: user.id } });

            if (updatedRowsCount === 0) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Get updated user
            const updatedUser = await User.findByPk(user.id);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: {
                        id: updatedUser.id,
                        username: updatedUser.username,
                        email: updatedUser.email,
                        displayName: updatedUser.displayName,
                        profilePicture: updatedUser.profilePicture,
                        role: updatedUser.role,
                        isEmailVerified: updatedUser.isEmailVerified,
                        lastLogin: updatedUser.lastLogin,
                        createdAt: updatedUser.createdAt,
                        updatedAt: updatedUser.updatedAt
                    }
                }
            });
        } catch (error: any) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Update password
    static async updatePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
                return;
            }

            if (newPassword.length < 6) {
                res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
                return;
            }

            // Check if user has password (Google OAuth users might not)
            if (!user.password) {
                res.status(400).json({
                    success: false,
                    message: 'Please set a password first'
                });
                return;
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
                return;
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 12);

            // Update password
            await User.update({ password: hashedNewPassword }, { where: { id: user.id } });

            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        } catch (error: any) {
            console.error('Update password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update password',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Upload profile picture
    static async uploadProfilePicture(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            const { profilePicture } = req.body;

            if (!profilePicture) {
                res.status(400).json({
                    success: false,
                    message: 'Profile picture URL is required'
                });
                return;
            }

            // Update profile picture
            await User.update({ profilePicture }, { where: { id: user.id } });

            // Get updated user
            const updatedUser = await User.findByPk(user.id);

            res.json({
                success: true,
                message: 'Profile picture updated successfully',
                data: {
                    profilePicture: updatedUser.profilePicture
                }
            });
        } catch (error: any) {
            console.error('Upload profile picture error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload profile picture',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Delete user account
    static async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            const { password } = req.body;

            // For Google OAuth users, allow deletion without password
            if (user.password && !password) {
                res.status(400).json({
                    success: false,
                    message: 'Password is required to delete account'
                });
                return;
            }

            // Verify password if user has one
            if (user.password && password) {
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    res.status(401).json({
                        success: false,
                        message: 'Incorrect password'
                    });
                    return;
                }
            }

            // Delete user
            const deletedRowsCount = await User.destroy({ where: { id: user.id } });

            if (deletedRowsCount === 0) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Clear cookie
            res.clearCookie('token');

            res.json({
                success: true,
                message: 'Account deleted successfully'
            });
        } catch (error: any) {
            console.error('Delete account error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete account',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

export default ProfileController;
