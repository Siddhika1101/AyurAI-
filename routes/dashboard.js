const express = require('express');
const SymptomAnalysis = require('../models/SymptomAnalysis');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview data
router.get('/overview', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get recent activities
        const recentActivities = await Activity.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent analyses
        const recentAnalyses = await SymptomAnalysis.find({ userId })
            .sort({ createdAt: -1 })
            .limit(3);

        // Get statistics
        const totalAnalyses = await SymptomAnalysis.countDocuments({ userId });
        const activeAnalyses = await SymptomAnalysis.countDocuments({ 
            userId, 
            status: 'active' 
        });
        const completedAnalyses = await SymptomAnalysis.countDocuments({ 
            userId, 
            status: 'completed' 
        });

        // Get dosha distribution
        const doshaStats = await SymptomAnalysis.aggregate([
            { $match: { userId: userId } },
            { $group: {
                _id: '$analysis.primaryDosha',
                count: { $sum: 1 }
            }}
        ]);

        // Get progress data (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentAnalysesCount = await SymptomAnalysis.countDocuments({
            userId,
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Calculate health score based on completed analyses and feedback
        const completedWithFeedback = await SymptomAnalysis.find({
            userId,
            status: 'completed',
            'userFeedback.effectiveness': { $exists: true }
        });

        let healthScore = 0;
        if (completedWithFeedback.length > 0) {
            const avgEffectiveness = completedWithFeedback.reduce((sum, analysis) => 
                sum + analysis.userFeedback.effectiveness, 0) / completedWithFeedback.length;
            healthScore = Math.round((avgEffectiveness / 5) * 100);
        }

        res.json({
            recentActivities,
            recentAnalyses,
            statistics: {
                totalAnalyses,
                activeAnalyses,
                completedAnalyses,
                recentAnalysesCount,
                healthScore
            },
            doshaStats,
            user: {
                name: req.user.name,
                dosha: req.user.dosha,
                lastLogin: req.user.lastLogin
            }
        });

    } catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Get detailed activity feed
router.get('/activities', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const type = req.query.type; // Optional filter by activity type

        const query = { userId: req.user._id };
        if (type) {
            query.type = type;
        }

        const activities = await Activity.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Activity.countDocuments(query);

        res.json({
            activities,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Activities fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

// Get analysis progress
router.get('/progress', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get analyses by status
        const analysesByStatus = await SymptomAnalysis.aggregate([
            { $match: { userId: userId } },
            { $group: {
                _id: '$status',
                count: { $sum: 1 }
            }}
        ]);

        // Get monthly progress (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyProgress = await SymptomAnalysis.aggregate([
            { $match: { 
                userId: userId,
                createdAt: { $gte: sixMonthsAgo }
            }},
            { $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get dosha balance over time
        const doshaProgress = await SymptomAnalysis.aggregate([
            { $match: { userId: userId } },
            { $sort: { createdAt: 1 } },
            { $project: {
                date: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                primaryDosha: '$analysis.primaryDosha',
                severity: '$analysis.severity'
            }}
        ]);

        res.json({
            analysesByStatus,
            monthlyProgress,
            doshaProgress
        });

    } catch (error) {
        console.error('Progress fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch progress data' });
    }
});

// Get recommendations summary
router.get('/recommendations', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get active analyses with recommendations
        const activeAnalyses = await SymptomAnalysis.find({
            userId,
            status: 'active'
        }).sort({ createdAt: -1 });

        // Get most recommended herbs
        const herbRecommendations = {};
        activeAnalyses.forEach(analysis => {
            analysis.recommendations.herbs.forEach(herb => {
                if (!herbRecommendations[herb.name]) {
                    herbRecommendations[herb.name] = {
                        name: herb.name,
                        count: 0,
                        description: herb.description,
                        dosage: herb.dosage
                    };
                }
                herbRecommendations[herb.name].count++;
            });
        });

        const topHerbs = Object.values(herbRecommendations)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Get lifestyle recommendations
        const lifestyleRecommendations = {
            diet: [],
            exercise: [],
            sleep: [],
            stressManagement: []
        };

        activeAnalyses.forEach(analysis => {
            Object.keys(analysis.recommendations.lifestyle).forEach(category => {
                analysis.recommendations.lifestyle[category].forEach(item => {
                    if (!lifestyleRecommendations[category].includes(item)) {
                        lifestyleRecommendations[category].push(item);
                    }
                });
            });
        });

        res.json({
            activeAnalyses: activeAnalyses.length,
            topHerbs,
            lifestyleRecommendations,
            nextFollowUp: activeAnalyses.length > 0 ? 
                activeAnalyses[0].followUp.recommendedDate : null
        });

    } catch (error) {
        console.error('Recommendations fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// Mark activity as read
router.put('/activities/:id/read', auth, async (req, res) => {
    try {
        const activity = await Activity.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json({ message: 'Activity marked as read', activity });

    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to mark activity as read' });
    }
});

// Get unread activities count
router.get('/activities/unread-count', auth, async (req, res) => {
    try {
        const count = await Activity.countDocuments({
            userId: req.user._id,
            isRead: false
        });

        res.json({ unreadCount: count });

    } catch (error) {
        console.error('Unread count error:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
});

// Get health insights
router.get('/insights', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user's most common dosha imbalance
        const doshaAnalysis = await SymptomAnalysis.aggregate([
            { $match: { userId: userId } },
            { $group: {
                _id: '$analysis.primaryDosha',
                count: { $sum: 1 },
                avgSeverity: { $avg: { 
                    $cond: [
                        { $eq: ['$analysis.severity', 'severe'] }, 3,
                        { $cond: [
                            { $eq: ['$analysis.severity', 'moderate'] }, 2, 1
                        ]}
                    ]
                }}
            }},
            { $sort: { count: -1 } }
        ]);

        // Get effectiveness trends
        const effectivenessTrends = await SymptomAnalysis.aggregate([
            { $match: { 
                userId: userId,
                'userFeedback.effectiveness': { $exists: true }
            }},
            { $sort: { 'userFeedback.date': 1 } },
            { $project: {
                date: '$userFeedback.date',
                effectiveness: '$userFeedback.effectiveness'
            }}
        ]);

        // Get seasonal patterns (if user has been using for more than 3 months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const seasonalPatterns = await SymptomAnalysis.aggregate([
            { $match: { 
                userId: userId,
                createdAt: { $gte: threeMonthsAgo }
            }},
            { $group: {
                _id: {
                    month: { $month: '$createdAt' },
                    dosha: '$analysis.primaryDosha'
                },
                count: { $sum: 1 }
            }},
            { $sort: { '_id.month': 1 } }
        ]);

        res.json({
            primaryDosha: doshaAnalysis[0]?._id || null,
            doshaAnalysis,
            effectivenessTrends,
            seasonalPatterns: seasonalPatterns.length > 0 ? seasonalPatterns : null
        });

    } catch (error) {
        console.error('Insights fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
});

module.exports = router; 