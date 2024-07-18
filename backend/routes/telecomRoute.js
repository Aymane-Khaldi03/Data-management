const express = require('express');
const router = express.Router();
const telecomPackController = require('../controllers/telecomPackController');
const { authenticate } = require('../middleware/authMiddleware');
const TelecomPackModification = require('../models/TelecomPackModification');
const User = require('../models/user');
const TelecomPack = require('../models/TelecomPack');
const { Op, fn, col } = require('sequelize');

// Get all Telecom Packs
router.get('/', telecomPackController.getAllTelecomPacks);

// Create a new Telecom Pack
router.post('/', authenticate, telecomPackController.createTelecomPack);

// Get a Telecom Pack by ID
router.get('/:id', authenticate, telecomPackController.getTelecomPackById);

// Update a Telecom Pack
router.put('/:id', authenticate, async (req, res) => {
  try {
    const telecomPack = await TelecomPack.findByPk(req.params.id);
    if (!telecomPack) {
      console.error(`Telecom Pack with ID ${req.params.id} not found`);
      return res.status(404).json({ error: 'Telecom Pack not found' });
    }

    const updatedData = req.body;
    const changes = [];

    for (const key in updatedData) {
      if (key !== 'createdAt' && key !== 'updatedAt' && telecomPack[key] !== updatedData[key]) {
        changes.push({
          telecomPackId: telecomPack.id,
          userId: req.user.id,
          field: key,
          oldValue: telecomPack[key] ? telecomPack[key].toString() : null,
          newValue: updatedData[key] ? updatedData[key].toString() : null,
          modifiedAt: new Date(),
        });
      }
    }

    if (changes.length > 0) {
      console.log('Changes to be logged:', changes);
      await TelecomPackModification.bulkCreate(changes);
    }

    const updatedTelecomPack = await telecomPack.update(updatedData);
    res.json(updatedTelecomPack);
  } catch (err) {
    console.error('Error updating Telecom Pack:', err.message);
    console.error('Detailed error:', err); // Log the full error
    res.status(500).json({ error: err.message });
  }
});

// Delete a Telecom Pack
router.delete('/:id', authenticate, telecomPackController.deleteTelecomPack);

// Get Telecom Pack modification history
// Get Telecom Pack modification history
router.get('/admin/telecom-pack-modifications', authenticate, async (req, res) => {
  try {
    const modifications = await TelecomPackModification.findAll({
      include: [
        { model: TelecomPack, attributes: [] }, // Include only necessary attributes
        { model: User, attributes: ['fullName', 'email'] }
      ],
      order: [['modifiedAt', 'DESC']],
    });
    console.log('Fetched Telecom Pack Modifications:', JSON.stringify(modifications, null, 2));
    res.json(modifications);
  } catch (error) {
    console.error('Error fetching Telecom Pack modification history:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Reset Telecom Pack modification history
router.delete('/admin/telecom-pack-modifications', authenticate, async (req, res) => {
  try {
    await TelecomPackModification.destroy({
      where: {},
      truncate: true
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error resetting Telecom Pack modification history:', error.message);
    res.status(500).json({ error: error.message });
  }
});



// Get distinct values for dropdowns
router.get('/dropdown/:field', authenticate, async (req, res) => {
  try {
    const field = req.params.field;
    console.log(`Fetching dropdown values for field: ${field}`);
    let columnName;

    switch (field) {
      case 'entite':
        columnName = 'entite';
        break;
      case 'operateur':
        columnName = 'operateur';
        break;
      case 'etatAbonnement':
        columnName = 'etatabonnement'; // database column name
        break;
      case 'dateAbonnement':
        columnName = 'dateabonnement'; // database column name
        break;
      case 'dateReengagement':
        columnName = 'datereengagement'; // database column name
        break;
      case 'dateEtat':
        columnName = 'dateetat'; // database column name
        break;
      default:
        throw new Error(`Field '${field}' is not recognized`);
    }

    const values = await TelecomPack.findAll({
      attributes: [[fn('DISTINCT', col(columnName)), field]]
    });

    res.json(values.map(item => item[field]));
  } catch (error) {
    console.error(`Error fetching distinct values for field '${req.params.field}':`, error);
    res.status(500).json({ error: error.message });
  }
});

// Route to drop the Telecom Pack table
router.delete('/admin/drop-telecom-pack-table', authenticate, async (req, res) => {
  try {
    await TelecomPack.destroy({
      where: {},
      truncate: true
    });
    res.status(204).send();
  } catch (err) {
    console.error('Error dropping Telecom Pack table:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;