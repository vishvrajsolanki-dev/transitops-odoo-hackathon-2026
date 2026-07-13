const express = require('express');
const app = express();

app.use(express.json());

// TASK modules will mount their routes here, e.g.:
app.use('/api/vehicles', require('./modules/vehicles/vehicles.routes'));
app.use('/api/drivers', require('./modules/drivers/drivers.routes'));
app.use('/api/trips', require('./modules/trips/trips.routes'));
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/maintenance', require('./modules/maintenance/maintenance.routes'));
// fuel-expense owns two resource paths (/api/fuel-logs, /api/expenses),
// so it's mounted at the '/api' root rather than a module-named base.
app.use('/api', require('./modules/fuel-expense/fuel-expense.routes'));

module.exports = app;
