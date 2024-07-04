const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TelephoneLine = sequelize.define('TelephoneLine', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('digital', 'analog'),
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = TelephoneLine;