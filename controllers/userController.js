const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handleFactory');

// Filter out unwanted fields are not allowed to update
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get all users
exports.getAllUsers = getAll(User);

// Get an user
exports.getUser = getOne(User);

// Create an user
exports.createUser = createOne(User);

// Delete an user
exports.deleteUser = deleteOne(User);

// Update an user
exports.updateUser = updateOne(User);

// Get current user
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Update your own account
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if the user POST password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update. Please use route: /updateMyPassword',
        400
      )
    );
  }
  // 2) Update user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Just delete user from client, NOT delete it from DB
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id, { active: false });

  res.status(204).json({
    status: 'sucess',
    message: 'Deleted Successful!',
    data: null,
  });
});
