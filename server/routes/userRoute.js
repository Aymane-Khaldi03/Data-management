const express = require('express');
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getUserHistory,
} = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Add this route for fetching user history
router.get('/admin/user-history', authenticate, getUserHistory);

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('fullName', 'Full name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
  ],
  registerUser
);

// @route   POST /api/users/login
// @desc    Login a user
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  loginUser
);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, updateUserProfile);

// @route   DELETE /api/users
// @desc    Delete user
// @access  Private
router.delete('/', authenticate, deleteUser);

module.exports = router;