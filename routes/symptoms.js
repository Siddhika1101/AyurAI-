const express = require('express');
const { body, validationResult } = require('express-validator');
const SymptomAnalysis = require('../models/SymptomAnalysis');
const Activity = require('../models/Activity');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Ayurvedic knowledge base for symptom analysis
const ayurvedicKnowledge = {
    doshaSymptoms: {
        vata: {
            symptoms: ['anxiety', 'insomnia', 'dry skin', 'constipation', 'irregular appetite', 'fatigue', 'joint pain'],
            herbs: [
                {
                    name: 'Ashwagandha',
                    description: 'Adaptogenic herb that helps reduce stress and anxiety',
                    dosage: '500-1000mg twice daily',
                    benefits: ['Reduces stress', 'Improves sleep', 'Boosts energy'],
                    precautions: ['Avoid during pregnancy', 'May interact with sedatives']
                },
                {
                    name: 'Sesame Oil',
                    description: 'Nourishing oil for Vata dosha',
                    dosage: 'Apply externally or 1-2 tsp internally',
                    benefits: ['Nourishes tissues', 'Calms nervous system', 'Improves skin'],
                    precautions: ['Use in moderation', 'Avoid if allergic to sesame']
                }
            ],
            lifestyle: {
                diet: ['Warm, cooked foods', 'Sweet, sour, and salty tastes', 'Regular meal times'],
                exercise: ['Gentle yoga', 'Walking', 'Tai Chi'],
                sleep: ['Early bedtime', 'Warm milk before sleep', 'Consistent sleep schedule'],
                stressManagement: ['Meditation', 'Abhyanga (self-massage)', 'Deep breathing']
            }
        },
        pitta: {
            symptoms: ['irritability', 'heartburn', 'skin rashes', 'excessive thirst', 'hot flashes', 'inflammation'],
            herbs: [
                {
                    name: 'Neem',
                    description: 'Cooling herb that purifies blood and skin',
                    dosage: '250-500mg twice daily',
                    benefits: ['Purifies blood', 'Improves skin', 'Reduces inflammation'],
                    precautions: ['Avoid during pregnancy', 'May cause stomach upset']
                },
                {
                    name: 'Aloe Vera',
                    description: 'Cooling and healing herb',
                    dosage: '1-2 tbsp juice daily',
                    benefits: ['Cools Pitta', 'Heals digestive issues', 'Improves skin'],
                    precautions: ['Start with small amounts', 'Avoid if pregnant']
                }
            ],
            lifestyle: {
                diet: ['Cooling foods', 'Sweet, bitter, and astringent tastes', 'Avoid spicy foods'],
                exercise: ['Swimming', 'Moon salutations', 'Cooling yoga'],
                sleep: ['Cool environment', 'Avoid late night work', 'Relaxing bedtime routine'],
                stressManagement: ['Cooling meditation', 'Moon gazing', 'Gentle activities']
            }
        },
        kapha: {
            symptoms: ['weight gain', 'lethargy', 'congestion', 'slow digestion', 'excess sleep', 'water retention'],
            herbs: [
                {
                    name: 'Ginger',
                    description: 'Stimulating herb that improves digestion and metabolism',
                    dosage: '500-1000mg twice daily',
                    benefits: ['Improves digestion', 'Boosts metabolism', 'Reduces congestion'],
                    precautions: ['Avoid on empty stomach', 'May cause heartburn']
                },
                {
                    name: 'Trikatu',
                    description: 'Combination of ginger, black pepper, and long pepper',
                    dosage: '250-500mg twice daily',
                    benefits: ['Stimulates digestion', 'Reduces Kapha', 'Improves energy'],
                    precautions: ['Start with small dose', 'Avoid if Pitta is high']
                }
            ],
            lifestyle: {
                diet: ['Light, dry foods', 'Pungent, bitter, and astringent tastes', 'Avoid heavy foods'],
                exercise: ['Vigorous exercise', 'Sun salutations', 'Cardio workouts'],
                sleep: ['Early rising', 'Avoid daytime sleep', 'Light dinner'],
                stressManagement: ['Active meditation', 'Dancing', 'Energizing activities']
            }
        }
    }
};

// Analyze symptoms and determine dosha imbalance
const analyzeSymptoms = (symptoms) => {
    const doshaScores = { vata: 0, pitta: 0, kapha: 0 };
    
    symptoms.forEach(symptom => {
        Object.keys(ayurvedicKnowledge.doshaSymptoms).forEach(dosha => {
            if (ayurvedicKnowledge.doshaSymptoms[dosha].symptoms.includes(symptom.name.toLowerCase())) {
                const severity = symptom.severity === 'severe' ? 3 : symptom.severity === 'moderate' ? 2 : 1;
                doshaScores[dosha] += severity;
            }
        });
    });

    // Determine primary and secondary dosha
    const sortedDoshas = Object.entries(doshaScores).sort(([,a], [,b]) => b - a);
    const primaryDosha = sortedDoshas[0][0];
    const secondaryDosha = sortedDoshas[1][0];
    
    const imbalance = `${primaryDosha} imbalance`;
    const severity = doshaScores[primaryDosha] >= 6 ? 'severe' : doshaScores[primaryDosha] >= 3 ? 'moderate' : 'mild';

    return {
        primaryDosha,
        secondaryDosha,
        imbalance,
        severity,
        scores: doshaScores
    };
};

// Generate recommendations based on dosha analysis
const generateRecommendations = (analysis) => {
    const doshaData = ayurvedicKnowledge.doshaSymptoms[analysis.primaryDosha];
    
    return {
        herbs: doshaData.herbs,
        lifestyle: doshaData.lifestyle,
        yoga: [
            {
                pose: analysis.primaryDosha === 'vata' ? 'Balasana (Child\'s Pose)' : 
                      analysis.primaryDosha === 'pitta' ? 'Shitali Pranayama' : 'Surya Namaskar',
                description: 'Balancing pose for your dosha type',
                duration: '5-10 minutes',
                benefits: ['Balances dosha', 'Reduces stress', 'Improves energy']
            }
        ],
        meditation: [
            {
                technique: analysis.primaryDosha === 'vata' ? 'Mindfulness Meditation' :
                          analysis.primaryDosha === 'pitta' ? 'Cooling Meditation' : 'Dynamic Meditation',
                description: 'Meditation technique suitable for your dosha',
                duration: '15-20 minutes',
                frequency: 'Daily'
            }
        ]
    };
};

// Analyze symptoms and get recommendations
router.post('/analyze', [
    body('symptoms').isArray({ min: 1 }).withMessage('At least one symptom is required'),
    body('symptoms.*.name').notEmpty().withMessage('Symptom name is required'),
    body('symptoms.*.severity').isIn(['mild', 'moderate', 'severe']).withMessage('Invalid severity level'),
    body('symptoms.*.duration').optional().isString().withMessage('Duration must be a string'),
    body('symptoms.*.frequency').optional().isString().withMessage('Frequency must be a string')
], optionalAuth, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { symptoms } = req.body;

        // Analyze symptoms
        const analysis = analyzeSymptoms(symptoms);
        
        // Generate recommendations
        const recommendations = generateRecommendations(analysis);

        // Create symptom analysis record if user is authenticated
        let symptomAnalysis = null;
        if (req.user) {
            symptomAnalysis = new SymptomAnalysis({
                userId: req.user._id,
                symptoms,
                analysis,
                recommendations,
                followUp: {
                    recommendedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                    notes: 'Follow up recommended to assess progress'
                }
            });

            await symptomAnalysis.save();

            // Log activity
            await Activity.create({
                userId: req.user._id,
                type: 'symptom_analysis',
                title: 'Symptom Analysis Completed',
                description: `Analyzed ${symptoms.length} symptoms - ${analysis.imbalance} detected`,
                metadata: { analysisId: symptomAnalysis._id }
            });
        }

        res.json({
            analysis,
            recommendations,
            analysisId: symptomAnalysis?._id,
            message: 'Symptom analysis completed successfully'
        });

    } catch (error) {
        console.error('Symptom analysis error:', error);
        res.status(500).json({ error: 'Symptom analysis failed' });
    }
});

// Get user's symptom analysis history
router.get('/history', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const analyses = await SymptomAnalysis.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email');

        const total = await SymptomAnalysis.countDocuments({ userId: req.user._id });

        res.json({
            analyses,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch analysis history' });
    }
});

// Get specific analysis by ID
router.get('/analysis/:id', auth, async (req, res) => {
    try {
        const analysis = await SymptomAnalysis.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('userId', 'name email');

        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }

        res.json({ analysis });

    } catch (error) {
        console.error('Analysis fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch analysis' });
    }
});

// Update analysis status
router.put('/analysis/:id/status', auth, [
    body('status').isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const analysis = await SymptomAnalysis.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { status: req.body.status },
            { new: true }
        );

        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }

        res.json({
            message: 'Analysis status updated successfully',
            analysis
        });

    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Provide feedback on recommendations
router.post('/analysis/:id/feedback', auth, [
    body('effectiveness').isInt({ min: 1, max: 5 }).withMessage('Effectiveness must be between 1 and 5'),
    body('comments').optional().isString().withMessage('Comments must be a string')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { effectiveness, comments } = req.body;

        const analysis = await SymptomAnalysis.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            {
                'userFeedback.effectiveness': effectiveness,
                'userFeedback.comments': comments,
                'userFeedback.date': new Date()
            },
            { new: true }
        );

        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }

        // Log activity
        await Activity.create({
            userId: req.user._id,
            type: 'feedback',
            title: 'Recommendation Feedback',
            description: `Provided feedback on analysis (Rating: ${effectiveness}/5)`,
            metadata: { analysisId: analysis._id, rating: effectiveness }
        });

        res.json({
            message: 'Feedback submitted successfully',
            analysis
        });

    } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

module.exports = router; 