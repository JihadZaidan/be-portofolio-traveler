const mongoose = require('mongoose');

const travelJournalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    cover: {
        type: String,
        required: true,
        default: '/images/default-cover.jpg'
    },
    travelImage: {
        type: String,
        required: true,
        default: '/images/default-travel.jpg'
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        enum: ['adventure', 'beach', 'mountain', 'city', 'cultural', 'food'],
        default: 'adventure'
    },
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
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
travelJournalSchema.index({ name: 'text', description: 'text', location: 'text' });
travelJournalSchema.index({ category: 1 });
travelJournalSchema.index({ isActive: 1, featured: 1 });
travelJournalSchema.index({ createdAt: -1 });

// Method to get featured journals
travelJournalSchema.statics.getFeatured = function(limit = 6) {
    return this.find({ isActive: true, featured: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Method to get recent journals
travelJournalSchema.statics.getRecent = function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Method to search journals
travelJournalSchema.statics.searchJournals = function(query, limit = 10) {
    return this.find({
        isActive: true,
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ]
    })
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('TravelJournal', travelJournalSchema);
