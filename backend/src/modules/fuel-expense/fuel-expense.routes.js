// backend/src/modules/fuel-expense/fuel-expense.routes.js
// Owns two resource paths: /api/fuel-logs and /api/expenses.
// Mounted at '/api' root in app.js (not '/api/fuel-expense') so these
// paths stay exactly as the original module spec defines them.

const express = require('express');
const router = express.Router();
const controller = require('./fuel-expense.controller');
const auth = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');

// Driver has 'logFuel' only; Financial Analyst has 'create'. Same route,
// two different permitted action strings — checkPermission accepts an array.
router.get('/fuel-logs', auth, checkPermission('fuel-expense', 'view'), controller.listFuelLogs);
router.post('/fuel-logs', auth, checkPermission('fuel-expense', ['logFuel', 'create']), controller.createFuelLog);

router.get('/expenses', auth, checkPermission('fuel-expense', 'view'), controller.listExpenses);
router.post('/expenses', auth, checkPermission('fuel-expense', 'create'), controller.createExpense);

module.exports = router;
