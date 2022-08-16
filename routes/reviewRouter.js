const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true }); // Setting to use tourId

router.use(protect);

// Get all reviews
router.get('/', getAllReviews);

// Get a review
router.get('/:id', getReview);

// Create a review
// User must have log in with role 'user' to add a review
router.post('/', restrictTo('user'), setTourUserIds, createReview);

// Delete review
router.delete('/:id', restrictTo('user', 'admin'), deleteReview);

// Update review
router.put('/:id', restrictTo('user', 'admin'), updateReview);

module.exports = router;
