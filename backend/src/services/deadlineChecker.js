const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');
const Recommendation = require('../models/Recommendation');

/**
 * Checks for upcoming deadlines and creates notifications for relevant students.
 * Runs every 6 hours. Prevents duplicate notifications per student+opportunity pair.
 */
const checkDeadlines = async () => {
  try {
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Find opportunities whose deadline falls within the next 3 days and are still ACTIVE
    const urgentOpportunities = await Opportunity.find({
      status: 'ACTIVE',
      deadline: { $gte: now, $lte: in3Days }
    }).select('_id title deadline');

    for (const opp of urgentOpportunities) {
      const daysLeft = Math.ceil((new Date(opp.deadline) - now) / (1000 * 60 * 60 * 24));

      // Find students who have this opportunity in their recommendations
      const relevantRecs = await Recommendation.find({ opportunityId: opp._id }).select('studentId');
      const studentIds = [...new Set(relevantRecs.map(r => String(r.studentId)))];

      for (const studentId of studentIds) {
        // Prevent duplicate: check if a DEADLINE notification for this opp already exists today
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const existing = await Notification.findOne({
          studentId,
          opportunityId: opp._id,
          type: 'DEADLINE',
          createdAt: { $gte: startOfDay }
        });

        if (!existing) {
          await Notification.create({
            studentId,
            opportunityId: opp._id,
            type: 'DEADLINE',
            title: `Deadline Approaching: ${opp.title}`,
            message: `The deadline for "${opp.title}" is in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Don't miss it!`
          });
        }
      }
    }
  } catch (err) {
    console.error('[DeadlineChecker] Error:', err.message);
  }
};

const startDeadlineChecker = () => {
  // Run once on startup, then every 6 hours
  checkDeadlines();
  setInterval(checkDeadlines, 6 * 60 * 60 * 1000);
  console.log('[DeadlineChecker] Started — runs every 6 hours');
};

module.exports = { startDeadlineChecker, checkDeadlines };
