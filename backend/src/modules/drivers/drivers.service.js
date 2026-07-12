// TASK: drivers service
// Business logic + Prisma queries live here. Controllers call into this file.

const prisma = require('../../config/db');

async function isDriverEligible(driverId) {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });

  if (!driver) {
    return { eligible: false, reason: 'DRIVER_NOT_FOUND' };
  }
  if (driver.status === 'suspended') {
    return { eligible: false, reason: 'DRIVER_SUSPENDED' };
  }
  if (driver.licenseExpiry < new Date()) {
    return { eligible: false, reason: 'LICENSE_EXPIRED' };
  }

  return { eligible: true, reason: null };
}

module.exports = {
  isDriverEligible,
};