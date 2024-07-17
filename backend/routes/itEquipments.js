const express = require('express');
const router = express.Router();
const ITEquipment = require('../models/ITEquipment');
const ITEquipmentModification = require('../models/ITEquipmentModification');
const User = require('../models/user');
const { authenticate } = require('../middleware/authMiddleware');
const { Op, fn, col } = require('sequelize');

// Helper function to replace null or empty values with default value
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

// In the backend route for fetching all IT equipments
router.get('/it-equipments/all', authenticate, async (req, res) => {
  try {
    const allEquipments = await ITEquipment.findAll();
    const processedEquipments = allEquipments.map(equipment => setDefaultValues(equipment.dataValues));

    // Extract unique values and format them correctly
    const uniqueValues = Object.keys(processedEquipments[0]).reduce((acc, key) => {
      acc[key] = [...new Set(processedEquipments.map(item => item[key]))]
        .filter(value => value !== null && value !== '------')  // Filter out null and default values
        .map(value => ({ label: value, value }));  // Format as { label, value }
      return acc;
    }, {});

    res.json({
      equipments: processedEquipments,
      uniqueValues: uniqueValues,
    });
  } catch (err) {
    console.error('Error fetching all IT equipments:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all IT equipments with unique values
router.get('/it-equipments', authenticate, async (req, res) => {
  try {
    console.log('Fetching all IT equipments...');

    const allEquipments = await ITEquipment.findAll(); // Fetch all equipments

    const processedEquipments = allEquipments.map(equipment => setDefaultValues(equipment.dataValues));

    // Extract unique values and format them correctly
    const uniqueValues = Object.keys(processedEquipments[0]).reduce((acc, key) => {
      acc[key] = [...new Set(processedEquipments.map(item => item[key]))]
        .filter(value => value !== null && value !== '------')  // Filter out null and default values
        .map(value => ({ label: value, value }));  // Format as { label, value }
      return acc;
    }, {});

    console.log('Fetched and processed equipments:', processedEquipments);

    res.json({
      equipments: processedEquipments,
      uniqueValues: uniqueValues,
    });
  } catch (err) {
    console.error('Error fetching IT equipments:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// Create a new IT equipment
router.post('/it-equipments', authenticate, async (req, res) => {
  try {
    const newEquipmentData = setDefaultValues(req.body);
    const newEquipment = await ITEquipment.create(newEquipmentData);
    res.status(201).json(newEquipment);
  } catch (error) {
    console.error('Error adding IT Equipment:', error.message);
    console.error('Error details:', error); // Log the error details for more information
    res.status(500).json({ message: 'Error adding IT Equipment', error: error.message });
  }
});

// Delete an IT equipment
router.delete('/it-equipments/:id', authenticate, async (req, res) => {
  try {
    await ITEquipment.destroy({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting equipment:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update an IT equipment
router.put('/it-equipments/:id', authenticate, async (req, res) => {
  try {
    const equipment = await ITEquipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const updatedData = setDefaultValues(req.body);
    const changes = [];

    for (const key in updatedData) {
      // Check for actual changes and avoid logging unchanged fields
      if (key !== 'createdAt' && key !== 'updatedAt' && equipment[key] !== updatedData[key]) {
        changes.push({
          equipmentId: equipment.id,
          userId: req.user.id,
          field: key,
          oldValue: equipment[key] ? equipment[key].toString() : null,
          newValue: updatedData[key] ? updatedData[key].toString() : null,
          modifiedAt: new Date(),
        });
      }
    }

    if (changes.length > 0) {
      await ITEquipmentModification.bulkCreate(changes);
    }

    const updatedEquipment = await equipment.update(updatedData);
    res.json(updatedEquipment);
  } catch (err) {
    console.error('Error updating equipment:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get IT equipment modification history
router.get('/admin/it-equipment-modifications', authenticate, async (req, res) => {
  try {
    const modifications = await ITEquipmentModification.findAll({
      include: [
        { model: ITEquipment },
        { model: User, attributes: ['fullName', 'email'] }
      ],
      order: [['modifiedAt', 'DESC']],
    });
    res.json(modifications);
  } catch (err) {
    console.error('Error fetching modification history:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Add this route for resetting IT equipment modification history
router.delete('/admin/it-equipment-modifications', authenticate, async (req, res) => {
  try {
    await ITEquipmentModification.destroy({
      where: {},
      truncate: true
    });
    res.status(204).send();
  } catch (err) {
    console.error('Error resetting IT equipment modification history:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// Get unique values
router.get('/unique-values/:field', authenticate, async (req, res) => {
  try {
    const field = req.params.field;
    const values = await ITEquipment.findAll({
      attributes: [[fn('DISTINCT', col(field)), field]]
    });
    res.json(values);
  } catch (error) {
    console.error('Error fetching unique values:', error);
    res.status(500).json({ message: 'Error fetching unique values' });
  }
});

<<<<<<< HEAD
// Route to drop the IT Equipment table
router.delete('/admin/drop-it-equipment-table', authenticate, async (req, res) => {
  try {
    await ITEquipment.destroy({
      where: {},
      truncate: true
    });
    res.status(204).send();
  } catch (err) {
    console.error('Error dropping IT Equipment table:', err.message);
    res.status(500).json({ error: err.message });
  }
});


=======
>>>>>>> d0277b8795c574a1f31b2650c890718540ac5a87
module.exports = router;
