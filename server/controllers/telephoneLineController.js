const TelephoneLine = require('../models/TelephoneLine');
const TelephoneLineModification = require('../models/TelephoneLineModification'); // Import the model

exports.getTelephoneLines = async (req, res) => {
  try {
    console.log('Fetching all telephone lines...'); // Debugging statement
    const telephoneLines = await TelephoneLine.findAll();
    console.log('Fetched telephone lines:', JSON.stringify(telephoneLines, null, 2)); // Debugging statement
    res.json(telephoneLines);
  } catch (err) {
    console.error('Error fetching Telephone Lines:', err); // Log the actual error
    res.status(500).send({ message: 'Server error', error: err.message });
  }
};

exports.getTelephoneLineById = async (req, res) => {
  try {
    console.log('Fetching telephone line by ID:', req.params.id); // Debugging statement
    const telephoneLine = await TelephoneLine.findByPk(req.params.id);

    if (!telephoneLine) {
      console.log('Telephone line not found'); // Debugging statement
      return res.status(404).json({ msg: 'Telephone Line not found' });
    }

    console.log('Fetched telephone line:', JSON.stringify(telephoneLine, null, 2)); // Debugging statement
    res.json(telephoneLine);
  } catch (err) {
    console.error('Error fetching telephone line by ID:', err.message); // Debugging statement
    res.status(500).send('Server error');
  }
};

exports.createTelephoneLine = async (req, res) => {
  const { numero_de_gsm, full_name, code_entite, direction, fonction, operateur, categorie, poste_GSM } = req.body;

  try {
    console.log('Creating new telephone line with data:', req.body); // Debugging statement
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

    console.log('Created new telephone line:', JSON.stringify(newTelephoneLine, null, 2)); // Debugging statement
    res.json(newTelephoneLine);
  } catch (err) {
    console.error('Error creating telephone line:', err.message); // Debugging statement
    res.status(500).send('Server error');
  }
};

exports.updateTelephoneLine = async (req, res) => {
  const { numero_de_gsm, full_name, code_entite, direction, fonction, operateur, categorie, poste_GSM } = req.body;

  try {
    console.log('Updating telephone line with ID:', req.params.id); // Debugging statement
    let telephoneLine = await TelephoneLine.findByPk(req.params.id);

    if (!telephoneLine) {
      console.log('Telephone line not found for update'); // Debugging statement
      return res.status(404).json({ msg: 'Telephone Line not found' });
    }

    const oldData = {
      numero_de_gsm: telephoneLine.numero_de_gsm,
      full_name: telephoneLine.full_name,
      code_entite: telephoneLine.code_entite,
      direction: telephoneLine.direction,
      fonction: telephoneLine.fonction,
      operateur: telephoneLine.operateur,
      categorie: telephoneLine.categorie,
      poste_GSM: telephoneLine.poste_GSM
    };

    telephoneLine.numero_de_gsm = numero_de_gsm || telephoneLine.numero_de_gsm;
    telephoneLine.full_name = full_name || telephoneLine.full_name;
    telephoneLine.code_entite = code_entite || telephoneLine.code_entite;
    telephoneLine.direction = direction || telephoneLine.direction;
    telephoneLine.fonction = fonction || telephoneLine.fonction;
    telephoneLine.operateur = operateur || telephoneLine.operateur;
    telephoneLine.categorie = categorie || telephoneLine.categorie;
    telephoneLine.poste_GSM = poste_GSM || telephoneLine.poste_GSM;

    await telephoneLine.save();

    console.log('Updated telephone line:', JSON.stringify(telephoneLine, null, 2)); // Debugging statement

    // Log the modification
    const modifications = [];
    Object.keys(oldData).forEach(key => {
      if (oldData[key] !== telephoneLine[key]) {
        modifications.push({
          telephoneLineId: telephoneLine.id,
          userId: req.user.id,
          field: key,
          oldValue: oldData[key],
          newValue: telephoneLine[key],
          modifiedAt: new Date()
        });
      }
    });

    if (modifications.length > 0) {
      await TelephoneLineModification.bulkCreate(modifications);
      console.log('Created Telephone Line Modifications:', JSON.stringify(modifications, null, 2)); // Debugging statement
    } else {
      console.log('No changes detected to log modifications.'); // Debugging statement
    }

    res.json(telephoneLine);
  } catch (err) {
    console.error('Error updating telephone line:', err.message); // Debugging statement
    res.status(500).send('Server error');
  }
};

exports.deleteTelephoneLine = async (req, res) => {
  try {
    console.log('Deleting telephone line with ID:', req.params.id); // Debugging statement
    const telephoneLine = await TelephoneLine.findByPk(req.params.id);

    if (!telephoneLine) {
      console.log('Telephone line not found for deletion'); // Debugging statement
      return res.status(404).json({ msg: 'Telephone Line not found' });
    }

    await telephoneLine.destroy();

    console.log('Deleted telephone line'); // Debugging statement
    res.json({ msg: 'Telephone Line removed' });
  } catch (err) {
    console.error('Error deleting telephone line:', err.message); // Debugging statement
    res.status(500).send('Server error');
  }
};
