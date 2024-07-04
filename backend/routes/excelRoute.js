// backend/routes/excelRoute.js
const express = require('express');
const router = express.Router();
const excelController = require('../controllers/excelController');

router.post('/upload', excelController.uploadExcel);
router.post('/generate', excelController.generateExcel);

module.exports = router;
