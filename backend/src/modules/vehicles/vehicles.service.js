// backend/src/modules/vehicles/vehicles.service.js
const prisma = require('../../config/db'); // adjust path if your singleton lives elsewhere

async function getVehicles(filters = {}) {
  const { type, status, region } = filters;
  const where = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (region) where.region = region;

  return prisma.vehicle.findMany({ where });
}

async function getVehicleById(id) {
  return prisma.vehicle.findUnique({ where: { id } });
}

async function createVehicle(data) {
  return prisma.vehicle.create({ data });
}

async function updateVehicle(id, data) {
  return prisma.vehicle.update({ where: { id }, data });
}

async function deleteVehicle(id) {
  return prisma.vehicle.delete({ where: { id } });
}

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};