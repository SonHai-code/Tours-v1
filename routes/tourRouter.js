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
const reviewRouter = require('./reviewRouter');

const router = express.Router();

// ROUTES
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
router.use('/:tourId/reviews', reviewRouter); // Everytime specify with this url, using reviewRouter

module.exports = router;
