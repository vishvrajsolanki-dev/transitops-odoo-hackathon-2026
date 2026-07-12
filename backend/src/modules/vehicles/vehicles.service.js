// backend/src/modules/vehicles/vehicles.service.js
const prisma = require('../../config/db'); // adjust path if your Prisma client singleton lives elsewhere

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

// The single canonical status-transition function the locked vehicleStatus
// Interface Contract requires. Accepts a Prisma transaction client so
// callers (maintenance, and later trip dispatch) include this write inside
// their own transaction instead of firing an unguarded separate update.
async function setVehicleStatus(tx, vehicleId, newStatus) {
  return tx.vehicle.update({
    where: { id: vehicleId },
    data: { status: newStatus },
  });
}

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  setVehicleStatus,
};