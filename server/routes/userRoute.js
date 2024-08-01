const express = require('express');
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getUserHistory,
  validateUser,
  changeUserPassword,
  deleteUserByEmail,
  changeUserRole,
  fetchAdminList
} = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

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

// @route   PUT /api/users/validate/:userId
// @desc    Validate user account
// @access  Private/Admin
router.put('/validate/:email', authenticate, isAdmin, validateUser);

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private/Admin
router.put('/password', authenticate, isAdmin, changeUserPassword);

// @route   DELETE /api/users/:userId
// @desc    Remove user
// @access  Private/Admin
router.delete('/:email', authenticate, isAdmin, deleteUserByEmail);

// @route   PUT /api/users/role
// @desc    Change user role
// @access  Private/Admin
router.put('/role', authenticate, isAdmin, changeUserRole);

// Route to get admin list in user routes (add this route in your backend routes)
router.get('/admin/admin-list', authenticate, isAdmin, fetchAdminList);

module.exports = router;
