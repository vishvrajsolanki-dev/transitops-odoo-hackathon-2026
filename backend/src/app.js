const express = require('express');
const app = express();

app.use(express.json());

// TASK modules will mount their routes here, e.g.:
app.use('/api/vehicles', require('./modules/vehicles/vehicles.routes'));
// app.use('/api/drivers', require('./modules/drivers/drivers.routes'));
app.use('/api/auth', require('./modules/auth/auth.routes'));

module.exports = app;
