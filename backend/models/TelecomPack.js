const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TelecomPack = sequelize.define('TelecomPack', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  entite: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  operateur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  produit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  etatAbonnement: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'etatabonnement' // Ensure this matches the actual column name in the database
  },
  dateAbonnement: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'dateabonnement' // Ensure this matches the actual column name in the database
  },
  dateReengagement: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'datereengagement' // Ensure this matches the actual column name in the database
  },
  dateEtat: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'dateetat' // Ensure this matches the actual column name in the database
  },
  observation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  data: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  voix: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  internet: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'telecom_pack', // Ensure this matches the actual table name
  timestamps: true,
  createdAt: 'createdat', // Add these lines to map the correct column names
  updatedAt: 'updatedat',
});

module.exports = TelecomPack;
