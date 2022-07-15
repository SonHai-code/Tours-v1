const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  deleteUser,
  updateUser,
} = require('../controllers/userController');

const { signup, login } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup); // sign up should just post
router.post('/login', login); // sign up should just post

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).delete(deleteUser).patch(updateUser);

module.exports = router;
