const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ITEquipment = sequelize.define('ITEquipment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  categorie: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  marque: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  model: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  code_materiel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  serie: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  code_localisation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  code_entite: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_installation: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  fin_garantie: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  statut: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type_acquisition: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_achat: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  date_livraison: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  fournisseur: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  numero_facture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  prix_achat: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  numero_appel_offre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  numero_livraison: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cout_maintenance: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  emploi_principal: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  niveau_criticite: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sla: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_sortie: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  commentaire: {  // Add this field
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'it_equipments', 
});

module.exports = ITEquipment;
