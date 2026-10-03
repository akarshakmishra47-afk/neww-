/**
 * Eligibility Engine
 * Checks whether a student meets an opportunity's hard eligibility criteria
 * before the opportunity is included in recommendation ranking.
 */

/**
 * @param {Object} student  — User document
 * @param {Object} opportunity — Opportunity document
 * @returns {{ eligible: boolean, reasons: string[], failedCriteria: string[] }}
 */
const checkEligibility = (student, opportunity) => {
  const reasons = [];
  const failedCriteria = [];

  const eligibility = opportunity.eligibility;
  const ed = student.education || {};

  // If no eligibility criteria defined, everyone is eligible
  if (!eligibility || Object.keys(eligibility).length === 0) {
    return { eligible: true, reasons: ['No specific eligibility criteria'], failedCriteria: [] };
  }

  // 1. Minimum CGPA
  if (eligibility.minimumCGPA && eligibility.minimumCGPA > 0) {
    if (ed.cgpa == null || ed.cgpa < eligibility.minimumCGPA) {
      failedCriteria.push(`Minimum CGPA required: ${eligibility.minimumCGPA} (yours: ${ed.cgpa ?? 'not set'})`);
    } else {
      reasons.push(`Your CGPA of ${ed.cgpa} meets the minimum requirement of ${eligibility.minimumCGPA}`);
    }
  }

  // 2. Minimum Year of study
  if (eligibility.minimumYear && eligibility.minimumYear > 0) {
    if (ed.year == null || ed.year < eligibility.minimumYear) {
      failedCriteria.push(`Minimum year required: Year ${eligibility.minimumYear} (yours: ${ed.year ?? 'not set'})`);
    } else {
      reasons.push(`Your current year (Year ${ed.year}) satisfies the minimum year requirement`);
    }
  }

  // 3. Maximum Year of study
  if (eligibility.maximumYear && eligibility.maximumYear > 0) {
    if (ed.year != null && ed.year > eligibility.maximumYear) {
      failedCriteria.push(`Maximum year allowed: Year ${eligibility.maximumYear} (yours: Year ${ed.year})`);
    }
  }

  // 4. Allowed degrees
  if (eligibility.degrees && eligibility.degrees.length > 0) {
    const userDegree = (ed.degree || '').toLowerCase();
    const degreeMatch = eligibility.degrees.some(d => d.toLowerCase() === userDegree || userDegree.includes(d.toLowerCase()));
    if (!degreeMatch) {
      failedCriteria.push(`Required degree: ${eligibility.degrees.join(' or ')} (yours: ${ed.degree || 'not set'})`);
    } else {
      reasons.push(`Your degree (${ed.degree}) satisfies the requirement`);
    }
  }

  // 5. Allowed branches
  if (eligibility.branches && eligibility.branches.length > 0) {
    const userBranch = (ed.branch || '').toLowerCase();
    const branchMatch = eligibility.branches.some(b => b.toLowerCase() === userBranch || userBranch.includes(b.toLowerCase()));
    if (!branchMatch) {
      failedCriteria.push(`Required branch: ${eligibility.branches.join(' or ')} (yours: ${ed.branch || 'not set'})`);
    } else {
      reasons.push(`Your branch (${ed.branch}) satisfies the requirement`);
    }
  }

  return {
    eligible: failedCriteria.length === 0,
    reasons,
    failedCriteria
  };
};

module.exports = { checkEligibility };
