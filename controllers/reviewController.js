const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const { deleteOne, updateOne, createOne } = require('./handleFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  // Query Review Document following tourId
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter).select('-__v');
  res.status(200).json({
    status: 'success',
    result: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.setTourUserIds = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId; // get tour id from req.params
  if (!req.body.user) req.body.user = req.user.id; // get user if from protect mw
  next();
});

exports.createReview = createOne(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
