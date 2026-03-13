const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Auth information
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password required only if not Google user
        }
    },
    profilePicture: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: '/images/default-avatar.png'
    },
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    loginPage: {
        type: String,
        default: 'default'
    },
    
    // User profile
    phone: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other'
    },
    address: {
        street: String,
        city: String,
        province: String,
        postalCode: String,
        country: {
            type: String,
            default: 'Indonesia'
        }
    },
    
    // Preferences
    travelPreferences: {
        favoriteDestinations: [String],
        travelStyle: {
            type: String,
            enum: ['budget', 'mid-range', 'luxury'],
            default: 'mid-range'
        },
        interests: [{
            type: String,
            enum: ['adventure', 'beach', 'mountain', 'city', 'cultural', 'food', 'shopping', 'nature']
        }]
    },
    
    // Account status
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    
    // Role and permissions
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    
    // Statistics
    totalTransactions: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    
    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ isActive: 1, isVerified: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'travelPreferences.favoriteDestinations': 1 });

// Method to compare password (if password login is added later)
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

// Method to get user profile without sensitive data
userSchema.methods.getPublicProfile = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

// Static method to find by email or googleId
userSchema.statics.findByEmailOrGoogleId = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier },
            { googleId: identifier }
        ]
    });
};

// Static method to get user statistics
userSchema.statics.getUserStats = function() {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
                totalSpent: { $sum: '$totalSpent' },
                avgSpent: { $avg: '$totalSpent' }
            }
        }
    ]);
};

// Pre-save middleware to hash password (if password is added)
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
