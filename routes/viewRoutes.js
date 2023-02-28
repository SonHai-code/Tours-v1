const express = require('express');
const {
  getOverview,
  getTour,
  login,
  signup,
} = require('../controllers/viewController');

const { isLoggedIn } = require('../controllers/authController');

const router = express.Router();

router.use(isLoggedIn);

// OVERVIEW PAGE
router.get('/', getOverview);

// DETAIL PAGES
router.get('/tour/:slug', getTour);

// LOGIN PAGE
router.get('/login', login);

// SIGNUP PAGE
router.get('/signup', signup);
module.exports = router;
