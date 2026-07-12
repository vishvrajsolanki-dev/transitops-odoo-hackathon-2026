const express = require('express');
const auth = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');
const controller = require('./drivers.controller');

const router = express.Router();

// Every route requires authentication first — checkPermission reads req.user.role,
// which only exists once auth() has run.
router.use(auth);

router.post('/', checkPermission('drivers', 'create'), controller.createDriver);
router.get('/', checkPermission('drivers', 'view'), controller.listDrivers);
router.get('/:id', checkPermission('drivers', 'view'), controller.getDriverById);
router.put('/:id', checkPermission('drivers', 'update'), controller.updateDriver);
router.patch('/:id/status', checkPermission('drivers', 'updateStatus'), controller.updateDriverStatus);
router.patch('/:id/safety-score', checkPermission('drivers', 'updateSafetyScore'), controller.updateSafetyScore);
router.delete('/:id', checkPermission('drivers', 'delete'), controller.deleteDriver);

module.exports = router;