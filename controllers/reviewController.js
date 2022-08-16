const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handleFactory');

exports.setTourUserIds = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId; // get tour id from req.params
  if (!req.body.user) req.body.user = req.user.id; // get user if from protect mw
  next();
});
exports.getAllReviews = getAll(Review);
exports.createReview = createOne(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
exports.getReview = getOne(Review);
