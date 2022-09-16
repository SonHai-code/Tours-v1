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

// Adding review index
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Just do the calculation after data was saved in DB
reviewSchema.post('save', function () {
  // this point to current document
  this.constructor.calcRatingsAverage(this.tour); // this.constructor <=> Review module
});

// findByIdAndUpdate
// findByIdAndDelete
// ---> Those are query middlewares

// Create Pre-Middleware for the event
// findOneAnd is replaced for findByIdAndUpdate and findByIdAndDelete
// BEFORE THE EVENT, SAVE THE QUERY TO 'r' variable
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // this is refer to the current document
  // Create r to store query of the document
  this.r = await this.findOne(); // Save the query to 'this' property to use it on POST method
  // console.log(this.r);
  next();
});

// AFTER THE QUERY HAS BEEN FINISHED
// then invoke the method calcRatingsAverage()
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne() does not work here because query has already executed
  await this.r.constructor.calcRatingsAverage(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema, 'Reviews');

module.exports = Review;
