const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');


const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      // VALIDATORS
      maxlength: [40, 'A tour must have less than or equal 40 characters'],
      minlength: [10, 'A tour must have less than or equal 10 characters'],
      // validate: [
      //   validator.isAlpha,
      //   'A tour name should only contain characters!',
      // ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size!'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty!'],
      // Validators
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // Validators
      min: [1, 'Rating must above 1.0'],
      max: [5, 'Rating must below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!'],
    },
    priceDiscount: {
      type: Number,
      // val is the value of priceDiscount was created
      // true or false
      validate: {
        validator: function (val) {
          return this.price > val; // 'this' point to document creation
        },
        message: 'Discount price ({VALUE}) should be below regular price!', // {VALUE} access to val
      },
    },
    summary: {
      type: String,
      trim: true, // remove any white space at the beginning and at the end of the string
      required: [true, 'A tour must have a summary!'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image cover!'],
    },
    images: [String], // an array of string type
    createdAt: {
      type: Date,
      default: Date.now(),
      select: true,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
}); // virtual properties not be saved in controller

// DOCUMENT MIDDLEWARE: run before the .save() and .create()
// tourSchema.pre('save', function (next) {
//   // middleware of mongoose
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre(/^find/, function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });
// tourSchema.pre(/^find/, function (docs, next) {
//   console.log(docs);
//   next();
// });

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema, 'Tours');
module.exports = Tour;
