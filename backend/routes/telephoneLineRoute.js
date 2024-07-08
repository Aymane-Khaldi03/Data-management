const express = require('express');
const router = express.Router();
const telephoneLineController = require('../controllers/telephoneLineController');
const { authenticate } = require('../middleware/authMiddleware');
const TelephoneLineModification = require('../models/TelephoneLineModification'); // Import the Telephone Line Modification model
const User = require('../models/user');
const TelephoneLine = require('../models/TelephoneLine');
const { Op, fn, col } = require('sequelize');

// Get all Telephone Lines
router.get('/', telephoneLineController.getTelephoneLines);

// Create a new Telephone Line
router.post('/', authenticate, telephoneLineController.createTelephoneLine);

// Get a Telephone Line by ID
router.get('/:id', authenticate, telephoneLineController.getTelephoneLineById);

// Update a Telephone Line
router.put('/:id', authenticate, telephoneLineController.updateTelephoneLine);

// Delete a Telephone Line
router.delete('/:id', authenticate, telephoneLineController.deleteTelephoneLine);

// Get Telephone Line modification history
router.get('/admin/telephone-line-modifications', authenticate, async (req, res) => {
  try {
    const modifications = await TelephoneLineModification.findAll({
      include: [
        { model: TelephoneLine },
        { model: User, attributes: ['fullName', 'email'] }
      ],
      order: [['modifiedAt', 'DESC']],
    });
    res.json(modifications);
  } catch (error) {
    console.error('Error fetching modification history:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Reset Telephone Line modification history
router.delete('/admin/telephone-line-modifications', authenticate, async (req, res) => {
  try {
    await TelephoneLineModification.destroy({
      where: {},
      truncate: true
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error resetting modification history:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get distinct values for dropdowns
router.get('/dropdown/:field', authenticate, async (req, res) => {
  try {
    const field = req.params.field;
    let columnName;
    switch (field) {
      case 'code_entite':
        columnName = 'code_entite';
        break;
      case 'direction':
        columnName = 'direction';
        break;
      case 'fonction':
        columnName = 'fonction';
        break;
      case 'operateur':
        columnName = 'operateur';
        break;
      case 'categorie':
        columnName = 'categorie';
        break;
      case 'poste_GSM':
        columnName = 'poste_GSM';
        break;
      default:
        throw new Error(`Field '${field}' is not recognized`);
    }
    const values = await TelephoneLine.findAll({
      attributes: [[fn('DISTINCT', col(columnName)), field]]
    });
    res.json(values.map(item => item[field]));
  } catch (error) {
    console.error(`Error fetching distinct values for field '${req.params.field}':`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
