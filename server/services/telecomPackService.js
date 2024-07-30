const TelecomPack = require('../models/TelecomPack');

const getTelecomPacks = async () => {
  return await TelecomPack.findAll();
};

const getTelecomPackById = async (id) => {
  const telecomPack = await TelecomPack.findByPk(id);
  if (!telecomPack) {
    throw new Error('Telecom Pack not found');
  }
  return telecomPack;
};

const createTelecomPack = async (data) => {
  const { name, description } = data;
  return await TelecomPack.create({ name, description });
};

const updateTelecomPack = async (id, data) => {
  const { name, description } = data;
  const telecomPack = await TelecomPack.findByPk(id);
  if (!telecomPack) {
    throw new Error('Telecom Pack not found');
  }
  telecomPack.name = name || telecomPack.name;
  telecomPack.description = description || telecomPack.description;
  await telecomPack.save();
  return telecomPack;
};

const deleteTelecomPack = async (id) => {
  const telecomPack = await TelecomPack.findByPk(id);
  if (!telecomPack) {
    throw new Error('Telecom Pack not found');
  }
  await telecomPack.destroy();
  return { message: 'Telecom Pack removed' };
};

module.exports = {
  getTelecomPacks,
  getTelecomPackById,
  createTelecomPack,
  updateTelecomPack,
  deleteTelecomPack,
};
