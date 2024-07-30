const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
  console.log("Authenticating request...");
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.user.id);

    if (!req.user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { authenticate, isAdmin };
