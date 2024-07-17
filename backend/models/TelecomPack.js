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
  produit2: {
    type: DataTypes.STRING, // Add this field
    allowNull: true,
  },
  numero: {
    type: DataTypes.TEXT,
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
<<<<<<< HEAD
  },
  typePoste: {          // Added
    type: DataTypes.STRING,
    allowNull: true,
  },
  numeroDeSerie: {      // Added
    type: DataTypes.STRING,
    allowNull: true,
  },
  dateAffectation: {    // Added
    type: DataTypes.DATE,
    allowNull: true,
=======
>>>>>>> d0277b8795c574a1f31b2650c890718540ac5a87
  }
}, {
  tableName: 'telecom_pack', // Ensure this matches the actual table name
  timestamps: true,
  createdAt: 'createdat', // Add these lines to map the correct column names
  updatedAt: 'updatedat',
});

module.exports = TelecomPack;
