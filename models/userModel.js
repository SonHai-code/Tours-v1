const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },

  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address!'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide your password!'],
    // validator
    minlength: [8, 'Your password must have at least 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      // Only work on CREATE and SAVE
      // val is the value of the passwordConfirm
      validator: function (val) {
        return val === this.password; // true or false
      },
      message: 'Password is not the same!',
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Middleware before the moment the new user has saved in DB
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with the code of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

// Update changePasswordAt property of the user
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next(); // if the password was NOT modified or was created then NEXT()

  this.passwordChangeAt = Date.now() - 1000;
  next();
});

// Middleware berfore query
userSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});

// Set the passwordChangeAt property
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next(); // if the password was NOT modified or was created then NEXT()

  this.passwordChangeAt = Date.now() - 1000;
  next();
});

// Check the password of the user
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check whether user change the password recently
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means not change
  return false;
};

// Create new token for reset password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // create random string

  this.passwordResetToken = crypto // create reset password
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // miliseconds

  return resetToken;
};

const User = mongoose.model('User', userSchema, 'Users');

module.exports = User;
