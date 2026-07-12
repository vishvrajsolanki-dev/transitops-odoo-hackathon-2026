const {
  success,
  error,
} = require('../../utils/response');
const driversService = require('./drivers.service');

// Maps our service-layer error codes to HTTP status codes. Kept in one place
// so a new error code only needs one line here, not scattered switch statements.
const ERROR_STATUS_MAP = {
  DRIVER_NOT_FOUND: 404,
  EMAIL_TAKEN: 409,
  LICENSE_NUMBER_TAKEN: 409,
  DRIVER_HAS_HISTORY: 409,
};

function statusFor(errorCode) {
  return ERROR_STATUS_MAP[errorCode] || 400;
}

async function createDriver(req, res, next) {
  try {
    const result = await driversService.createDriver(req.body);
    if (!result.success) {
      return error(res, result.error.code, result.error.message, statusFor(result.error.code));
    }
    return success(res, result.data, 201);
  } catch (err) {
    next(err);
  }
}

async function listDrivers(req, res, next) {
  try {
    const { status } = req.query;
    const result = await driversService.listDrivers({ status });
    return success(res, result.data, 200);
  } catch (err) {
    next(err);
  }
}

async function getDriverById(req, res, next) {
  try {
    const result = await driversService.getDriverById(req.params.id);
    if (!result.success) {
      return error(res, result.error.code, result.error.message, statusFor(result.error.code));
    }
    return success(res, result.data, 200);
  } catch (err) {
    next(err);
  }
}

async function updateDriver(req, res, next) {
  try {
    const result = await driversService.updateDriver(req.params.id, req.body);
    if (!result.success) {
      return error(res, result.error.code, result.error.message, statusFor(result.error.code));
    }
    return success(res, result.data, 200);
  } catch (err) {
    next(err);
  }
}

async function updateSafetyScore(req, res, next) {
  try {
    const { newScore, reason } = req.body;
    const changedByUserId = req.user.userId; // set by auth middleware
    const result = await driversService.updateSafetyScore(req.params.id, {
      newScore,
      reason,
      changedByUserId,
    });
    if (!result.success) {
      return error(res, result.error.code, result.error.message, statusFor(result.error.code));
    }
    return success(res, result.data, 200);
  } catch (err) {
    next(err);
  }
}

async function deleteDriver(req, res, next) {
  try {
    const result = await driversService.deleteDriver(req.params.id);
    if (!result.success) {
      return error(res, result.error.code, result.error.message, statusFor(result.error.code));
    }
    return success(res, null, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createDriver,
  listDrivers,
  getDriverById,
  updateDriver,
  updateSafetyScore,
  deleteDriver,
};