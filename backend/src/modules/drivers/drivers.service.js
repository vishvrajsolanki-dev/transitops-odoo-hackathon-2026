/**
 * Lists drivers, optionally filtered by status.
 * Query param naming (?status=) — flag with TASK-002A before merge per CONFLICT WATCH.
 */
async function listDrivers(filters = {}) {
    const { status } = filters;

    const drivers = await prisma.driver.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: drivers };
}

async function getDriverById(id) {
    const driver = await prisma.driver.findUnique({ where: { id } });

    if (!driver) {
        return {
            success: false,
            error: { code: 'DRIVER_NOT_FOUND', message: 'No driver found with that id.' },
        };
    }

    return { success: true, data: driver };
}

/**
 * Full profile update — explicit field whitelist, never a spread of req.body.
 * safetyScore and status are deliberately excluded: they have their own
 * dedicated endpoints (PATCH /:id/safety-score, PATCH /:id/status) so a
 * spread pattern here can't smuggle either field through.
 */
async function updateDriver(id, payload) {
    const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber } = payload;

    try {
        const driver = await prisma.driver.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(licenseNumber !== undefined && { licenseNumber }),
                ...(licenseCategory !== undefined && { licenseCategory }),
                ...(licenseExpiry !== undefined && { licenseExpiry: new Date(licenseExpiry) }),
                ...(contactNumber !== undefined && { contactNumber }),
            },
        });

        return { success: true, data: driver };
    } catch (err) {
        if (err.code === 'P2002') {
            return {
                success: false,
                error: { code: 'LICENSE_NUMBER_TAKEN', message: 'This license number is already in use.' },
            };
        }
        if (err.code === 'P2025') {
            return {
                success: false,
                error: { code: 'DRIVER_NOT_FOUND', message: 'No driver found with that id.' },
            };
        }
        throw err;
    }
}

/**
 * Deletes only the Driver row. The linked User account is left in place —
 * deliberate: login/history isn't wiped, just the driver profile.
 */
async function deleteDriver(id) {
    try {
        await prisma.driver.delete({ where: { id } });
        return { success: true, data: null };
    } catch (err) {
        if (err.code === 'P2025') {
            return {
                success: false,
                error: { code: 'DRIVER_NOT_FOUND', message: 'No driver found with that id.' },
            };
        }
        throw err;
    }
}

module.exports = { createDriver, listDrivers, getDriverById, updateDriver, deleteDriver };