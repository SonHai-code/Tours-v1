const express = require('express');

const {
  getAllUsers,
  createUser,
  getUser,
  deleteUser,
  updateUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controllers/userController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
  logout,
} = require('../controllers/authController');

const router = express.Router();

//  Authentication
router.post('/signup', signup); // sign up should just post
router.post('/login', login); // sign up should just post

router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// All routes after this point have protect middleware
router.use(protect);

router.patch('/updateMyPassword', updatePassword);

// Current user
router.route('/me').get(getMe, getUser);

// Resize the image after updating it
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

// Only admin can modify the user
router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).delete(deleteUser).patch(updateUser);

module.exports = router;
