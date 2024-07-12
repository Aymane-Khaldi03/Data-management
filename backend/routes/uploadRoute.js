const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const moment = require('moment');
const ITEquipment = require('../models/ITEquipment');
const TelecomPack = require('../models/TelecomPack');
const TelephoneLine = require('../models/TelephoneLine');
const { authenticate } = require('../middleware/authMiddleware');

// Function to handle date conversion from Excel serial date to JS Date
const excelDateToJSDate = (serial) => {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const daysOffset = Math.floor(serial);
  const millisecondsOffset = (serial - daysOffset) * 86400 * 1000;
  return new Date(excelEpoch.getTime() + daysOffset * 86400 * 1000 + millisecondsOffset);
};

// Function to format date to YYYY-MM-DD
const formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD');
};

// Function to set default values for materiel informatique and format dates
const setDefaultValuesMaterielInformatique = (data, defaultValue = '------') => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (value === '' || value === null) {
        if (['date_installation', 'fin_garantie', 'date_achat', 'date_livraison', 'date_sortie'].includes(key)) {
          return [key, null];  // Set date fields to null if empty
        } else {
          return [key, defaultValue];  // Set other fields to default value
        }
      }
      if (['date_installation', 'fin_garantie', 'date_achat', 'date_livraison', 'date_sortie'].includes(key)) {
        if (!isNaN(value)) {
          value = excelDateToJSDate(value);  // Convert Excel serial date to JS Date
        }
        const formattedDate = moment(value, ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], true).isValid() ?
          formatDate(value) : null;
        return [key, formattedDate];  // Format date fields
      }
      return [key, value];
    })
  );
};

// Function to set default values for parc telecom and format dates
const setDefaultValuesParcTelecom = (data, defaultValue = '') => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (value === '' || value === null) {
        return [key, defaultValue];
      }
      if (['dateAbonnement', 'dateReengagement', 'dateEtat'].includes(key)) {
        if (!isNaN(value)) {
          value = excelDateToJSDate(value);  // Convert Excel serial date to JS Date
        }
        const formattedDate = moment(value, ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], true).isValid() ?
          formatDate(value) : null;
        return [key, formattedDate];  // Format date fields
      }
      return [key, value];
    })
  );
};

// Helper function to filter and set default values for the data based on the table
const filterAndSetDefaults = (data, table) => {
  switch (table) {
    case 'it_equipments':
      return data.map(record => setDefaultValuesMaterielInformatique(record));
    case 'telecom_pack':
      return data.map(record => setDefaultValuesParcTelecom(record));
    case 'telephone_lines':
      return data.map(record => {
        record.numero_de_gsm = String(record.numero_de_gsm);  // Ensure numero_de_gsm is a string
        return record;
      });
    default:
      throw new Error('Invalid table name');
  }
};

// Helper function to get unique column for each table
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

    // Insert or update records
    const createdRecords = [];
    for (const record of filteredData) {
      try {
        const whereClause = {};
        whereClause[uniqueColumn] = record[uniqueColumn];

        // Find the existing record based on unique column
        const existingRecord = await Model.findOne({ where: whereClause });

        if (existingRecord) {
          // Update the existing record
          await existingRecord.update(record);
          console.log(`Updated record for ${record[uniqueColumn]}`);
          createdRecords.push(existingRecord);
        } else {
          // Create a new record
          const newRecord = await Model.create(record);
          console.log(`Created new record for ${record[uniqueColumn]}`);
          createdRecords.push(newRecord);
        }
      } catch (error) {
        console.error('Error inserting or updating record into the database:', error);
        return res.status(500).json({ error: 'Error inserting or updating records into the database' });
      }
    }
    console.log('Records created or updated:', createdRecords);

    res.status(201).json({ message: 'Data uploaded successfully', records: createdRecords });
  } catch (error) {
    console.error('Unexpected server error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

module.exports = router;
