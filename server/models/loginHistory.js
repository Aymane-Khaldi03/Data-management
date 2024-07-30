// models/loginHistory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user'); // Ensure this is the correct path to your User model

const LoginHistory = sequelize.define('LoginHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  loginTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
});

LoginHistory.belongsTo(User, { foreignKey: 'userId' });

module.exports = LoginHistory;
