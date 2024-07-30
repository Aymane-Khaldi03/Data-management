// routes/schemaRoute.js

const express = require('express');
const router = express.Router();
const ITEquipment = require('../models/ITEquipment');
const TelecomPack = require('../models/TelecomPack');
const TelephoneLine = require('../models/TelephoneLine');
const XLSX = require('xlsx');

// Function to get model by name
const getModelByName = (name) => {
  switch (name) {
    case 'it_equipments':
      return ITEquipment;
    case 'telecom_pack':
      return TelecomPack;
    case 'telephone_lines':
      return TelephoneLine;
    default:
      return null;
  }
};

// Function to set default values for empty fields
const setDefaultValues = (data, defaultValue = '------') => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (value === '' || value === null) {
        if (['date_installation', 'fin_garantie', 'date_achat', 'date_livraison', 'date_sortie'].includes(key)) {
          return [key, null];  // Set date fields to null if empty
        } else {
          return [key, defaultValue];  // Set other fields to default value
        }
      }
      return [key, value];
    })
  );
};

// Fetch schema route
router.get('/:table', async (req, res) => {
  const { table } = req.params;
  console.log(`Fetching schema for table: ${table}`);
  try {
    const model = getModelByName(table);
    if (!model) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    const attributes = Object.keys(model.rawAttributes).filter(attr => !['id', 'createdAt', 'updatedAt'].includes(attr));
    res.json(attributes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch schema' });
  }
});

// Upload route
router.post('/upload/:table', async (req, res) => {
  const { table } = req.params;
  console.log(`Uploading data to table: ${table}`);
  const file = req.files?.file; // Use req.files to get the uploaded file

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const model = getModelByName(table);
    if (!model) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    const workbook = XLSX.read(file.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const columnMapping = {
      it_equipments: {
        'categorie': 'categorie',
        'marque': 'marque',
        'model': 'model',
        'code materiel': 'code_materiel',
        'serie': 'serie',
        'code localisation': 'code_localisation',
        'code entité': 'code_entite',
        'date d\'installation': 'date_installation',
        'fin de garantie': 'fin_garantie',
        'statut': 'statut',
        'type d\'acquisition': 'type_acquisition',
        'date d\'achat': 'date_achat',
        'date de livraison': 'date_livraison',
        'fournisseur': 'fournisseur',
        'n° de facture': 'numero_facture',
        'prix d\'achat': 'prix_achat',
        'n° d\'appel d\'offre': 'numero_appel_offre',
        'n° de livraison': 'numero_livraison',
        'côut maintenance': 'cout_maintenance',
        'emploi principal': 'emploi_principal',
        'niveau de criticité': 'niveau_criticite',
        'sla': 'sla',
        'date de sortie': 'date_sortie'
      },
      telephone_lines: {
        'numero_de_gsm': 'numero_de_gsm',
        'full_name': 'full_name',
        'code_entite': 'code_entite',
        'direction': 'direction',
        'fonction': 'fonction',
        'operateur': 'operateur',
        'categorie': 'categorie',
        'poste_gsm': 'poste_GSM'
      },
      telecom_pack: {
        'entite': 'entite',
        'operateur': 'operateur',
        'produit2': 'produit2',
        'numero': 'numero',
        'etatabonnement': 'etatAbonnement',
        'dateabonnement': 'dateAbonnement',
        'datereengagement': 'dateReengagement',
        'dateetat': 'dateEtat',
        'observation': 'observation'
      }
    };

    const mapColumns = (record, mapping) => {
      let mappedRecord = {};
      for (let [key, value] of Object.entries(record)) {
        if (mapping[key.toLowerCase()]) {
          mappedRecord[mapping[key.toLowerCase()]] = value;
        }
      }
      return mappedRecord;
    };

    const filteredData = jsonData.map(row => {
      const filteredRow = mapColumns(row, columnMapping[table]);
      return setDefaultValues(filteredRow); // Apply default values to filtered row
    });

    await model.bulkCreate(filteredData);
    res.status(200).json({ message: 'Data uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload data' });
  }
});

module.exports = router;