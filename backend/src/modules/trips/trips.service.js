const prisma = require('../../config/db');
const { isDriverEligible } = require('../drivers/drivers.service');

class TripValidationError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

async function createTrip(payload, user) {
  const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = payload;

  if (!source || !destination || !vehicleId || !driverId || cargoWeight == null || plannedDistance == null) {
    throw new TripValidationError(
      'MISSING_FIELDS',
      'source, destination, vehicleId, driverId, cargoWeight, and plannedDistance are required',
      400
    );
  }

  return prisma.$transaction(async (tx) => {
    // Re-fetch inside the transaction — closes the read-then-write race window
    const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      throw new TripValidationError('VEHICLE_NOT_FOUND', 'Vehicle not found', 404);
    }

    const driver = await tx.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      throw new TripValidationError('DRIVER_NOT_FOUND', 'Driver not found', 404);
    }

    // 1. Cargo weight check
    if (Number(cargoWeight) > Number(vehicle.maxLoadCapacity)) {
      throw new TripValidationError(
        'CARGO_EXCEEDS_CAPACITY',
        `Cargo weight (${cargoWeight}) exceeds vehicle's max load capacity (${vehicle.maxLoadCapacity})`,
        400
      );
    }

    // 2. Driver eligibility (license expiry, suspension, or any non-available status)
    const eligibility = await isDriverEligible(driverId);
    if (!eligibility.eligible) {
      const messages = {
        LICENSE_EXPIRED: 'Driver license has expired',
        DRIVER_SUSPENDED: 'Driver is suspended',
        DRIVER_NOT_FOUND: 'Driver not found',
      };
      const message = messages[eligibility.reason]
        || (eligibility.reason?.startsWith('DRIVER_STATUS_')
          ? `Driver is not available (status: ${eligibility.reason.replace('DRIVER_STATUS_', '').toLowerCase()})`
          : 'Driver is not eligible');
      throw new TripValidationError(eligibility.reason, message, 400);
    }

    // 3. Vehicle availability
    if (vehicle.status !== 'available') {
      throw new TripValidationError(
        'VEHICLE_UNAVAILABLE',
        `Vehicle is not available for dispatch (current status: ${vehicle.status})`,
        409
      );
    }


    // 5. Double-booking — vehicle already on an open trip (draft or dispatched)
    const vehicleOpenTrip = await tx.trip.findFirst({
      where: { vehicleId, status: { in: ['draft', 'dispatched'] } },
    });
    if (vehicleOpenTrip) {
      throw new TripValidationError('VEHICLE_DOUBLE_BOOKED', 'Vehicle is already assigned to an open trip', 409);
    }

    // 6. Double-booking — driver already on an open trip
    const driverOpenTrip = await tx.trip.findFirst({
      where: { driverId, status: { in: ['draft', 'dispatched'] } },
    });
    if (driverOpenTrip) {
      throw new TripValidationError('DRIVER_DOUBLE_BOOKED', 'Driver is already assigned to an open trip', 409);
    }

    // All checks passed
    return tx.trip.create({
      data: {
        source,
        destination,
        cargoWeight,
        plannedDistance,
        vehicleId,
        driverId,
        createdByUserId: user.userId,
        status: 'draft',
      },
    });
  });
}

async function listTrips(user, filters = {}) {
  const where = {};

  if (user.role === 'driver') {
    const driver = await prisma.driver.findUnique({ where: { userId: user.userId } });
    if (driver) where.driverId = driver.id;
  }
  if (filters.status) where.status = filters.status;
  if (filters.vehicleId) where.vehicleId = filters.vehicleId;
  if (filters.driverId && user.role !== 'driver') where.driverId = filters.driverId;

  return prisma.trip.findMany({
    where,
    include: { vehicle: true, driver: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getTripById(id, user) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });
  if (!trip) {
    throw new TripValidationError('TRIP_NOT_FOUND', 'Trip not found', 404);
  }
  if (user.role === 'driver') {
    const driver = await prisma.driver.findUnique({ where: { userId: user.userId } });
    if (!driver || trip.driverId !== driver.id) {
      throw new TripValidationError('FORBIDDEN', 'You do not have access to this trip', 403);
    }
  }
  return trip;
}

module.exports = { createTrip, listTrips, getTripById };