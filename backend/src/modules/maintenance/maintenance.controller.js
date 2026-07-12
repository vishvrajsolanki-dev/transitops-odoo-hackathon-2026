// Owns request/response handling only. Business logic lives in maintenance.service.js
// Always return through utils/response.js (success/error envelope) — per project README.

const maintenanceService = require('./maintenance.service');
const response = require('../../utils/response'); // ASSUMED path/shape — confirm against real file

async function list(req, res) {
  try {
    const { vehicleId, status } = req.query;
    const records = await maintenanceService.getMaintenanceLogs({ vehicleId, status });
    return response.success(res, records);
  } catch (err) {
    return response.error(res, err.message, 400);
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const record = await maintenanceService.getMaintenanceById(id);
    if (!record) {
      return response.error(res, 'Maintenance record not found', 404);
    }
    return response.success(res, record);
  } catch (err) {
    return response.error(res, err.message, 400);
  }
}

async function create(req, res) {
  try {
    const { vehicleId, description, cost } = req.body;
    const createdByUserId = req.user.userId; // per auth.js: req.user = { userId, role }

    const record = await maintenanceService.createMaintenance({
      vehicleId,
      description,
      cost,
      createdByUserId,
    });

    return response.success(res, record, 201);
  } catch (err) {
    return response.error(res, err.message, 400);
  }
}

async function close(req, res) {
  try {
    const { id } = req.params;
    const record = await maintenanceService.closeMaintenance(id);
    return response.success(res, record);
  } catch (err) {
    const statusCode = ['MAINTENANCE_NOT_FOUND', 'MAINTENANCE_ALREADY_CLOSED'].includes(err.code)
      ? 409
      : 400;
    return response.error(res, err.message, statusCode);
  }
}

module.exports = {
  list,
  getById,
  create,
  close,
};