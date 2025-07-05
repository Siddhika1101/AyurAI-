const express = require('express');
const User = require('../models/User');
const SymptomAnalysis = require('../models/SymptomAnalysis');
const Activity = require('../models/Activity');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user statistics (admin only)
router.get('/stats', auth, async (req, res) => {
    try {
        // Check if user is admin (you can implement admin role logic)
        // For now, we'll allow any authenticated user to access stats
        
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalAnalyses = await SymptomAnalysis.countDocuments();
        const completedAnalyses = await SymptomAnalysis.countDocuments({ status: 'completed' });

        // Get user growth (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        // Get most common dosha types
        const doshaDistribution = await SymptomAnalysis.aggregate([
            { $group: {
                _id: '$analysis.primaryDosha',
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } }
        ]);

        res.json({
            totalUsers,
            activeUsers,
            totalAnalyses,
            completedAnalyses,
            newUsers,
            doshaDistribution
        });

    } catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get user's complete data export
router.get('/export', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user profile
        const user = await User.findById(userId).select('-password');
        
        // Get all analyses
        const analyses = await SymptomAnalysis.find({ userId });
        
        // Get all activities
        const activities = await Activity.find({ userId });

        const exportData = {
            user: user.toObject(),
            analyses: analyses.map(analysis => analysis.toObject()),
            activities: activities.map(activity => activity.toObject()),
            exportDate: new Date().toISOString()
        };

        res.json(exportData);

    } catch (error) {
        console.error('Data export error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Delete all user data
        await Promise.all([
            SymptomAnalysis.deleteMany({ userId }),
            Activity.deleteMany({ userId }),
            User.findByIdAndDelete(userId)
        ]);

        res.json({ message: 'Account deleted successfully' });

    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// Get user's dosha test history
router.get('/dosha-history', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        const doshaHistory = await SymptomAnalysis.aggregate([
            { $match: { userId: userId } },
            { $sort: { createdAt: 1 } },
            { $project: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                primaryDosha: '$analysis.primaryDosha',
                secondaryDosha: '$analysis.secondaryDosha',
                severity: '$analysis.severity',
                imbalance: '$analysis.imbalance'
            }}
        ]);

        res.json({ doshaHistory });

    } catch (error) {
        console.error('Dosha history error:', error);
        res.status(500).json({ error: 'Failed to fetch dosha history' });
    }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
    try {
        const { preferences } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { preferences },
            { new: true, runValidators: true }
        ).select('-password');

        // Log activity
        await Activity.create({
            userId: req.user._id,
            type: 'profile_update',
            title: 'Preferences Updated',
            description: 'User preferences updated'
        });

        res.json({
            message: 'Preferences updated successfully',
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Preferences update error:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// Get user's health timeline
router.get('/timeline', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Get combined timeline of analyses and activities
        const timeline = await Promise.all([
            SymptomAnalysis.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Activity.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);

        // Combine and sort by date
        const combinedTimeline = [...timeline[0], ...timeline[1]]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);

        res.json({ timeline: combinedTimeline });

    } catch (error) {
        console.error('Timeline fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch timeline' });
    }
});

// Get user's health summary
router.get('/health-summary', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get current dosha
        const currentDosha = req.user.dosha;

        // Get recent analyses
        const recentAnalyses = await SymptomAnalysis.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5);

        // Calculate health trends
        const healthTrends = {
            totalAnalyses: recentAnalyses.length,
            averageSeverity: 0,
            mostCommonDosha: null,
            improvementRate: 0
        };

        if (recentAnalyses.length > 0) {
            // Calculate average severity
            const severityScores = recentAnalyses.map(analysis => 
                analysis.analysis.severity === 'severe' ? 3 : 
                analysis.analysis.severity === 'moderate' ? 2 : 1
            );
            healthTrends.averageSeverity = severityScores.reduce((a, b) => a + b, 0) / severityScores.length;

            // Get most common dosha
            const doshaCounts = {};
            recentAnalyses.forEach(analysis => {
                const dosha = analysis.analysis.primaryDosha;
                doshaCounts[dosha] = (doshaCounts[dosha] || 0) + 1;
            });
            healthTrends.mostCommonDosha = Object.keys(doshaCounts).reduce((a, b) => 
                doshaCounts[a] > doshaCounts[b] ? a : b
            );

            // Calculate improvement rate (if user provided feedback)
            const analysesWithFeedback = recentAnalyses.filter(analysis => 
                analysis.userFeedback && analysis.userFeedback.effectiveness
            );
            if (analysesWithFeedback.length > 0) {
                const avgEffectiveness = analysesWithFeedback.reduce((sum, analysis) => 
                    sum + analysis.userFeedback.effectiveness, 0) / analysesWithFeedback.length;
                healthTrends.improvementRate = Math.round((avgEffectiveness / 5) * 100);
            }
        }

        res.json({
            currentDosha,
            recentAnalyses,
            healthTrends
        });

    } catch (error) {
        console.error('Health summary error:', error);
        res.status(500).json({ error: 'Failed to fetch health summary' });
    }
});

module.exports = router; 