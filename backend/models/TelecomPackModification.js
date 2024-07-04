const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const TelecomPack = require('./TelecomPack');
const User = require('./user'); // Assuming you have a User model

const TelecomPackModification = sequelize.define('TelecomPackModification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  telecomPackId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  field: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  oldValue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  newValue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  modifiedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

TelecomPackModification.belongsTo(TelecomPack, { foreignKey: 'telecomPackId' });
TelecomPackModification.belongsTo(User, { foreignKey: 'userId' });

module.exports = TelecomPackModification;
