import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';

const router = Router();

// Login endpoint
router.post('/login', AuthController.login);

// Register endpoint  
router.post('/register', AuthController.register);

// Logout endpoint
router.post('/logout', AuthController.logout);

// Get current user
router.get('/me', AuthController.getMe);

export default router;
