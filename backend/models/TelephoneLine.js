const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TelephoneLine = sequelize.define('TelephoneLine', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  numero_de_gsm: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code_entite: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  direction: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fonction: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  operateur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categorie: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  poste_GSM: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'telephone_lines', // Ensure this matches the actual table name
  timestamps: true,
});

module.exports = TelephoneLine;
