const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const moment = require('moment');
const ITEquipment = require('../models/ITEquipment');
const TelecomPack = require('../models/TelecomPack');
const TelephoneLine = require('../models/TelephoneLine');
const { authenticate } = require('../middleware/authMiddleware');

const uploadProgress = {};

const excelDateToJSDate = (serial) => {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const daysOffset = Math.floor(serial);
  const millisecondsOffset = (serial - daysOffset) * 86400 * 1000;
  return new Date(excelEpoch.getTime() + daysOffset * 86400 * 1000 + millisecondsOffset);
};

const formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD');
};

const setDefaultValuesMaterielInformatique = (data, defaultValue = '------') => {
  const defaultDateFields = ['date_installation', 'fin_garantie', 'date_achat', 'date_livraison', 'date_sortie'];
  const notNullFields = ['numero_facture', 'prix_achat', 'numero_appel_offre'];

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        if (defaultDateFields.includes(key)) {
          console.log(`Setting default value for date field ${key}`);
          return [key, null];
        } else if (notNullFields.includes(key)) {
          console.log(`Setting default value for not-null field ${key}`);
          return [key, defaultValue];
        } else {
          console.log(`Setting default value for field ${key}`);
          return [key, defaultValue];
        }
      }
      if (defaultDateFields.includes(key)) {
        if (!isNaN(value)) {
          value = excelDateToJSDate(value);
        }
        const formattedDate = moment(value, ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], true).isValid() ?
          formatDate(value) : null;
        return [key, formattedDate];
      }
      return [key, value];
    })
  );
};

const setDefaultValuesParcTelecom = (data, defaultValue = '') => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (value === '' || value === null) {
        return [key, defaultValue];
      }
      if (['dateAbonnement', 'dateReengagement', 'dateEtat'].includes(key)) {
        if (!isNaN(value)) {
          value = excelDateToJSDate(value);
        }
        const formattedDate = moment(value, ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], true).isValid() ?
          formatDate(value) : null;
        return [key, formattedDate];
      }
      return [key, value];
    })
  );
};

const setDefaultValues = (data, defaultValue = '------') => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (value === '' || value === null) {
        if (['date_installation', 'fin_garantie', 'date_achat', 'date_livraison', 'date_sortie'].includes(key)) {
          return [key, null];
        } else {
          return [key, defaultValue];
        }
      }
      return [key, value];
    })
  );
};

const filterAndSetDefaults = (data, table) => {
  const tableColumns = {
    it_equipments: [
      'categorie', 'marque', 'model', 'code_materiel', 'serie', 'code_localisation',
      'code_entite', 'date_installation', 'fin_garantie', 'statut', 'type_acquisition',
      'date_achat', 'date_livraison', 'fournisseur', 'prix_achat', 'numero_appel_offre', 
      'numero_facture', 'numero_livraison', 'cout_maintenance', 'emploi_principal', 
      'niveau_criticite', 'sla', 'date_sortie', 'commentaire'
    ],
    telecom_pack: [
      'entite', 'operateur', 'produit2', 'numero', 'etatAbonnement', 'dateAbonnement',
      'dateReengagement', 'dateEtat', 'observation'
    ],
    telephone_lines: [
      'numero_de_gsm', 'full_name', 'code_entite', 'direction', 'fonction', 'operateur',
      'categorie', 'poste_GSM'
    ]
  };

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
      'date de sortie': 'date_sortie',
      'commentaire': 'commentaire'
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

  return data.map(record => {
    let filteredRecord = mapColumns(record, columnMapping[table]);
    if (table === 'it_equipments') {
      filteredRecord = setDefaultValuesMaterielInformatique(filteredRecord);
    } else if (table === 'telecom_pack') {
      filteredRecord = setDefaultValuesParcTelecom(filteredRecord);
    } else if (table === 'telephone_lines') {
      filteredRecord = setDefaultValues(filteredRecord);
      filteredRecord.numero_de_gsm = String(filteredRecord.numero_de_gsm);
    }
    return filteredRecord;
  });
};

const getUniqueColumn = (table) => {
  switch (table) {
    case 'it_equipments':
      return 'code_materiel';
    case 'telecom_pack':
      return 'entite';
    case 'telephone_lines':
      return 'numero_de_gsm';
    default:
      throw new Error('Invalid table name');
  }
};

router.post('/:table', authenticate, async (req, res) => {
  const uploadId = generateUniqueId();
  uploadProgress[uploadId] = 0;
  try {
    const table = req.params.table;
    const file = req.files?.file;

    if (!file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', file.name);

    let workbook;
    try {
      workbook = XLSX.read(file.data, { type: 'buffer' });
    } catch (err) {
      console.error('Error reading Excel file:', err);
      return res.status(400).json({ error: 'Error reading Excel file' });
    }

    const sheetNames = workbook.SheetNames;
    console.log('Sheet names:', sheetNames);

    let data;
    try {
      data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
    } catch (err) {
      console.error('Error converting sheet to JSON:', err);
      return res.status(400).json({ error: 'Error converting sheet to JSON' });
    }
    console.log('Data from file:', data);

    if (!Array.isArray(data) || data.length === 0) {
      console.error('Invalid or empty Excel file');
      return res.status(400).json({ error: 'Invalid or empty Excel file' });
    }

    let Model;
    try {
      switch (table) {
        case 'it_equipments':
          Model = ITEquipment;
          break;
        case 'telecom_pack':
          Model = TelecomPack;
          break;
        case 'telephone_lines':
          Model = TelephoneLine;
          break;
        default:
          console.error('Invalid table name:', table);
          return res.status(400).json({ error: 'Invalid table name' });
      }
    } catch (err) {
      console.error('Error determining model:', err);
      return res.status(500).json({ error: 'Server error determining model' });
    }

    const uniqueColumn = getUniqueColumn(table);
    const filteredData = filterAndSetDefaults(data, table).map(record => {
      const { id, createdAt, updatedAt, ...rest } = record;
      return Object.fromEntries(
        Object.entries(rest).filter(([key]) => Model.rawAttributes.hasOwnProperty(key))
      );
    });

    console.log('Filtered data:', filteredData);

    const totalRecords = filteredData.length;
    const createdRecords = [];
    for (const [index, record] of filteredData.entries()) {
      try {
        const whereClause = {};
        whereClause[uniqueColumn] = record[uniqueColumn].toString();

        if (!record[uniqueColumn]) {
          console.error(`Record missing unique column ${uniqueColumn}:`, record);
          continue;
        }

        console.log(`Processing record with numero_facture: ${record.numero_facture}, prix_achat: ${record.prix_achat}, numero_appel_offre: ${record.numero_appel_offre}`);

        if (!record.numero_facture) {
          console.log('Setting default value for numero_facture');
          record.numero_facture = '------';
        }
        if (!record.prix_achat) {
          console.log('Setting default value for prix_achat');
          record.prix_achat = 0;
        }
        if (!record.numero_appel_offre) {
          console.log('Setting default value for numero_appel_offre');
          record.numero_appel_offre = '------';
        }

        const existingRecord = await Model.findOne({ where: whereClause });

        if (existingRecord) {
          await existingRecord.update(record);
          console.log(`Updated record for ${record[uniqueColumn]}`);
          createdRecords.push(existingRecord);
        } else {
          const newRecord = await Model.create(record);
          console.log(`Created new record for ${record[uniqueColumn]}`);
          createdRecords.push(newRecord);
        }

        uploadProgress[uploadId] = Math.round(((index + 1) / totalRecords) * 100);
        req.app.get('io').emit('uploadProgress', { uploadId, progress: uploadProgress[uploadId] });
      } catch (error) {
        console.error('Error inserting or updating record into the database:', error);
        return res.status(500).json({ error: 'Error inserting or updating records into the database' });
      }
    }
    console.log('Records created or updated:', createdRecords);

    res.status(201).json({ message: 'Data uploaded successfully', records: createdRecords, uploadId });
  } catch (error) {
    console.error('Unexpected server error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  } finally {
    delete uploadProgress[uploadId];
  }
});

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

module.exports = router;
