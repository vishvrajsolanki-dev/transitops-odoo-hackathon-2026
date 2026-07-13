// backend/src/modules/fuel-expense/fuel-expense.controller.js
// Owns request/response handling only. Business logic lives in fuel-expense.service.js

const service = require('./fuel-expense.service');
const { success, error } = require('../../utils/response');

async function listFuelLogs(req, res) {
  try {
    const logs = await service.listFuelLogs({ vehicleId: req.query.vehicleId });
    return success(res, logs);
  } catch (err) {
    return error(res, 'FUEL_LOG_LIST_FAILED', err.message, 500);
  }
}

async function createFuelLog(req, res) {
  try {
    const { vehicleId, tripId, liters, cost, date } = req.body;
    if (!vehicleId || liters === undefined || cost === undefined || !date) {
      return error(res, 'VALIDATION_ERROR', 'vehicleId, liters, cost, and date are required', 400);
    }
    const log = await service.createFuelLog({
      vehicleId,
      tripId,
      liters,
      cost,
      date,
      createdByUserId: req.user.userId,
    });
    return success(res, log, 201);
  } catch (err) {
    return error(res, 'FUEL_LOG_CREATE_FAILED', err.message, 500);
  }
}

async function listExpenses(req, res) {
  try {
    const expenses = await service.listExpenses({ vehicleId: req.query.vehicleId });
    return success(res, expenses);
  } catch (err) {
    return error(res, 'EXPENSE_LIST_FAILED', err.message, 500);
  }
}

async function createExpense(req, res) {
  try {
    const { vehicleId, category, amount, date, description } = req.body;
    if (!vehicleId || !category || amount === undefined || !date) {
      return error(res, 'VALIDATION_ERROR', 'vehicleId, category, amount, and date are required', 400);
    }
    const expense = await service.createExpense({
      vehicleId,
      category,
      amount,
      date,
      description,
      createdByUserId: req.user.userId,
    });
    return success(res, expense, 201);
  } catch (err) {
    return error(res, 'EXPENSE_CREATE_FAILED', err.message, 500);
  }
}

module.exports = {
  listFuelLogs,
  createFuelLog,
  listExpenses,
  createExpense,
};
