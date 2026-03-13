const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
        default: '/images/default-experience.jpg'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        default: null
    },
    currentJob: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['full-time', 'part-time', 'freelance', 'internship', 'remote'],
        default: 'full-time'
    },
    department: {
        type: String,
        default: ''
    },
    achievements: [{
        type: String,
        trim: true
    }],
    technologies: [{
        type: String,
        trim: true
    }],
    responsibilities: [{
        type: String,
        trim: true
    }],
    skills: [{
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
    order: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
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
experienceSchema.index({ title: 'text', description: 'text', company: 'text' });
experienceSchema.index({ isActive: 1, featured: 1 });
experienceSchema.index({ startDate: -1 });
experienceSchema.index({ order: 1 });

// Method to get featured experiences
experienceSchema.statics.getFeatured = function(limit = 6) {
    return this.find({ isActive: true, featured: true })
        .sort({ order: 1, startDate: -1 })
        .limit(limit);
};

// Method to get experiences by type
experienceSchema.statics.getByType = function(type, limit = 10) {
    return this.find({ isActive: true, type })
        .sort({ order: 1, startDate: -1 })
        .limit(limit);
};

// Method to get current experiences
experienceSchema.statics.getCurrent = function(limit = 10) {
    return this.find({ isActive: true, currentJob: true })
        .sort({ order: 1, startDate: -1 })
        .limit(limit);
};

module.exports = mongoose.model('Experience', experienceSchema);
