const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const TelephoneLine = require('./TelephoneLine');
const User = require('./user'); // Assuming you have a User model

const TelephoneLineModification = sequelize.define('TelephoneLineModification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  telephoneLineId: {
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

TelephoneLineModification.belongsTo(TelephoneLine, { foreignKey: 'telephoneLineId' });
TelephoneLineModification.belongsTo(User, { foreignKey: 'userId' });

module.exports = TelephoneLineModification;
