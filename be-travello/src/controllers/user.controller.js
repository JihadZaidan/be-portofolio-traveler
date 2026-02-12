const { User } = require('../models/User.model');

// Get user profile from database
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'avatar', 'phone', 'address']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile'
        });
    }
};

module.exports = {
    getUserProfile
};
