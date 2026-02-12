const { Router } = require('express');
const { authenticateToken } = require('../middlewares/auth.middleware.js');
const { 
  initController, 
  adminLogin, 
  verifyAdminToken 
} = require('../controllers/admin-auth.controller.js');

const router = Router();

// Initialize controller
initController().catch(console.error);

// Admin login endpoint
router.post('/login', adminLogin);

// Verify admin token (protected)
router.get('/verify', authenticateToken, verifyAdminToken);

module.exports = router;
