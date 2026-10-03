const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  matchScore: { type: Number, required: true },
  breakdown: {
    skillsScore: { type: Number },
    careerScore: { type: Number },
    interestsScore: { type: Number },
    educationScore: { type: Number },
    experienceScore: { type: Number },
    preferencesScore: { type: Number }
  },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  reasons: [{ type: String }],
  eligibility: {
    eligible: { type: Boolean },
    failedCriteria: [{ type: String }]
  },
  generatedAt: { type: Date, default: Date.now }
});

// Prevent duplicate student+opportunity pairs
recommendationSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });
// Fast lookup for a student's ranked recommendations
recommendationSchema.index({ studentId: 1, matchScore: -1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
