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
  getToursWithin,
  getDistances,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

// ROUTES
// router.param('id', checkID);

// TOUR QUERY
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
router.route('/tour-stats').get(getTourStats);
router.route('/top-5-tours').get(aliasTopTours, getAllTours);

// GEOSPATIAL QUERY
// Get all tours which located within a round rage
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

// GET ALL TOURS - CREATE TOUR
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

// DELETE - UPDATE - GET SINGLE TOUR
router
  .route('/:id')
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .get(getTour);

// NESTED ROUTES
router.use('/:tourId/reviews', reviewRouter); // Everytime specify with this url, using reviewRouter

module.exports = router;
