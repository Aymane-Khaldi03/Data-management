const TelecomPack = require('../models/TelecomPack');

exports.getAllTelecomPacks = async (req, res) => {
  try {
    const telecomPacks = await TelecomPack.findAll({
      attributes: { exclude: ['createdat', 'updatedat'] } // Exclude fields here
    });
    res.json(telecomPacks);
  } catch (error) {
    console.error('Error fetching Telecom Packs:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
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

exports.createTelecomPack = async (req, res) => {
  try {
    const telecomPack = await TelecomPack.create(req.body);
    res.status(201).json(telecomPack);
  } catch (error) {
    console.error('Error creating Telecom Pack:', error);
    res.status(500).json({ message: 'Error creating Telecom Pack', error: error.message });
  }
};

exports.updateTelecomPack = async (req, res) => {
  try {
    const telecomPack = await TelecomPack.findByPk(req.params.id);
    if (telecomPack) {
      await telecomPack.update(req.body);
      res.json(telecomPack);
    } else {
      res.status(404).json({ message: 'Telecom Pack not found' });
    }
  } catch (error) {
    console.error('Error updating Telecom Pack:', error);
    res.status(500).json({ message: 'Error updating Telecom Pack', error: error.message });
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

