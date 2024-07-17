const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const registerUser = async (userData) => {
  const { fullName, email, password, role } = userData;

  let user = await User.findOne({ where: { email } });
  if (user) {
    throw new Error('User already exists');
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
    },
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  return token;
};

const loginUser = async (email, password) => {
  let user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const payload = {
    user: {
      id: user.id,
      role: user.role,
    },
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  return token;
};

module.exports = {
  registerUser,
  loginUser,
};
