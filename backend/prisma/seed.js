// backend/prisma/seed.js
// Skeleton only — TASK-001A deliverable. Real seed data (multiple vehicles,
// drivers, a full trip lifecycle for demo rehearsal) belongs to TASK-010.
// Run with: npm run prisma:seed  (package.json has no "prisma.seed" config
// block, so `npx prisma db seed` won't resolve this file — use the npm script)

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const fleetManager = await prisma.user.create({
    data: {
      email: "fleet.manager@transitops.dev",
      passwordHash: "REPLACE_WITH_BCRYPT_HASH",
      name: "Fleet Manager",
      role: "fleet_manager",
    },
  });

  const driverUser = await prisma.user.create({
    data: {
      email: "driver@transitops.dev",
      passwordHash: "REPLACE_WITH_BCRYPT_HASH",
      name: "Driver Account",
      role: "driver",
    },
  });

  await prisma.user.create({
    data: {
      email: "safety.officer@transitops.dev",
      passwordHash: "REPLACE_WITH_BCRYPT_HASH",
      name: "Safety Officer",
      role: "safety_officer",
    },
  });

  await prisma.user.create({
    data: {
      email: "financial.analyst@transitops.dev",
      passwordHash: "REPLACE_WITH_BCRYPT_HASH",
      name: "Financial Analyst",
      role: "financial_analyst",
    },
  });

  const driver = await prisma.driver.create({
    data: {
      userId: driverUser.id,
      name: "Alex",
      licenseNumber: "DL-0001",
      licenseCategory: "LMV",
      licenseExpiry: new Date("2027-01-01"),
      contactNumber: "+91-0000000000",
      safetyScore: 100,
      status: "available",
    },
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      registrationNumber: "VAN-05",
      model: "Van-05",
      type: "Van",
      region: "West",
      maxLoadCapacity: 500,
      odometer: 0,
      acquisitionCost: 1200000,
      status: "available",
    },
  });

  console.log("Seed skeleton complete:", {
    fleetManager: fleetManager.id,
    driver: driver.id,
    vehicle: vehicle.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
