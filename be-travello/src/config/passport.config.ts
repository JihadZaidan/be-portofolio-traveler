import passport, { AuthenticateCallback } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import jwt from 'jsonwebtoken';
import { User, findByGoogleId, findByGitHubId, findByEmail } from '../models/User.model.js';

interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified?: boolean }>;
  photos: Array<{ value: string }>;
  name?: {
    givenName: string;
    familyName: string;
  };
}

interface GitHubProfile {
  id: string;
  displayName: string;
  username: string;
  emails: Array<{ value: string; verified?: boolean }>;
  photos: Array<{ value: string }>;
  profileUrl: string;
  _json: {
    bio?: string;
    location?: string;
    company?: string;
    blog?: string;
    public_repos?: number;
    followers?: number;
    following?: number;
  };
}

interface JWTPayload {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

interface AuthenticatedUser extends User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

// Serialize user for session
passport.serializeUser((user: any, done: (err: any, id?: string) => void) => {
  try {
    done(null, user.id);
  } catch (error) {
    done(error, undefined);
  }
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done: (err: any, user?: AuthenticatedUser | false) => void) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return done(null, false);
    }
    done(null, user as AuthenticatedUser);
  } catch (error) {
    done(error, false);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['profile', 'email'],
      passReqToCallback: true
    },
    async (req: any, accessToken: string, refreshToken: string, params: any, profile: any, done: (err: any, user?: AuthenticatedUser) => void) => {
      try {
        console.log('Google OAuth Profile:', profile);
        
        // Check if user already exists
        let user = await findByGoogleId(profile.id);

        if (user) {
          // User exists, update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Check if user exists with same email
        if (profile.emails && profile.emails[0]) {
          user = await findByEmail(profile.emails[0].value);

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        const createData: any = {
          googleId: profile.id,
          username: profile.emails?.[0]?.value?.split('@')[0] || 'user',
          email: profile.emails?.[0]?.value || '',
          role: 'user' as const,
          isEmailVerified: true,
          lastLogin: new Date()
        };

        if (profile.displayName) {
          createData.displayName = profile.displayName;
        }

        if (profile.photos?.[0]?.value) {
          createData.profilePicture = profile.photos[0].value;
        }

        const newUser = await User.create(createData);
        console.log('New user created:', newUser.toJSON());
        return done(null, newUser);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
      passReqToCallback: true
    },
    async (req: any, accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: AuthenticatedUser) => void) => {
      try {
        console.log('GitHub OAuth Profile:', profile);
        
        // Check if user already exists
        let user = await findByGitHubId(profile.id);

        if (user) {
          // User exists, update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Check if user exists with same email
        if (profile.emails && profile.emails[0]) {
          user = await findByEmail(profile.emails[0].value);

          if (user) {
            // Link GitHub account to existing user
            user.githubId = profile.id;
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        const createData: any = {
          githubId: profile.id,
          username: profile.username || profile.emails?.[0]?.value?.split('@')[0] || 'user',
          email: profile.emails?.[0]?.value || '',
          role: 'user' as const,
          isEmailVerified: true,
          lastLogin: new Date()
        };

        if (profile.displayName) {
          createData.displayName = profile.displayName;
        }

        if (profile.photos?.[0]?.value) {
          createData.profilePicture = profile.photos[0].value;
        }

        const newUser = await User.create(createData);
        console.log('New GitHub user created:', newUser.toJSON());
        return done(null, newUser);
      } catch (error) {
        console.error('GitHub OAuth Error:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

// Generate JWT Token
export const generateToken = (user: AuthenticatedUser): string => {
  const payload: JWTPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(
    payload,
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// Verify JWT Token
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

export default passport;
