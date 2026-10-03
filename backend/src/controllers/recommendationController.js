const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const { generateRecommendations, calculateMatch } = require('../services/recommendationEngine');
const { generateGroqResponse } = require('../services/aiService');

exports.getRecommendations = async (req, res) => {
  try {
    const { type, page = 1, limit = 10, sort = 'matchScore' } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const pipeline = [
      { $match: { studentId: req.user._id } },
      {
        $lookup: {
          from: 'opportunities',
          localField: 'opportunityId',
          foreignField: '_id',
          as: 'opportunity'
        }
      },
      { $unwind: '$opportunity' },
      // Only show active, non-expired opportunities
      { $match: { 'opportunity.status': 'ACTIVE' } }
    ];

    if (type) {
      pipeline.push({ $match: { 'opportunity.type': type.toUpperCase() } });
    }

    // Count total before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Recommendation.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push({ $sort: { matchScore: -1 } });
    pipeline.push({ $skip: (pageNum - 1) * limitNum });
    pipeline.push({ $limit: limitNum });

    const recommendations = await Recommendation.aggregate(pipeline);

    res.json({
      success: true,
      data: recommendations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecommendationById = async (req, res) => {
  try {
    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      studentId: req.user._id
    }).populate('opportunityId');

    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }
    res.json({ success: true, data: recommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.refreshRecommendations = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    await generateRecommendations(student);
    const count = await Recommendation.countDocuments({ studentId: req.user._id });
    res.json({
      success: true,
      message: `Recommendations refreshed. ${count} opportunities matched.`,
      count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Evaluate endpoint: computes rule-based score + ML prediction + Groq AI explanation.
 * Protected — requires authentication.
 */
exports.evaluateRecommendation = async (req, res) => {
  try {
    const { student, opportunity } = req.body;
    if (!student || !opportunity) {
      return res.status(400).json({ success: false, message: 'student and opportunity objects are required' });
    }

    // 1. Rule-based Engine
    const ruleMatch = calculateMatch(student, opportunity);
    const matchScore = ruleMatch.matchScore;

    // 2. Python ML Server Integration (optional — graceful fallback)
    let mlPrediction = null;
    let mlLabel = 'ML Unavailable';
    try {
      const mlPayload = {
        student: {
          student_skills: student.skills ? student.skills.map(s => s.name || s.skill).join(';') : '',
          student_interests: student.interests ? student.interests.join(';') : '',
          career_goal: (student.careerGoals && student.careerGoals.length) ? student.careerGoals[0] : 'Unknown',
          eligibility: student.education ? student.education.degree : 'Open',
          location_preference: (student.preferences && student.preferences.remote) ? 'Remote' : 'Office',
          experience: student.experience ? String(student.experience.length) : '0'
        },
        opportunity: {
          id: opportunity._id || 'opp1',
          requiredSkills: opportunity.skills ? opportunity.skills.map(s => s.skill) : [],
          interests: opportunity.tags || [],
          careerField: (opportunity.careerDomains && opportunity.careerDomains.length) ? opportunity.careerDomains[0] : 'Unknown',
          category: opportunity.type || 'INTERNSHIP',
          location: opportunity.remote ? 'Remote' : (opportunity.location || 'Unknown'),
          experienceRequired: '0',
          eligibility: opportunity.eligibility && opportunity.eligibility.degrees ? opportunity.eligibility.degrees[0] : 'Open'
        }
      };

      const mlResponse = await fetch(`${process.env.ML_API_URL || 'http://127.0.0.1:5001'}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlPayload),
        signal: AbortSignal.timeout(3000) // 3s timeout
      });

      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        mlPrediction = mlData.prediction;
        mlLabel = mlData.recommendation;
      }
    } catch (mlErr) {
      console.warn('ML Server unavailable:', mlErr.message);
    }

    // 3. Groq AI Explanation
    let explanation = null;
    try {
      const systemPrompt = `You are an expert Career Coach Assistant for the Student Opportunity Engine.
You are evaluating a match between a student and an opportunity.
Rule-Based Score: ${matchScore}%
${mlPrediction !== null ? `ML Prediction: ${mlLabel}` : ''}
Analyze why this is a good or bad fit. Keep it under 3 sentences and be highly personalized. Do not mention rule-based scores or ML directly.`;

      const userMessage = `Student Skills: ${student.skills ? student.skills.map(s => `${s.name}(${s.level}%)`).join(', ') : 'None'}
Opportunity requires: ${opportunity.skills ? opportunity.skills.map(s => s.skill).join(', ') : 'No specific skills'}`;

      explanation = await generateGroqResponse(systemPrompt, userMessage);
    } catch (groqErr) {
      console.warn('Groq AI unavailable:', groqErr.message);
      explanation = null;
    }

    res.json({
      success: true,
      data: {
        matchScore,
        breakdown: ruleMatch.breakdown,
        mlPrediction,
        mlLabel,
        explanation,
        reasons: ruleMatch.reasons,
        matchedSkills: ruleMatch.matchedSkills,
        missingSkills: ruleMatch.missingSkills,
        eligibility: ruleMatch.eligibility
      }
    });

  } catch (error) {
    console.error('Evaluate Recommendation Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
