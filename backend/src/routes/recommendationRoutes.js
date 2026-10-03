const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getRecommendationById,
  refreshRecommendations,
  evaluateRecommendation
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getRecommendations);

router.route('/refresh')
  .post(protect, refreshRecommendations);

// Protected: evaluate uses req.user profile context
router.route('/evaluate')
  .post(protect, evaluateRecommendation);

router.route('/:id')
  .get(protect, getRecommendationById);

module.exports = router;
