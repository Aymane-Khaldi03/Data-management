const TelephoneLine = require('../models/TelephoneLine');

const getTelephoneLines = async () => {
  return await TelephoneLine.findAll();
};

const getTelephoneLineById = async (id) => {
  const telephoneLine = await TelephoneLine.findByPk(id);
  if (!telephoneLine) {
    throw new Error('Telephone Line not found');
  }
  return telephoneLine;
};

const createTelephoneLine = async (data) => {
  const { number, type } = data;
  return await TelephoneLine.create({ number, type });
};

const updateTelephoneLine = async (id, data) => {
  const { number, type } = data;
  const telephoneLine = await TelephoneLine.findByPk(id);
  if (!telephoneLine) {
    throw new Error('Telephone Line not found');
  }
  telephoneLine.number = number || telephoneLine.number;
  telephoneLine.type = type || telephoneLine.type;
  await telephoneLine.save();
  return telephoneLine;
};

const deleteTelephoneLine = async (id) => {
  const telephoneLine = await TelephoneLine.findByPk(id);
  if (!telephoneLine) {
    throw new Error('Telephone Line not found');
  }
  await telephoneLine.destroy();
  return { message: 'Telephone Line removed' };
};

module.exports = {
  getTelephoneLines,
  getTelephoneLineById,
  createTelephoneLine,
  updateTelephoneLine,
  deleteTelephoneLine,
};
