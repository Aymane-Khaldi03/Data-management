const TelephoneLine = require('../models/TelephoneLine');


exports.getTelephoneLines = async (req, res) => {
  try {
    const telephoneLines = await TelephoneLine.findAll();
    res.json(telephoneLines);
  } catch (err) {
    console.error('Error fetching Telephone Lines:', err); // Log the actual error
    res.status(500).send({ message: 'Server error', error: err.message });
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
  const { numero_de_gsm, full_name, code_entite, direction, fonction, operateur, categorie, poste_GSM } = req.body;

  try {
    const newTelephoneLine = await TelephoneLine.create({
      numero_de_gsm,
      full_name,
      code_entite,
      direction,
      fonction,
      operateur,
      categorie,
      poste_GSM,
    });

    res.json(newTelephoneLine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateTelephoneLine = async (req, res) => {
  const { numero_de_gsm, full_name, code_entite, direction, fonction, operateur, categorie, poste_GSM } = req.body;

  try {
    let telephoneLine = await TelephoneLine.findByPk(req.params.id);

    if (!telephoneLine) {
      return res.status(404).json({ msg: 'Telephone Line not found' });
    }

    telephoneLine.numero_de_gsm = numero_de_gsm || telephoneLine.numero_de_gsm;
    telephoneLine.full_name = full_name || telephoneLine.full_name;
    telephoneLine.code_entite = code_entite || telephoneLine.code_entite;
    telephoneLine.direction = direction || telephoneLine.direction;
    telephoneLine.fonction = fonction || telephoneLine.fonction;
    telephoneLine.operateur = operateur || telephoneLine.operateur;
    telephoneLine.categorie = categorie || telephoneLine.categorie;
    telephoneLine.poste_GSM = poste_GSM || telephoneLine.poste_GSM;

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
<<<<<<< HEAD


=======
>>>>>>> d0277b8795c574a1f31b2650c890718540ac5a87
