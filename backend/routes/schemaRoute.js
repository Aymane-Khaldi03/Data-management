const express = require('express');
const router = express.Router();
const ITEquipment = require('../models/ITEquipment');
const TelecomPack = require('../models/TelecomPack');
const TelephoneLine = require('../models/TelephoneLine');
const XLSX = require('xlsx');

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

    const filteredData = jsonData.map(row => {
      const filteredRow = {};
      Object.keys(row).forEach(key => {
        if (model.rawAttributes[key] && !['id', 'createdAt', 'updatedAt'].includes(key)) {
          filteredRow[key] = row[key];
        }
      });
      return filteredRow;
    });

    await model.bulkCreate(filteredData);
    res.status(200).json({ message: 'Data uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload data' });
  }
});

module.exports = router;
