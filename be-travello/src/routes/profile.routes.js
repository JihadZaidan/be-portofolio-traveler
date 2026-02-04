const { Router } = require('express');
const ProfileController = require('../controllers/profile.controller.js');

const router = Router();

// Apply authentication middleware to all profile routes
router.use(ProfileController.authenticate);

// Get current user profile
router.get('/', ProfileController.getProfile);

// Update user profile
router.put('/', ProfileController.updateProfile);

// Update password
router.put('/password', ProfileController.updatePassword);

// Upload profile picture
router.put('/picture', ProfileController.uploadProfilePicture);

// Delete user account
router.delete('/', ProfileController.deleteAccount);

module.exports = router;
