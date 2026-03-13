const mongoose = require('mongoose');

const landingPageSchema = new mongoose.Schema({
    hero: {
        title: {
            type: String,
            required: true,
            default: 'TRAVELLO - Your Travel Partner'
        },
        subtitle: {
            type: String,
            required: true,
            default: 'Discover amazing places around the world'
        },
        backgroundImage: {
            type: String,
            required: true,
            default: '/images/hero-bg.jpg'
        },
        ctaText: {
            type: String,
            required: true,
            default: 'Explore Now'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    
    destinations: [{
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 4.5
        },
        category: {
            type: String,
            enum: ['beach', 'mountain', 'city', 'cultural', 'adventure'],
            default: 'beach'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    services: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    
    testimonials: [{
        name: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 5
        },
        avatar: {
            type: String,
            default: '/images/default-avatar.jpg'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    about: {
        title: {
            type: String,
            required: true,
            default: 'About TRAVELLO'
        },
        description: {
            type: String,
            required: true,
            default: 'We are your trusted travel partner with years of experience in creating unforgettable journeys.'
        },
        image: {
            type: String,
            default: '/images/about-image.jpg'
        },
        features: [{
            title: String,
            description: String
        }],
        isActive: {
            type: Boolean,
            default: true
        }
    },
    
    contact: {
        email: {
            type: String,
            required: true,
            default: 'info@travello.com'
        },
        phone: {
            type: String,
            required: true,
            default: '+62 812-3456-7890'
        },
        address: {
            type: String,
            required: true,
            default: 'Jakarta, Indonesia'
        },
        socialMedia: {
            facebook: String,
            instagram: String,
            twitter: String,
            youtube: String
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    
    seo: {
        metaTitle: {
            type: String,
            default: 'TRAVELLO - Your Travel Partner'
        },
        metaDescription: {
            type: String,
            default: 'Discover amazing places around the world with TRAVELLO'
        },
        keywords: [String]
    },
    
    lastUpdatedBy: {
        type: String,
        required: true,
        default: 'system'
    },
    
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Method to get only active content
landingPageSchema.methods.getActiveContent = function() {
    return {
        hero: this.hero.isActive ? this.hero : null,
        destinations: this.destinations.filter(d => d.isActive),
        services: this.services.filter(s => s.isActive),
        testimonials: this.testimonials.filter(t => t.isActive),
        about: this.about.isActive ? this.about : null,
        contact: this.contact.isActive ? this.contact : null,
        seo: this.seo
    };
};

module.exports = mongoose.model('LandingPage', landingPageSchema);
