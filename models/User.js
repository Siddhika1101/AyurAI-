const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    age: {
        type: Number,
        min: 1,
        max: 120
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    dosha: {
        type: String,
        enum: ['vata', 'pitta', 'kapha', 'vata-pitta', 'vata-kapha', 'pitta-kapha', 'tridosha'],
        default: null,
        required: false
    },
    healthGoals: [{
        type: String
    }],
    medicalHistory: [{
        condition: String,
        severity: String,
        notes: String
    }],
    preferences: {
        dietaryRestrictions: [String],
        allergies: [String],
        lifestyle: {
            activityLevel: String,
            sleepPattern: String,
            stressLevel: String
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without password)
userSchema.methods.toPublicJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema); 