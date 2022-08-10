const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true }); // Setting to use tourId

// Get all reviews
router.get('/', getAllReviews);

// Create a review
// User must have log in with role 'user' to add a review
router.post(
  '/',
  protect,
  restrictTo('user', 'admin'),
  setTourUserIds,
  createReview
);

// Delete review
router.delete('/:id', deleteReview);

// Update review
router.put('/:id', updateReview);

module.exports = router;
