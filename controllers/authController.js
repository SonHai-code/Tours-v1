const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

// Create token function
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    // Create jwt signature with document's id and SECRET that was stored on server
    expiresIn: process.env.JWT_EXPIRES_IN, // Set the expires for JWT
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Create new user account
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  // Get email and password from req.body that user type in
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(
      new AppError('Please provide both your email and password!', 400)
    );
  }

  // 2) Check if the password is correct depend on the email
  const user = await User.findOne({ email }).select('+password');

  // if either email or password is incorrect
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) If everything is ok, send token to the client
  createSendToken(user, 200, req, res);

  next();
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Set expire for the token in 10 seconds
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// protect routes -> user must log in to get access the datas
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Getting the token and check if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; // get the token from req.headers
  }
  // Get the token 'jwt' from the cookie
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 404) // 404 means not found
    );
  }
  // 2) Vertification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //  Using promisify to return a Promise

  // 3) Check if the user still exists
  const currentUser = await User.findById(decoded.id); // decoded is an object
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
  res.locals.user = currentUser;
  next();
});

// Only for rendering the page, no error occurs
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Vertification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      ); //  Using promisify to return a Promise

      // 2) Check if the user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next(
          new AppError(
            'The user belonging to this token user does no longer exist!',
            401
          )
        );
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      // put the currentUser into locals
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
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
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }

  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from the collection
  const user = await User.findById(req.user.id).select('+password'); // Because the user has already logged in

  // 2) Check POST current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError('Your current password is wrong. Please try again!', 401)
    );
  }

  // 3) If correct, update new password
  user.password = await req.body.password;
  user.passwordConfirm = await req.body.passwordConfirm;
  await user.save();

  // 4) Log in, send JWT to client
  createSendToken(user, 200, req, res);
  next();
});
