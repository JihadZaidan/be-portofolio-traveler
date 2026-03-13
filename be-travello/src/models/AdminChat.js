const mongoose = require('mongoose');

const adminChatSchema = new mongoose.Schema({
    // Chat session information
    sessionId: {
        type: String,
        required: true,
        unique: true,
        default: function() {
            return 'CHAT' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null for guest users
    },
    
    // User information (for guest users or backup)
    userInfo: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        phone: String,
        isGuest: {
            type: Boolean,
            default: true
        }
    },
    
    // Chat status
    status: {
        type: String,
        required: true,
        enum: ['active', 'waiting', 'closed', 'archived'],
        default: 'waiting'
    },
    assignedAdmin: {
        type: String,
        default: null
    },
    
    // Messages array
    messages: [{
        // Message information
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true
        },
        sender: {
            type: String,
            required: true,
            enum: ['user', 'admin']
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        senderName: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'file', 'system'],
            default: 'text'
        },
        fileUrl: String, // For image/file messages
        
        // Message status
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: Date,
        
        // Metadata
        timestamp: {
            type: Date,
            default: Date.now
        },
        edited: {
            type: Boolean,
            default: false
        },
        editedAt: Date
    }],
    
    // Unread counts
    unreadCount: {
        user: {
            type: Number,
            default: 0
        },
        admin: {
            type: Number,
            default: 0
        }
    },
    
    // Last message info for quick access
    lastMessage: {
        message: String,
        sender: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    
    // Chat metadata
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    category: {
        type: String,
        enum: ['general', 'support', 'sales', 'complaint', 'technical'],
        default: 'general'
    },
    tags: [String],
    
    // Resolution tracking
    resolvedAt: Date,
    resolutionNotes: String,
    satisfactionRating: {
        type: Number,
        min: 1,
        max: 5
    },
    satisfactionFeedback: String,
    
    // System tracking
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better performance
adminChatSchema.index({ sessionId: 1 });
adminChatSchema.index({ userId: 1 });
adminChatSchema.index({ status: 1 });
adminChatSchema.index({ assignedAdmin: 1 });
adminChatSchema.index({ 'userInfo.email': 1 });
adminChatSchema.index({ createdAt: -1 });
adminChatSchema.index({ lastActivityAt: -1 });
adminChatSchema.index({ priority: 1, status: 1 });

// Method to add message
adminChatSchema.methods.addMessage = function(sender, message, senderName, senderId = null, messageType = 'text') {
    const newMessage = {
        sender,
        senderId,
        senderName,
        message,
        messageType,
        timestamp: new Date()
    };
    
    this.messages.push(newMessage);
    this.lastMessage = {
        message: message,
        sender: sender,
        timestamp: new Date()
    };
    this.lastActivityAt = new Date();
    
    // Update unread counts
    if (sender === 'admin') {
        this.unreadCount.user += 1;
    } else {
        this.unreadCount.admin += 1;
    }
    
    return this.save();
};

// Method to mark messages as read
adminChatSchema.methods.markAsRead = function(reader) {
    const unreadMessages = this.messages.filter(msg => 
        msg.sender !== reader && !msg.isRead
    );
    
    unreadMessages.forEach(msg => {
        msg.isRead = true;
        msg.readAt = new Date();
    });
    
    if (reader === 'admin') {
        this.unreadCount.admin = 0;
    } else {
        this.unreadCount.user = 0;
    }
    
    return this.save();
};

// Method to assign admin
adminChatSchema.methods.assignAdmin = function(adminId) {
    this.assignedAdmin = adminId;
    if (this.status === 'waiting') {
        this.status = 'active';
    }
    return this.save();
};

// Method to close chat
adminChatSchema.methods.closeChat = function(resolutionNotes = null) {
    this.status = 'closed';
    this.resolvedAt = new Date();
    if (resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
    return this.save();
};

// Method to add satisfaction rating
adminChatSchema.methods.addSatisfactionRating = function(rating, feedback = null) {
    this.satisfactionRating = rating;
    if (feedback) {
        this.satisfactionFeedback = feedback;
    }
    return this.save();
};

// Static method to get active chats for admin
adminChatSchema.statics.getActiveChats = function(adminId = null) {
    const query = { status: { $in: ['active', 'waiting'] } };
    if (adminId) {
        query.assignedAdmin = adminId;
    }
    
    return this.find(query)
        .sort({ priority: -1, lastActivityAt: -1 })
        .populate('userId', 'name email avatar');
};

// Static method to get user chats
adminChatSchema.statics.getUserChats = function(userId, limit = 10) {
    return this.find({ userId })
        .sort({ lastActivityAt: -1 })
        .limit(limit);
};

// Static method to get chat statistics
adminChatSchema.statics.getChatStats = function(dateRange = null) {
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
                totalChats: { $sum: 1 },
                activeChats: { $sum: { $cond: [{ $in: ['$status', ['active', 'waiting']] }, 1, 0] } },
                closedChats: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
                avgSatisfaction: { $avg: '$satisfactionRating' },
                totalMessages: { $sum: { $size: '$messages' } }
            }
        }
    ]);
};

// Static method to find or create chat session
adminChatSchema.statics.findOrCreateChat = function(userInfo, userId = null) {
    return this.findOne({
        $or: [
            { userId: userId },
            { 'userInfo.email': userInfo.email }
        ],
        status: { $in: ['active', 'waiting'] }
    }).populate('userId')
    .then(existingChat => {
        if (existingChat) {
            return existingChat;
        }
        
        // Create new chat session
        return this.create({
            userId: userId,
            userInfo: userInfo
        });
    });
};

// Pre-save middleware to update timestamps
adminChatSchema.pre('save', function(next) {
    if (this.isModified('messages') || this.isModified('status')) {
        this.lastActivityAt = new Date();
    }
    next();
});

module.exports = mongoose.model('AdminChat', adminChatSchema);
