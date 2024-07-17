const ITEquipment = require('../models/ITEquipment');

const getITEquipments = async () => {
  return await ITEquipment.findAll();
};

const getITEquipmentById = async (id) => {
  const itEquipment = await ITEquipment.findByPk(id);
  if (!itEquipment) {
    throw new Error('IT Equipment not found');
  }
  return itEquipment;
};

const createITEquipment = async (data) => {
  const { name, model, warranty } = data;
  return await ITEquipment.create({ name, model, warranty });
};

const updateITEquipment = async (id, data) => {
  const { name, model, warranty } = data;
  const itEquipment = await ITEquipment.findByPk(id);
  if (!itEquipment) {
    throw new Error('IT Equipment not found');
  }
  itEquipment.name = name || itEquipment.name;
  itEquipment.model = model || itEquipment.model;
  itEquipment.warranty = warranty || itEquipment.warranty;
  await itEquipment.save();
  return itEquipment;
};

const deleteITEquipment = async (id) => {
  const itEquipment = await ITEquipment.findByPk(id);
  if (!itEquipment) {
    throw new Error('IT Equipment not found');
  }
  await itEquipment.destroy();
  return { message: 'IT Equipment removed' };
};

module.exports = {
  getITEquipments,
  getITEquipmentById,
  createITEquipment,
  updateITEquipment,
  deleteITEquipment,
};