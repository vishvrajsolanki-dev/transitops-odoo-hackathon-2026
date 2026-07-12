// backend/src/modules/vehicles/vehicles.test.js
const request = require('supertest');
const app = require('../../app');
const prisma = require('../../config/db');

describe('POST /api/vehicles - duplicate registration', () => {
  const testRegistrationNumber = `TEST-DUP-${Date.now()}`;
  let createdVehicleId;

  const vehiclePayload = {
    registrationNumber: testRegistrationNumber,
    model: 'Test Model',
    type: 'Van',
    region: 'West',
    maxLoadCapacity: 500,
    odometer: 0,
    acquisitionCost: 1000000,
  };

  afterAll(async () => {
    if (createdVehicleId) {
      await prisma.vehicle.delete({ where: { id: createdVehicleId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('creates a vehicle successfully the first time', async () => {
    const res = await request(app).post('/api/vehicles').send(vehiclePayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdVehicleId = res.body.data.id;
  });

  it('rejects a duplicate registration number with 409', async () => {
    const res = await request(app).post('/api/vehicles').send(vehiclePayload);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DUPLICATE_REGISTRATION');
  });
});