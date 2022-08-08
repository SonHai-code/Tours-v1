const express = require('express');
const {
  getAllTours,
  deleteTour,
  updateTour,
  getTour,
  createTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
const { createReview } = require('../controllers/reviewController');

const router = express.Router();

// router.param('id', checkID);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/tour-stats').get(getTourStats);
router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router.route('/').get(protect, getAllTours).post(createTour);
router
  .route('/:id')
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)
  .patch(updateTour)
  .get(getTour);

// NESTED ROUTES

// GET /tours/fadfaa/reviews -> get all reviews about the tour
// GET /tours/fagh231/reviews/414pad -> get a review from a tour

// POST /tours/esm321/reviews -> create new review from tour route
router
  .route('/:tourId/reviews')
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
