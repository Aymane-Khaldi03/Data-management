const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
  console.log('Authenticating request...');
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Token:', token);

  if (!token) {
    console.log('No token, authorization denied');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    req.user = await User.findByPk(decoded.user.id);
    console.log('Authenticated user:', req.user);

    if (!req.user || (req.user.role !== 'admin' && !req.user.isValidated)) {
      console.log('Token is not valid or user not validated');
      return res.status(401).json({ msg: 'Token is not valid or user not validated' });
    }

    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  console.log('Checking if user is admin:', req.user);
  if (req.user.role !== 'admin') {
    console.log('Access denied. Admins only.');
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { authenticate, isAdmin };
