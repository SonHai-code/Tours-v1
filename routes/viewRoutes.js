const express = require('express');
const {
  getOverview,
  getTour,
  login,
  getAccount,
  updateUserData,
} = require('../controllers/viewController');

const { isLoggedIn, protect } = require('../controllers/authController');

const router = express.Router();

// OVERVIEW PAGE
router.get('/', isLoggedIn, getOverview);

// DETAIL PAGES
router.get('/tour/:slug', isLoggedIn, getTour);

// LOGIN PAGE
router.get('/login', isLoggedIn, login);

// ACCOUNT PAGE
router.get('/me', protect, getAccount);

// ADJUST USER INFORMATIONS
router.post('/submit-user-data', isLoggedIn, updateUserData);

module.exports = router;
