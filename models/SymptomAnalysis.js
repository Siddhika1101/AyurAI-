const mongoose = require('mongoose');

const symptomAnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symptoms: [{
        name: String,
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe']
        },
        duration: String,
        frequency: String
    }],
    analysis: {
        primaryDosha: {
            type: String,
            enum: ['vata', 'pitta', 'kapha']
        },
        secondaryDosha: {
            type: String,
            enum: ['vata', 'pitta', 'kapha']
        },
        imbalance: String,
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe']
        }
    },
    recommendations: {
        herbs: [{
            name: String,
            description: String,
            dosage: String,
            benefits: [String],
            precautions: [String]
        }],
        lifestyle: {
            diet: [String],
            exercise: [String],
            sleep: [String],
            stressManagement: [String]
        },
        yoga: [{
            pose: String,
            description: String,
            duration: String,
            benefits: [String]
        }],
        meditation: [{
            technique: String,
            description: String,
            duration: String,
            frequency: String
        }]
    },
    followUp: {
        recommendedDate: Date,
        notes: String
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    userFeedback: {
        effectiveness: {
            type: Number,
            min: 1,
            max: 5
        },
        comments: String,
        date: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
symptomAnalysisSchema.index({ userId: 1, createdAt: -1 });
symptomAnalysisSchema.index({ status: 1 });

module.exports = mongoose.model('SymptomAnalysis', symptomAnalysisSchema); 