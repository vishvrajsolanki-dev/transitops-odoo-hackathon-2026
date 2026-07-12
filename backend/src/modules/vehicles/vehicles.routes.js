// backend/src/modules/vehicles/vehicles.routes.js
const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');
const controller = require('./vehicles.controller');

router.get('/', auth, checkPermission('vehicles', 'view'), controller.listVehicles);
router.get('/:id', auth, checkPermission('vehicles', 'view'), controller.getVehicle);
router.post('/', auth, checkPermission('vehicles', 'manage'), controller.createVehicle);
router.put('/:id', auth, checkPermission('vehicles', 'manage'), controller.updateVehicle);
router.delete('/:id', auth, checkPermission('vehicles', 'manage'), controller.deleteVehicle);

module.exports = router;