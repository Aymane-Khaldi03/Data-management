const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const TelecomPack = require('./TelecomPack');
const User = require('./user');

const TelecomPackModification = sequelize.define('TelecomPackModification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  telecomPackId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: TelecomPack,
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
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
  
}, {
  tableName: 'TelecomPackModifications', // Specify the correct table name
});

TelecomPackModification.belongsTo(TelecomPack, { foreignKey: 'telecomPackId' });
TelecomPackModification.belongsTo(User, { foreignKey: 'userId' });

module.exports = TelecomPackModification;
