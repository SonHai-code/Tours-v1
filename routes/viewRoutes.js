const express = require('express');
const {
  getOverview,
  getTour,
  login,
  signup,
} = require('../controllers/viewController');

const router = express.Router();

// OVERVIEW PAGE
router.get('/', getOverview);

// DETAIL PAGES
router.get('/tour/:slug', getTour);

// LOGIN PAGE
router.get('/login', login);

// SIGNUP PAGE
router.get('signup', signup);
module.exports = router;
