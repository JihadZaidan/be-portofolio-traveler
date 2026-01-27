import { Router } from 'express';
import passport from 'passport';
import AuthController from '../controllers/auth.controller.js';
import { generateToken } from '../config/passport.config.js';
const router = Router();
// Local Authentication
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getMe);
// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
    const user = req.user;
    const token = generateToken(user);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    });
    res.redirect('/'); // Redirect to your frontend app
});
export default router;
