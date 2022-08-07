const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
// const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

// Create token function
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    // Create jwt signature with document's id and SECRET that was stored on server
    expiresIn: process.env.JWT_EXPIRES_IN, // Set the expires for JWT
  });

// Send the token to the client via cookie
const createAndSendToken = (res, statusCode, user) => {
  // Create token
  const token = signToken(user._id);

  // Set cookies options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 90 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // If run on prod mode -> set secure = true

  // Store JWT on cookies
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  // Send response
  res.status(statusCode).json({
    status: 'success',
    token,
  });
};

// Create new user account
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  // Create signature
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide your email and password!', 400));
  }

  // 2) Check if the password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) If everything is ok, send token to the client
  createAndSendToken(res, 200, user);
});

// protect routes -> user must log in to get access the datas
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Getting the token and check if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; // get the token
  }
  console.log(token);
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 404) // 404 means not found
    );
  }
  // 2) Vertification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //  Using promisify to return a Promise

  // 3) Check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token user does no longer exist!',
        401
      )
    );
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401)
    );
  }

  // Grant access to protected route
  req.user = currentUser; // When you've got access, you'll be able to access from req.user
  next();
});

// Only role="admin" allowed to access
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles['admin', 'lead-guide']. role['user']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };

// Forgot password -> send new password to client's email
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user base on email address
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address!', 404));
  }

  // 2) Generate the random reset password
  const resetToken = user.createPasswordResetToken(); // create new pasword 
  await user.save({ validateBeforeSave: true }); 

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}. \nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was error sending the email. Try again later!', 500)
    );
  }

  res.status(200).json({
    status: 'sucess',
    message: 'Token sent to email!',
  });
});


exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto // hashed token is the password reset
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 2) If the token has not expired, and there is user, set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await User.save();
  // 3) Update changePasswordAt property of the user (userModule.js)
  
  // 4) Log the user in, send JWT
  createAndSendToken(res, 200, user);
});


exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from the collection
  const user = await User.findById(req.user.id).select('+password'); // Because the user has already logged in
  // 2) Check POST current password is correct
  if (!user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(
      new AppError('Your current password is wrong. Please try again!', 401)
    );
  }
  // 3) If correct, update new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) Log in, send JWT to client
  createAndSendToken(res, 200, user);
});
