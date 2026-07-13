// backend/src/modules/fuel-expense/fuel-expense.service.js
// Business logic + Prisma queries live here. Controller calls into this file.

const prisma = require('../../config/db');
const maintenanceService = require('../maintenance/maintenance.service');

async function createFuelLog({ vehicleId, tripId, liters, cost, date, createdByUserId }) {
  return prisma.fuelLog.create({
    data: {
      vehicleId,
      tripId: tripId || null,
      liters,
      cost,
      date: new Date(date),
      createdByUserId,
    },
  });
}

async function listFuelLogs(filters = {}) {
  const { vehicleId } = filters;
  const where = {};
  if (vehicleId) where.vehicleId = vehicleId;
  return prisma.fuelLog.findMany({ where, orderBy: { date: 'desc' } });
}

async function createExpense({ vehicleId, category, amount, date, description, createdByUserId }) {
  return prisma.expense.create({
    data: {
      vehicleId,
      category,
      amount,
      date: new Date(date),
      description: description || null,
      createdByUserId,
    },
  });
}

async function listExpenses(filters = {}) {
  const { vehicleId } = filters;
  const where = {};
  if (vehicleId) where.vehicleId = vehicleId;
  return prisma.expense.findMany({ where, orderBy: { date: 'desc' } });
}

// Locked contract: sums fuel costs + expense amounts + maintenance costs
// for one vehicle. Calls INTO maintenance.service.js rather than querying
// MaintenanceLog directly here (Interface Contract — don't duplicate/re-store
// another domain's data). Missing/null sources always resolve to 0, never throw.
async function getTotalOperationalCost(vehicleId) {
  const [fuelAgg, expenseAgg, maintenanceCost] = await Promise.all([
    prisma.fuelLog.aggregate({ where: { vehicleId }, _sum: { cost: true } }),
    prisma.expense.aggregate({ where: { vehicleId }, _sum: { amount: true } }),
    maintenanceService.getMaintenanceCostForVehicle(vehicleId),
  ]);

  const fuelCost = Number(fuelAgg._sum.cost || 0);
  const expenseCost = Number(expenseAgg._sum.amount || 0);
  const maintCost = Number(maintenanceCost || 0);

  return fuelCost + expenseCost + maintCost;
}

module.exports = {
  createFuelLog,
  listFuelLogs,
  createExpense,
  listExpenses,
  getTotalOperationalCost,
};
