const mongoose = require('mongoose');

const certServiceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
        default: '/images/default-cert.jpg'
    },
    category: {
        type: String,
        required: true,
        enum: ['training', 'certification', 'consulting', 'workshop', 'other']
    },
    provider: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'IDR'
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'all'],
        default: 'all'
    },
    certificateProvided: {
        type: Boolean,
        default: true
    },
    onlineAvailable: {
        type: Boolean,
        default: true
    },
    location: {
        type: String,
        default: ''
    },
    schedule: {
        type: String,
        default: ''
    },
    requirements: [{
        type: String,
        trim: true
    }],
    outcomes: [{
        type: String,
        trim: true
    }],
    featured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    enrollments: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    instructor: {
        type: String,
        required: true,
        default: 'TRAVELLO Team'
    },
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

// Index for better search performance
certServiceSchema.index({ title: 'text', description: 'text', provider: 'text' });
certServiceSchema.index({ category: 1 });
certServiceSchema.index({ isActive: 1, featured: 1 });
certServiceSchema.index({ createdAt: -1 });
certServiceSchema.index({ price: 1 });

// Method to get featured services
certServiceSchema.statics.getFeatured = function(limit = 6) {
    return this.find({ isActive: true, featured: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Method to get services by category
certServiceSchema.statics.getByCategory = function(category, limit = 10) {
    return this.find({ isActive: true, category })
        .sort({ featured: -1, rating: -1, createdAt: -1 })
        .limit(limit);
};

// Method to get services by level
certServiceSchema.statics.getByLevel = function(level, limit = 10) {
    return this.find({ isActive: true, level })
        .sort({ featured: -1, rating: -1, createdAt: -1 })
        .limit(limit);
};

module.exports = mongoose.model('CertService', certServiceSchema);
