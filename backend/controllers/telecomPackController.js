const TelecomPack = require('../models/TelecomPack');

exports.getAllTelecomPacks = async (req, res) => {
  try {
    const telecomPacks = await TelecomPack.findAll({
      attributes: { exclude: ['createdat', 'updatedat', 'produit'] } // Exclude 'produit'
    });
    res.json(telecomPacks);
  } catch (error) {
    console.error('Error fetching Telecom Packs:', error.stack);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.createTelecomPack = async (req, res) => {
  try {
    const { produit, ...rest } = req.body; // Exclude produit
    const telecomPackData = { ...rest }; // Include remaining fields

    const telecomPack = await TelecomPack.create(telecomPackData);
    res.status(201).json(telecomPack);
  } catch (error) {
    console.error('Error creating Telecom Pack:', error);
    res.status(500).json({ message: 'Error creating Telecom Pack', error: error.message });
  }
};

exports.updateTelecomPack = async (req, res) => {
  try {
    const telecomPack = await TelecomPack.findByPk(req.params.id);
    if (!telecomPack) {
      console.error(`Telecom Pack with ID ${req.params.id} not found`);
      return res.status(404).json({ error: 'Telecom Pack not found' });
    }

    const { produit, ...updatedData } = req.body; // Remove produit
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
};

exports.deleteTelecomPack = async (req, res) => {
  try {
    const telecomPack = await TelecomPack.findByPk(req.params.id);
    if (telecomPack) {
      await telecomPack.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Telecom Pack not found' });
    }
  } catch (error) {
    console.error('Error deleting Telecom Pack:', error);
    res.status(500).json({ message: 'Error deleting Telecom Pack', error: error.message });
  }
};

exports.getTelecomPackById = async (req, res) => {
  try {
    const telecomPack = await TelecomPack.findByPk(req.params.id);
    if (telecomPack) {
      res.json(telecomPack);
    } else {
      res.status(404).json({ message: 'Telecom Pack not found' });
    }
  } catch (error) {
    console.error('Error fetching Telecom Pack by ID:', error);
    res.status(500).json({ message: 'Error fetching Telecom Pack by ID', error: error.message });
  }
};
