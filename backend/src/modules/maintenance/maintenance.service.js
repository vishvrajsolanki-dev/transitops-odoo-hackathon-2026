// Business logic + Prisma queries live here. Controllers call into this file.

const prisma = require('../../config/db');
const vehiclesService = require('../vehicles/vehicles.service');

async function getMaintenanceLogs(filters = {}) {
    const { vehicleId, status } = filters;
    const where = {};
    if (vehicleId) where.vehicleId = vehicleId;
    // status isn't a real column — derive it from closedAt per the actual schema
    if (status === 'active') where.closedAt = null;
    if (status === 'closed') where.closedAt = { not: null };

    return prisma.maintenanceLog.findMany({ where });
}

async function getMaintenanceById(id) {
    return prisma.maintenanceLog.findUnique({ where: { id } });
}

async function createMaintenance({ vehicleId, description, cost, createdByUserId }) {
    return prisma.$transaction(async (tx) => {
        const record = await tx.maintenanceLog.create({
            data: { vehicleId, description, cost, createdByUserId },
        });

        // Single canonical status-flip function — Interface Contract §6
        await vehiclesService.setVehicleStatus(tx, vehicleId, 'in_shop');

        return record;
    });
}

async function closeMaintenance(id) {
    return prisma.$transaction(async (tx) => {
        // Read INSIDE the transaction — reading outside and passing values in
        // reopens the double-close race condition the handout's KNOWN RISK warns about.
        const record = await tx.maintenanceLog.findUnique({ where: { id } });

        if (!record) {
            const err = new Error('Maintenance record not found');
            err.code = 'MAINTENANCE_NOT_FOUND';
            throw err;
        }

        if (record.closedAt !== null) {
            const err = new Error('Maintenance record is already closed');
            err.code = 'MAINTENANCE_ALREADY_CLOSED';
            throw err;
        }

        const closedRecord = await tx.maintenanceLog.update({
            where: { id },
            data: { closedAt: new Date() },
        });

        // Retired-vehicle exception — don't override Retired status
        const vehicle = await tx.vehicle.findUnique({ where: { id: record.vehicleId } });
        if (vehicle.status !== 'retired') {
            await vehiclesService.setVehicleStatus(tx, record.vehicleId, 'available');
        }

        return closedRecord;
    });
}

// Added for TASK-005B (fuel-expense) — sums all maintenance cost for one
// vehicle. fuel-expense.service.js calls this rather than querying
// MaintenanceLog directly (Interface Contract — one domain owns its own
// aggregation). Null sum (no records) resolves to 0, never crashes.
async function getMaintenanceCostForVehicle(vehicleId) {
    const result = await prisma.maintenanceLog.aggregate({
        where: { vehicleId },
        _sum: { cost: true },
    });
    return Number(result._sum.cost || 0);
}

module.exports = {
    getMaintenanceLogs,
    getMaintenanceById,
    createMaintenance,
    closeMaintenance,
    getMaintenanceCostForVehicle,
};
