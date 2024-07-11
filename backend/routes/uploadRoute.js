const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const ITEquipment = require('../models/ITEquipment');
const TelecomPack = require('../models/TelecomPack');
const TelephoneLine = require('../models/TelephoneLine');
const { authenticate } = require('../middleware/authMiddleware');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload/:table', authenticate, upload.single('file'), async (req, res) => {
  try {
    const table = req.params.table;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty Excel file' });
    }

    let Model;
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
        return res.status(400).json({ error: 'Invalid table name' });
    }

    // Remove `id`, `createdAt`, and `updatedAt` fields from the data if they exist
    const filteredData = data.map(record => {
      const { id, createdAt, updatedAt, ...rest } = record;
      return rest;
    });

    const createdRecords = await Model.bulkCreate(filteredData);
    res.status(201).json({ message: 'Data uploaded successfully', records: createdRecords });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

module.exports = router;
