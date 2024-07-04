const TelephoneLine = require('../models/TelephoneLine');

exports.getTelephoneLines = async (req, res) => {
  try {
    const telephoneLines = await TelephoneLine.findAll();
    res.json(telephoneLines);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getTelephoneLineById = async (req, res) => {
  try {
    const telephoneLine = await TelephoneLine.findByPk(req.params.id);

    if (!telephoneLine) {
      return res.status(404).json({ msg: 'Telephone Line not found' });
    }

    res.json(telephoneLine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createTelephoneLine = async (req, res) => {
  const { number, type } = req.body;

  try {
    const newTelephoneLine = await TelephoneLine.create({
      number,
      type,
    });

    res.json(newTelephoneLine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateTelephoneLine = async (req, res) => {
  const { number, type } = req.body;

  try {
    let telephoneLine = await TelephoneLine.findByPk(req.params.id);

    if (!telephoneLine) {
      return res.status(404).json({ msg: 'Telephone Line not found' });
    }

    telephoneLine.number = number || telephoneLine.number;
    telephoneLine.type = type || telephoneLine.type;

    await telephoneLine.save();

    res.json(telephoneLine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteTelephoneLine = async (req, res) => {
  try {
    const telephoneLine = await TelephoneLine.findByPk(req.params.id);

    if (!telephoneLine) {
      return res.status(404).json({ msg: 'Telephone Line not found' });
    }

    await telephoneLine.destroy();

    res.json({ msg: 'Telephone Line removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
