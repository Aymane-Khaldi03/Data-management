// models/ITEquipmentModification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const ITEquipment = require('./ITEquipment');
const User = require('./user'); // Assuming you have a User model

const ITEquipmentModification = sequelize.define('ITEquipmentModification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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

ITEquipmentModification.belongsTo(ITEquipment, { foreignKey: 'equipmentId' });
ITEquipmentModification.belongsTo(User, { foreignKey: 'userId' });

module.exports = ITEquipmentModification;
