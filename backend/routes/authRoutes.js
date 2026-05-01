const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  signup,
  login,
  getMe,
  getUsers,
  signupRules,
  loginRules,
} = require('../controllers/authController');

router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);
router.get('/me', auth, getMe);
router.get('/users', auth, getUsers);

module.exports = router;
