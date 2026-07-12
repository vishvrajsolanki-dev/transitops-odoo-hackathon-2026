// backend/src/modules/vehicles/vehicles.controller.js
const vehiclesService = require('./vehicles.service');

function handlePrismaError(err, res) {
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_REGISTRATION', message: 'A vehicle with this registration number already exists.' },
    });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: { code: 'VEHICLE_NOT_FOUND', message: 'No vehicle found with this id.' },
    });
  }
  console.error(err);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
  });
}

async function listVehicles(req, res) {
  try {
    const { type, status, region } = req.query;
    const vehicles = await vehiclesService.getVehicles({ type, status, region });
    res.json({ success: true, data: vehicles });
  } catch (err) {
    handlePrismaError(err, res);
  }
}

async function getVehicle(req, res) {
  try {
    const vehicle = await vehiclesService.getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: { code: 'VEHICLE_NOT_FOUND', message: 'No vehicle found with this id.' },
      });
    }
    res.json({ success: true, data: vehicle });
  } catch (err) {
    handlePrismaError(err, res);
  }
}

const REQUIRED_FIELDS = [
  'registrationNumber',
  'model',
  'type',
  'region',
  'maxLoadCapacity',
  'odometer',
  'acquisitionCost',
];

async function createVehicle(req, res) {
  const missing = REQUIRED_FIELDS.filter((field) => req.body[field] === undefined || req.body[field] === null);
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: `Missing required field(s): ${missing.join(', ')}` },
    });
  }

  try {
    const vehicle = await vehiclesService.createVehicle(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    handlePrismaError(err, res);
  }
}

async function updateVehicle(req, res) {
  try {
    const vehicle = await vehiclesService.updateVehicle(req.params.id, req.body);
    res.json({ success: true, data: vehicle });
  } catch (err) {
    handlePrismaError(err, res);
  }
}

async function deleteVehicle(req, res) {
  try {
    await vehiclesService.deleteVehicle(req.params.id);
    res.status(200).json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    handlePrismaError(err, res);
  }
}

module.exports = {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};