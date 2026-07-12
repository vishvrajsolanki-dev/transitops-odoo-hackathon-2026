const prisma = require('../../config/db');
const { hashPassword } = require('../auth/auth.service');

/**
 * Creates a User + Driver together, atomically.
 * Safety Officer submits one combined form; role is server-controlled, never client-supplied.
 */
async function createDriver(payload) {
    const {
        email,
        password,
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiry,
        contactNumber,
    } = payload;

    const passwordHash = await hashPassword(password);

    try {
        const driver = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    name, // Driver's name doubles as the account holder's name — same person, one identity
                    role: 'driver', // hardcoded server-side — never trust payload.role
                },
            });

            const newDriver = await tx.driver.create({
                data: {
                    userId: user.id,
                    name,
                    licenseNumber,
                    licenseCategory,
                    licenseExpiry: new Date(licenseExpiry),
                    contactNumber,
                    // safetyScore defaults to 100, status defaults to 'available' — schema handles both
                },
            });

            return newDriver;
        });

        return { success: true, data: driver };
    } catch (err) {
        // P2002 = Prisma's unique-constraint violation code.
        // err.meta.target tells us WHICH field collided — email or licenseNumber both hit this path.
        if (err.code === 'P2002') {
            const field = err.meta?.target?.[0];
            if (field === 'email') {
                return {
                    success: false,
                    error: { code: 'EMAIL_TAKEN', message: 'This email is already registered.' },
                };
            }
            if (field === 'licenseNumber') {
                return {
                    success: false,
                    error: { code: 'LICENSE_NUMBER_TAKEN', message: 'This license number is already in use.' },
                };
            }
        }
        // Anything else is unexpected — don't swallow it, let it surface as a 500
        throw err;
    }
}

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

/**
 * Pure eligibility logic — no DB access, takes an already-fetched driver.
 * Split out specifically so it's testable without a live database connection.
 * Returns { eligible, reason } — reason is null only when eligible is true.
 */
function evaluateDriverEligibility(driver) {
    if (driver.status === 'suspended') {
        return { eligible: false, reason: 'DRIVER_SUSPENDED' };
    }

    if (driver.licenseExpiry < new Date()) {
        return { eligible: false, reason: 'LICENSE_EXPIRED' };
    }

    if (driver.status !== 'available') {
        // Catches on_trip / off_duty — anything that isn't explicitly 'available'
        return { eligible: false, reason: `DRIVER_STATUS_${driver.status.toUpperCase()}` };
    }

    return { eligible: true, reason: null };
}

/**
 * Single source of truth for driver-side dispatch eligibility.
 * TASK-004 calls this rather than re-deriving the same checks.
 * Thin DB-fetch wrapper around evaluateDriverEligibility() — the fetch and
 * the logic are deliberately separate so the logic can be unit tested alone.
 */
async function isDriverEligible(driverId) {
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });

    if (!driver) {
        return { eligible: false, reason: 'DRIVER_NOT_FOUND' };
    }

    return evaluateDriverEligibility(driver);
}

/**
 * Safety Officer's manual score edit. Never a silent overwrite — every change
 * writes an audit row to SafetyScoreLog inside the same transaction as the
 * score update, so the two can never drift apart (one succeeds, other fails).
 */
async function updateSafetyScore(driverId, { newScore, reason, changedByUserId }) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const driver = await tx.driver.findUnique({ where: { id: driverId } });

            if (!driver) {
                throw { code: 'DRIVER_NOT_FOUND' };
            }

            const oldScore = driver.safetyScore;

            const updatedDriver = await tx.driver.update({
                where: { id: driverId },
                data: { safetyScore: newScore },
            });

            await tx.safetyScoreLog.create({
                data: {
                    driverId,
                    oldScore,
                    newScore,
                    reason,
                    changedByUserId,
                },
            });

            return updatedDriver;
        });

        return { success: true, data: result };
    } catch (err) {
        if (err.code === 'DRIVER_NOT_FOUND') {
            return {
                success: false,
                error: { code: 'DRIVER_NOT_FOUND', message: 'No driver found with that id.' },
            };
        }
        throw err;
    }
}

module.exports = {
    createDriver,
    listDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    isDriverEligible,
    evaluateDriverEligibility,
    updateSafetyScore,
};