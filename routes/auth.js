const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const Activity = require('../models/Activity');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

// Register user
router.post('/register', [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, age, gender } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            age,
            gender
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Log activity
        await Activity.create({
            userId: user._id,
            type: 'login',
            title: 'Account Created',
            description: 'New account registered successfully'
        });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login user
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Log activity
        await Activity.create({
            userId: user._id,
            type: 'login',
            title: 'User Login',
            description: 'User logged in successfully'
        });

        res.json({
            message: 'Login successful',
            token,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        res.json({
            user: req.user.toPublicJSON()
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update user profile
router.put('/profile', auth, [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('dosha').optional().isIn(['vata', 'pitta', 'kapha', 'vata-pitta', 'vata-kapha', 'pitta-kapha', 'tridosha']).withMessage('Invalid dosha type'),
    body('healthGoals').optional().isArray().withMessage('Health goals must be an array'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const updateFields = req.body;
        delete updateFields.email; // Prevent email update through this route
        delete updateFields.password; // Prevent password update through this route

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');

        // Log activity
        await Activity.create({
            userId: user._id,
            type: 'profile_update',
            title: 'Profile Updated',
            description: 'User profile information updated'
        });

        res.json({
            message: 'Profile updated successfully',
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Profile update failed' });
    }
});

// Change password
router.put('/change-password', auth, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Update password
        req.user.password = newPassword;
        await req.user.save();

        // Log activity
        await Activity.create({
            userId: req.user._id,
            type: 'profile_update',
            title: 'Password Changed',
            description: 'User password changed successfully'
        });

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Password change failed' });
    }
});

module.exports = router; 