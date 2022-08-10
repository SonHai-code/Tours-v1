const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const { deleteOne } = require('./handleFactory');

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

exports.createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId; // get tour id from req.params
  if (!req.body.user) req.body.user = req.user.id; // get user if from protect mw

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'sucess',
    message: 'Review has been created',
    data: {
      review: newReview,
    },
  });
});

exports.deleteReview = deleteOne(Review);
