const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllReviews,
  createReview,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true }); // Setting to use tourId

// Get all reviews
router.get('/', getAllReviews);

// Create a review
// User must have log in with role 'user' to add a review
router.post('/', protect, restrictTo('user', 'admin'), createReview);

module.exports = router;
