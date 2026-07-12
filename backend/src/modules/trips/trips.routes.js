const express = require('express');
const router = express.Router();
const tripsController = require('./trips.controller');
const authenticate = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');

router.use(authenticate);

router.post('/', checkPermission('trip', 'create'), tripsController.createTrip);
router.get('/', checkPermission('trip', 'view'), tripsController.listTrips);
router.get('/:id', checkPermission('trip', 'view'), tripsController.getTripById);

module.exports = router;