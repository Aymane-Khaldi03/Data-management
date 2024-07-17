// backend/controllers/excelController.js
const XLSX = require('xlsx');
const TelephoneLine = require('../models/TelephoneLine'); // Import the model

exports.uploadExcel = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const file = req.files.file;
  const workbook = XLSX.read(file.data, { type: 'buffer' });

  const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
  const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  try {
    // Process the data and insert into the database
    const insertedData = await TelephoneLine.bulkCreate(sheetData);
    res.json({ success: true, data: insertedData });
  } catch (error) {
    console.error('Error uploading data:', error);
    res.status(500).json({ error: 'Failed to upload data' });
  }
};

exports.generateExcel = (req, res) => {
  const { sheets } = req.body;

  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
  });

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename="modified_data.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  res.send(buffer);
};
