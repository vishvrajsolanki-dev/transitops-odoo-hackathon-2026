const { test } = require('node:test');
const assert = require('node:assert/strict');
const { evaluateDriverEligibility } = require('./drivers.service');

function makeDriver(overrides = {}) {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    return {
        id: 'test-driver-id',
        status: 'available',
        licenseExpiry: oneYearFromNow,
        ...overrides,
    };
}

test('expired license -> not eligible, reason LICENSE_EXPIRED', () => {
    const expired = new Date();
    expired.setDate(expired.getDate() - 1);

    const driver = makeDriver({ licenseExpiry: expired, status: 'available' });
    const result = evaluateDriverEligibility(driver);

    assert.equal(result.eligible, false);
    assert.equal(result.reason, 'LICENSE_EXPIRED');
});

test('suspended status -> not eligible, reason DRIVER_SUSPENDED', () => {
    const driver = makeDriver({ status: 'suspended' });
    const result = evaluateDriverEligibility(driver);

    assert.equal(result.eligible, false);
    assert.equal(result.reason, 'DRIVER_SUSPENDED');
});

test('both clear (valid license, available status) -> eligible, reason null', () => {
    const driver = makeDriver({ status: 'available' });
    const result = evaluateDriverEligibility(driver);

    assert.equal(result.eligible, true);
    assert.equal(result.reason, null);
});

test('on_trip status (neither expired nor suspended) -> not eligible, reason DRIVER_STATUS_ON_TRIP', () => {
    const driver = makeDriver({ status: 'on_trip' });
    const result = evaluateDriverEligibility(driver);

    assert.equal(result.eligible, false);
    assert.equal(result.reason, 'DRIVER_STATUS_ON_TRIP');
});

test('suspended takes priority over expired license when both are true', () => {
    const expired = new Date();
    expired.setDate(expired.getDate() - 1);

    const driver = makeDriver({ status: 'suspended', licenseExpiry: expired });
    const result = evaluateDriverEligibility(driver);

    assert.equal(result.eligible, false);
    assert.equal(result.reason, 'DRIVER_SUSPENDED');
});