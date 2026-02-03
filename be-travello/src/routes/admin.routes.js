const { Router } = require('express');
const { User, initUser } = require('../models/User.model.js');

const router = Router();

// Get all users
router.get('/users', async (req, res) => {
  try {
    await initUser();
    const users = await User.findAll();
    
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: users.map(user => user.toJSON()),
        count: users.length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await initUser();
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Delete user by ID
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await initUser();
    
    const deleted = await User.destroy({ where: { id } });
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

module.exports = router;
