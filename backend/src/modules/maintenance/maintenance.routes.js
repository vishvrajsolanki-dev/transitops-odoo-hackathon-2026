const express = require('express');
const router = express.Router();
const controller = require('./maintenance.controller');
const auth = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');

router.get('/', auth, checkPermission('maintenance', 'view'), controller.list);
router.get('/:id', auth, checkPermission('maintenance', 'view'), controller.getById);
router.post('/', auth, checkPermission('maintenance', 'manage'), controller.create);
router.patch('/:id/close', auth, checkPermission('maintenance', 'manage'), controller.close);

module.exports = router;