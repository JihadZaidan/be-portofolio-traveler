const mongoose = require('mongoose');

const productDetailSchema = new mongoose.Schema({
    fullText: {
        type: String,
        required: false,
        trim: true
    }
});

const productAdvantageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false,
        trim: true
    },
    subtitle: {
        type: String,
        required: false,
        trim: true
    }
});

const productPackageSchema = new mongoose.Schema({
    packageKey: {
        type: String,
        required: false,
        enum: ['basic', 'standard', 'premium']
    },
    badge: {
        type: String,
        required: false,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    features: [{
        type: String,
        trim: true
    }],
    defaultWords: {
        type: Number,
        required: false,
        min: 0
    },
    basePrice: {
        type: Number,
        required: false,
        min: 0
    }
});

const shopItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    imageSrc: {
        type: String,
        required: true,
        default: '/placeholder-image.png'
    },
    price: {
        type: String,
        required: true,
        trim: true
    },
    deliveryTime: {
        type: String,
        trim: true
    },
    serviceCategory: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    details: [productDetailSchema],
    advantages: [productAdvantageSchema],
    packages: [productPackageSchema]
}, {
    timestamps: true
});

// Index for better search performance
shopItemSchema.index({ title: 'text', serviceCategory: 'text' });
shopItemSchema.index({ status: 1 });
shopItemSchema.index({ serviceCategory: 1 });

module.exports = mongoose.model('ShopItem', shopItemSchema);
