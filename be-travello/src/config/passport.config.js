const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const jwt = require('jsonwebtoken');

// Google OAuth Strategy - Only configure if credentials are available
if (process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here') {
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    scope: ['profile', 'email'],
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth Profile:', profile);
      // For now, just return the profile without database operations
      // TODO: Implement proper user database operations when User model is ready
      const user = {
        id: profile.id,
        email: profile.emails?.[0]?.value || '',
        displayName: profile.displayName,
        profilePicture: profile.photos?.[0]?.value
      };
      return done(null, user);
    } catch (error) {
      console.error('Google OAuth Error:', error);
      return done(error, undefined);
    }
  }));
} else {
  console.log('⚠️  Google OAuth credentials not configured. OAuth features will be disabled.');
}

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'fallback_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
};

module.exports = {
  passport,
  GoogleStrategy,
  generateToken,
  verifyToken
};
