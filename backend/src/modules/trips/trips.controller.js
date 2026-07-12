const tripsService = require('./trips.service');

async function createTrip(req, res) {
  try {
    const trip = await tripsService.createTrip(req.body, req.user);
    return res.status(201).json({ success: true, data: trip });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      error: { code: err.code || 'TRIP_CREATE_FAILED', message: err.message }
    });
  }
}

async function listTrips(req, res) {
  try {
    const trips = await tripsService.listTrips(req.user, req.query);
    return res.status(200).json({ success: true, data: trips });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      error: { code: err.code || 'TRIP_LIST_FAILED', message: err.message }
    });
  }
}

async function getTripById(req, res) {
  try {
    const trip = await tripsService.getTripById(req.params.id, req.user);
    return res.status(200).json({ success: true, data: trip });
  } catch (err) {
    return res.status(err.statusCode || 404).json({
      success: false,
      error: { code: err.code || 'TRIP_NOT_FOUND', message: err.message }
    });
  }
}
async function dispatchTrip(req, res) {
  try {
    const trip = await tripsService.dispatchTrip(req.params.id, req.user);
    return res.status(200).json({ success: true, data: trip });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      error: { code: err.code || 'DISPATCH_FAILED', message: err.message }
    });
  }
}

async function completeTrip(req, res) {
  try {
    const trip = await tripsService.completeTrip(req.params.id, req.body.revenue, req.user);
    return res.status(200).json({ success: true, data: trip });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      error: { code: err.code || 'COMPLETE_FAILED', message: err.message }
    });
  }
}

async function cancelTrip(req, res) {
  try {
    const trip = await tripsService.cancelTrip(req.params.id, req.user);
    return res.status(200).json({ success: true, data: trip });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      error: { code: err.code || 'CANCEL_FAILED', message: err.message }
    });
  }
}

module.exports = { createTrip, listTrips, getTripById, dispatchTrip, completeTrip, cancelTrip };