const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema, 'Reviews');

module.exports = Review;
