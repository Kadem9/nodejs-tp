const express = require('express');
const { register, login } = require('../controllers/authController');
const { getProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { forgotPassword } = require('../controllers/authController');
const { resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


module.exports = router;
