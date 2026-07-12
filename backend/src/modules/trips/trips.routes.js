const express = require('express');
const router = express.Router();
const tripsController = require('./trips.controller');
const authenticate = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');

router.use(authenticate);

router.post('/', checkPermission('trips', 'create'), tripsController.createTrip);
router.get('/', checkPermission('trips', 'view'), tripsController.listTrips);
router.get('/:id', checkPermission('trips', 'view'), tripsController.getTripById);

module.exports = router;