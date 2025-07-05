const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['login', 'symptom_analysis', 'recommendation_view', 'profile_update', 'dosha_test', 'feedback'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    metadata: {
        // Flexible object to store additional data
        type: mongoose.Schema.Types.Mixed
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'error'],
        default: 'info'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1 });
activitySchema.index({ isRead: 1 });

module.exports = mongoose.model('Activity', activitySchema); 