const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserMySQL = require('../models/UserMySQL');
const MediaMySQL = require('../models/MediaMySQL');

// Check if Google OAuth credentials are available
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Temporarily disable Google OAuth for development
const enableGoogleOAuth = true; // Set to true to enable

if (googleClientId && googleClientSecret && enableGoogleOAuth) {
    // Log configuration for debugging
    console.log('🔧 Google OAuth Configuration:', {
        clientId: googleClientId.substring(0, 20) + '...',
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        enableGoogleOAuth: enableGoogleOAuth
    });
    
    // Configure Google OAuth Strategy
    passport.use(new GoogleStrategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:55435/api/auth/google/callback",
        proxy: true // Support for reverse proxy
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('🔍 Google OAuth Profile received:', {
                id: profile.id,
                email: profile.emails?.[0]?.value,
                displayName: profile.displayName,
                provider: profile.provider
            });
            
            // Validate profile data
            if (!profile.emails || !profile.emails[0]?.value) {
                console.error('❌ No email in Google profile');
                return done(new Error('No email provided by Google'), null);
            }
            
            const email = profile.emails[0].value;
            
            // Check if user already exists
            let existingUser = await UserMySQL.findOne({ email: email }) ||
                              await UserMySQL.findOne({ googleId: profile.id });
            
            if (existingUser) {
                console.log('✅ Existing Google user found:', existingUser.email);
                
                // Update Google ID if not present
                if (!existingUser.googleId) {
                    await UserMySQL.update(existingUser.id, {
                        googleId: profile.id,
                        provider: 'google'
                    });
                    existingUser = await UserMySQL.findById(existingUser.id);
                }
                
                // Update last login
                await UserMySQL.update(existingUser.id, {
                    lastLogin: new Date()
                });
                
                console.log('✅ Google user login successful:', existingUser.email);
                return done(null, existingUser);
            }
            
            // Create new user from Google profile
            const userId = `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            let storedProfilePicture = profile.photos?.[0]?.value || null;
            if (storedProfilePicture) {
                try {
                    const resp = await fetch(storedProfilePicture);
                    const arrayBuffer = await resp.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const mimeType = resp.headers.get('content-type') || 'image/jpeg';
                    const created = await MediaMySQL.create({
                        fileName: `google_avatar_${userId}`,
                        mimeType,
                        buffer
                    });
                    storedProfilePicture = `/api/media/${created.id}`;
                } catch (e) {
                    console.warn('⚠️ Failed to store Google avatar in DB, keeping remote URL');
                }
            }

            const newUser = {
                id: userId,
                googleId: profile.id,
                email: email,
                username: email.split('@')[0],
                displayName: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || email.split('@')[0],
                profilePicture: storedProfilePicture,
                password: null, // No password for Google users
                isActive: true,
                isVerified: true, // Google users are pre-verified
                lastLogin: new Date(),
                loginPage: 'google',
                provider: 'google',
                role: 'user'
            };
            
            console.log('👤 Creating new Google user:', {
                email: newUser.email,
                username: newUser.username,
                displayName: newUser.displayName
            });
            
            // Save to database
            try {
                await UserMySQL.create(newUser);
                console.log('✅ New Google user created successfully:', newUser.email);
                return done(null, newUser);
            } catch (dbError) {
                console.error('❌ Database error creating user:', dbError);
                return done(new Error('Failed to create user in database'), null);
            }
            
        } catch (error) {
            console.error('❌ Google OAuth error:', error);
            return done(error, null);
        }
    }
    ));
    
    console.log('✅ Google OAuth configured successfully');
} else {
    console.log('⚠️  Google OAuth credentials not found. Google login will be disabled.');
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserMySQL.findById(id);
        done(null, user || null);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
