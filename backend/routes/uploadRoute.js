const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const ITEquipment = require('../models/ITEquipment');
const TelecomPack = require('../models/TelecomPack');
const TelephoneLine = require('../models/TelephoneLine');
const { authenticate } = require('../middleware/authMiddleware');

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

    console.log('Data to be inserted:', data);

    const filteredData = data.map(record => {
      const { id, createdAt, updatedAt, ...rest } = record;
      return rest;
    });

    console.log('Filtered data:', filteredData);

    // Insert or update records
    const createdRecords = [];
    for (const record of filteredData) {
      try {
        const [updatedRecord, created] = await Model.upsert(record, { returning: true });
        if (created) {
          createdRecords.push(updatedRecord);
        } else {
          console.log(`Updated record for numero_de_gsm: ${record.numero_de_gsm}`);
          createdRecords.push(updatedRecord);
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
