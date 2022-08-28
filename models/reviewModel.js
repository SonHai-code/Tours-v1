const mongoose = require('mongoose');
const Tour = require('./tourModel');

// Schema common types: String/Number/Date/Boolean/ObjectId/Array
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please provide some reviews'],
    },

    rating: {
      type: Number,
      required: [true, 'Review must have a rating'],
      min: [1, 'The rating must above 1.0'],
      max: [5, 'The rating must below 5.0'],
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // Parent referencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  // Make sure if there's virtual property, it will not display on DB
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// QUERY MIDDLEWARES
// Parent Referencing with populate
reviewSchema.pre(/^find/, function (next) {
  // this.populate({ path: 'tour', select: 'name' }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// STATIC FUNCTION to caculate the ratingsAverage
// Adding a static function to your schema, and Mongoose attaches it to any model you compile with that schema
reviewSchema.statics.calcRatingsAverage = async function (tourId) {
  // Review model has field 'tour' that contains tourId
  // this now point to the module Review
  const stats = await this.aggregate([
    // stats is an array
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  console.log(stats);

  // Caculate ratingsQuantity and ratingsAverage of Tour Module
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

// Just do the calculation after data was saved in DB
reviewSchema.post('save', function () {
  // this point to current document
  this.constructor.calcRatingsAverage(this.tour); // this.constructor <=> Review module
});

const Review = mongoose.model('Review', reviewSchema, 'Reviews');

module.exports = Review;
