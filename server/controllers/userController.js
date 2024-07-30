const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const LoginHistory = require('../models/loginHistory'); // Ensure this is the correct path to your LoginHistory model

// @route   POST api/users/register
// @desc    Register user
// @access  Public
exports.registerUser = async (req, res) => {
  console.log('Register user endpoint hit');
  console.log('Request body:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, role } = req.body;

  try {
    let user = await User.findOne({ where: { email } });

    if (user) {
      console.log('User already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('Error signing token:', err);
          throw err;
        }
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Error during user registration:', err.message);
    console.error(err); // Log the entire error object
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
// controllers/userController.js
exports.loginUser = async (req, res) => {
  console.log('Login user endpoint hit');
  console.log('Request body:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('Invalid credentials: user not found');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Invalid credentials: password mismatch');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Update lastLogin field
    user.lastLogin = new Date();
    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('Error signing token:', err);
          throw err;
        }
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Error during user login:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};


// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'fullName', 'email'],
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const { fullName, email } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   DELETE api/users/profile
// @desc    Delete user profile
// @access  Private
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.destroy();

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/users/history
// @desc    Get user login history
// @access  Private
// controllers/userController.js
exports.getUserHistory = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['fullName', 'email', 'lastLogin'],
      where: {
        role: ['user', 'consultant'],
      },
    });

    res.json(users);
  } catch (err) {
    console.error('Error fetching user history:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
