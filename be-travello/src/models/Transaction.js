const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // Transaction information
    transactionId: {
        type: String,
        required: true,
        unique: true,
        default: function() {
            return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Transaction details
    type: {
        type: String,
        required: true,
        enum: ['copywriter_service', 'travel_package', 'consultation', 'other']
    },
    serviceName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    
    // Financial information
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'IDR'
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    finalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    
    // Payment information
    paymentMethod: {
        type: String,
        required: true,
        enum: ['transfer', 'ewallet', 'credit_card', 'paypal', 'other']
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    },
    paymentProof: {
        type: String, // URL to payment proof image
    },
    
    // Service details (flexible for different service types)
    serviceDetails: {
        // For copywriter services
        copywriterPackage: {
            type: String,
            enum: ['basic', 'standard', 'premium']
        },
        wordCount: Number,
        topic: String,
        deadline: Date,
        
        // For travel packages
        travelPackage: {
            destination: String,
            duration: Number, // in days
            departureDate: Date,
            returnDate: Date,
            participants: Number
        },
        
        // For consultation
        consultationType: {
            type: String,
            enum: ['travel_planning', 'copywriter_consultation', 'general']
        },
        consultationDate: Date,
        duration: Number, // in hours
        
        // Custom fields for other services
        customFields: mongoose.Schema.Types.Mixed
    },
    
    // Status tracking
    status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    confirmedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    
    // Notes and communication
    notes: {
        type: String,
        trim: true
    },
    adminNotes: {
        type: String,
        trim: true
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
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ userId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ paymentStatus: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ paymentDate: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: this.currency
    }).format(this.amount);
});

// Method to calculate final amount
transactionSchema.methods.calculateFinalAmount = function() {
    this.finalAmount = this.amount - this.discount + this.tax;
    return this.finalAmount;
};

// Method to update payment status
transactionSchema.methods.updatePaymentStatus = function(status, paymentDate = null) {
    this.paymentStatus = status;
    if (status === 'paid' && paymentDate) {
        this.paymentDate = paymentDate;
    } else if (status === 'paid') {
        this.paymentDate = new Date();
    }
    
    // Auto-confirm transaction when payment is complete
    if (status === 'paid' && this.status === 'pending') {
        this.status = 'confirmed';
        this.confirmedAt = new Date();
    }
    
    return this.save();
};

// Method to update transaction status
transactionSchema.methods.updateStatus = function(status) {
    const now = new Date();
    this.status = status;
    
    switch(status) {
        case 'confirmed':
            this.confirmedAt = now;
            break;
        case 'in_progress':
            this.startedAt = now;
            break;
        case 'completed':
            this.completedAt = now;
            break;
        case 'cancelled':
            this.cancelledAt = now;
            break;
    }
    
    return this.save();
};

// Static method to get user transactions
transactionSchema.statics.getUserTransactions = function(userId, options = {}) {
    const { limit = 10, page = 1, status, type } = options;
    
    const query = { userId };
    if (status) query.status = status;
    if (type) query.type = type;
    
    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate('userId', 'name email avatar');
};

// Static method to get transaction statistics
transactionSchema.statics.getTransactionStats = function(dateRange = null) {
    const matchStage = {};
    if (dateRange) {
        matchStage.createdAt = {
            $gte: dateRange.start,
            $lte: dateRange.end
        };
    }
    
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalRevenue: { $sum: '$finalAmount' },
                paidTransactions: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
                pendingTransactions: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] } },
                completedTransactions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                avgTransactionValue: { $avg: '$finalAmount' }
            }
        }
    ]);
};

// Static method to get revenue by month
transactionSchema.statics.getRevenueByMonth = function(year = new Date().getFullYear()) {
    return this.aggregate([
        {
            $match: {
                paymentStatus: 'paid',
                createdAt: {
                    $gte: new Date(year, 0, 1),
                    $lte: new Date(year, 11, 31)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                revenue: { $sum: '$finalAmount' },
                transactions: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);
};

// Pre-save middleware to calculate final amount
transactionSchema.pre('save', function(next) {
    if (this.isModified('amount') || this.isModified('discount') || this.isModified('tax')) {
        this.calculateFinalAmount();
    }
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
