const User = require('../models/user');

const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: ['id', 'fullName', 'email', 'role'],
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const updateUser = async (id, updateData) => {
  const { fullName, email } = updateData;
  let user = await User.findByPk(id);
  if (!user) {
    throw new Error('User not found');
  }

  user.fullName = fullName || user.fullName;
  user.email = email || user.email;

  await user.save();
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error('User not found');
  }
  await user.destroy();
  return { message: 'User removed' };
};

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
};
