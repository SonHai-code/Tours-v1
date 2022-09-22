const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build template

  // 3) Render the template using data from step 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours, // means tours: tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (incliding reviews and tour guildes)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // 2) Build the template

  // 3) Render template using the data from step 1
  res
    .status(200)
    .set()
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.login = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

exports.signup = (req, res) => {
  res.status(200).render('signup', {
    title: 'signup',
  });
};
