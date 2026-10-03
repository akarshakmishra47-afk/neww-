const Opportunity = require('../models/Opportunity');
const Recommendation = require('../models/Recommendation');
const { checkEligibility } = require('./eligibilityEngine');

// Weighted scoring breakdown
const WEIGHTS = {
  SKILLS: 0.35,
  CAREER: 0.20,
  INTERESTS: 0.15,
  EDUCATION: 0.15,
  EXPERIENCE: 0.10,
  PREFERENCES: 0.05
};

/**
 * Calculates a match score between a student and an opportunity.
 * Returns null if the student is ineligible (hard gate).
 */
const calculateMatch = (student, opportunity) => {
  const breakdown = {
    skillsScore: 0,
    careerScore: 0,
    interestsScore: 0,
    educationScore: 0,
    experienceScore: 0,
    preferencesScore: 0
  };
  const matchedSkills = [];
  const missingSkills = [];
  const reasons = [];

  // --- ELIGIBILITY GATE (hard filter) ---
  const eligibility = checkEligibility(student, opportunity);
  if (!eligibility.eligible) {
    // Ineligible: score zero for education component, reasons from failed criteria
    breakdown.educationScore = 0;
    reasons.push(...eligibility.failedCriteria.map(c => `❌ ${c}`));
  } else {
    breakdown.educationScore = 100;
    if (eligibility.reasons.length > 0) {
      reasons.push(...eligibility.reasons);
    } else {
      reasons.push('You meet the education and eligibility criteria');
    }
  }

  // --- 1. Skills Matching (35%) ---
  if (opportunity.skills && opportunity.skills.length > 0) {
    const required = opportunity.skills.filter(s => s.importance === 'required');
    const preferred = opportunity.skills.filter(s => s.importance === 'preferred');

    let weightedMatch = 0;
    let totalWeight = 0;

    // Required skills count more (weight 1.5 each), preferred count less (weight 0.5)
    required.forEach(reqSkill => {
      totalWeight += 1.5;
      const studentSkill = (student.skills || []).find(
        s => s.name.toLowerCase() === reqSkill.skill.toLowerCase()
      );
      if (studentSkill && studentSkill.level >= 20) {
        // Partial credit based on proficiency level (level / 100)
        weightedMatch += 1.5 * (studentSkill.level / 100);
        matchedSkills.push(reqSkill.skill);
      } else {
        missingSkills.push(reqSkill.skill);
      }
    });

    preferred.forEach(prefSkill => {
      totalWeight += 0.5;
      const studentSkill = (student.skills || []).find(
        s => s.name.toLowerCase() === prefSkill.skill.toLowerCase()
      );
      if (studentSkill && studentSkill.level >= 20) {
        weightedMatch += 0.5 * (studentSkill.level / 100);
        if (!matchedSkills.includes(prefSkill.skill)) matchedSkills.push(prefSkill.skill);
      } else {
        if (!missingSkills.includes(prefSkill.skill)) missingSkills.push(prefSkill.skill);
      }
    });

    breakdown.skillsScore = totalWeight > 0 ? Math.round((weightedMatch / totalWeight) * 100) : 100;

    if (matchedSkills.length > 0) {
      reasons.push(`${matchedSkills.length} of ${opportunity.skills.length} required/preferred skills match (${matchedSkills.slice(0, 3).join(', ')}${matchedSkills.length > 3 ? '...' : ''})`);
    } else if (opportunity.skills.length > 0) {
      reasons.push('You are missing most required skills for this opportunity');
    }
  } else {
    breakdown.skillsScore = 100; // No skills required = full match
    reasons.push('No specific skills required for this opportunity');
  }

  // --- 2. Career Goal Matching (20%) ---
  if (
    student.careerGoals && student.careerGoals.length > 0 &&
    opportunity.careerDomains && opportunity.careerDomains.length > 0
  ) {
    const matchedGoals = student.careerGoals.filter(goal =>
      opportunity.careerDomains.some(
        domain =>
          domain.toLowerCase().includes(goal.toLowerCase()) ||
          goal.toLowerCase().includes(domain.toLowerCase())
      )
    );

    if (matchedGoals.length > 0) {
      breakdown.careerScore = 100;
      reasons.push(`Career goal "${matchedGoals[0]}" aligns with this opportunity's domain`);
    } else {
      breakdown.careerScore = 20; // Low but not zero — opportunity may still be useful
    }
  } else if (!student.careerGoals || student.careerGoals.length === 0) {
    breakdown.careerScore = 40; // Neutral — student hasn't set goals yet
  } else {
    breakdown.careerScore = 40; // Opportunity has no domain tags
  }

  // --- 3. Interests Matching (15%) ---
  if (
    student.interests && student.interests.length > 0 &&
    opportunity.tags && opportunity.tags.length > 0
  ) {
    const matchCount = student.interests.filter(interest =>
      opportunity.tags.some(
        tag =>
          tag.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(tag.toLowerCase())
      )
    ).length;

    if (matchCount > 0) {
      breakdown.interestsScore = Math.min(100, 40 + matchCount * 30);
      reasons.push(`${matchCount} of your interests match this opportunity's tags`);
    } else {
      breakdown.interestsScore = 20;
    }
  } else {
    breakdown.interestsScore = 50; // Neutral when data is missing
  }

  // --- 4. Education / Eligibility (15%) — already computed above ---
  // educationScore already set in eligibility block

  // --- 5. Experience (10%) ---
  if (student.experience && student.experience.length > 0) {
    breakdown.experienceScore = Math.min(100, 50 + student.experience.length * 25);
  } else {
    breakdown.experienceScore = 40; // Beginner is expected for most student opportunities
  }

  // --- 6. Preferences (5%) ---
  let prefScore = 50;
  if (student.preferences) {
    if (opportunity.remote && student.preferences.remote) {
      prefScore = 100;
      reasons.push('This opportunity is remote — matches your work preference');
    } else if (!opportunity.remote && !student.preferences.remote) {
      prefScore = 80;
    }
    if (
      student.preferences.preferredOpportunityTypes &&
      student.preferences.preferredOpportunityTypes.includes(opportunity.type)
    ) {
      prefScore = Math.max(prefScore, 90);
    }
  }
  breakdown.preferencesScore = prefScore;

  // --- Final Weighted Score ---
  const matchScore = Math.round(
    breakdown.skillsScore * WEIGHTS.SKILLS +
    breakdown.careerScore * WEIGHTS.CAREER +
    breakdown.interestsScore * WEIGHTS.INTERESTS +
    breakdown.educationScore * WEIGHTS.EDUCATION +
    breakdown.experienceScore * WEIGHTS.EXPERIENCE +
    breakdown.preferencesScore * WEIGHTS.PREFERENCES
  );

  return {
    matchScore,
    breakdown,
    matchedSkills,
    missingSkills,
    reasons,
    eligibility: {
      eligible: eligibility.eligible,
      failedCriteria: eligibility.failedCriteria
    }
  };
};

/**
 * Generates and persists recommendations for a student.
 * Clears stale recs and regenerates fresh ones.
 */
const generateRecommendations = async (student) => {
  // Clear old recommendations for this student
  await Recommendation.deleteMany({ studentId: student._id });

  // Fetch all active, non-expired opportunities
  const opportunities = await Opportunity.find({
    status: 'ACTIVE',
    deadline: { $gte: new Date() }
  });

  if (opportunities.length === 0) return;

  const docs = opportunities.map(opp => {
    const match = calculateMatch(student, opp);
    return {
      studentId: student._id,
      opportunityId: opp._id,
      matchScore: match.matchScore,
      breakdown: match.breakdown,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      reasons: match.reasons,
      generatedAt: new Date()
    };
  });

  // Use ordered:false so one failure doesn't abort all inserts
  await Recommendation.insertMany(docs, { ordered: false });
};

module.exports = { calculateMatch, generateRecommendations };
