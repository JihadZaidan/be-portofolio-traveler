const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['website', 'mobile', 'design', 'marketing', 'content', 'other']
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
        default: '/images/default-portfolio.jpg'
    },
    client: {
        type: String,
        required: true
    },
    projectDate: {
        type: Date,
        required: true
    },
    technologies: [{
        type: String,
        trim: true
    }],
    projectUrl: {
        type: String,
        default: ''
    },
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
    tags: [{
        type: String,
        trim: true
    }],
    author: {
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
portfolioSchema.index({ title: 'text', description: 'text', client: 'text' });
portfolioSchema.index({ category: 1 });
portfolioSchema.index({ isActive: 1, featured: 1 });
portfolioSchema.index({ createdAt: -1 });

// Method to get featured portfolios
portfolioSchema.statics.getFeatured = function(limit = 6) {
    return this.find({ isActive: true, featured: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Method to get recent portfolios
portfolioSchema.statics.getRecent = function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Method to get portfolios by category
portfolioSchema.statics.getByCategory = function(category, limit = 10) {
    return this.find({ isActive: true, category })
        .sort({ featured: -1, createdAt: -1 })
        .limit(limit);
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
