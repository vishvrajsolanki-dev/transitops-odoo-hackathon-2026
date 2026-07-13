// backend/src/middleware/checkPermission.js

const PERMISSIONS = {
  fleet_manager: {
    vehicles: ['view', 'manage'],
    drivers: ['view'],                 // status-only route doesn't exist yet — see OPEN ISSUE
    trips: ['view', 'dispatch', 'cancel'],   // provisional — trips.routes.js not reviewed yet
    maintenance: ['view', 'manage'],               // provisional — maintenance.routes.js not reviewed yet
    'fuel-expense': ['view'],
    reports: ['view'],                          // provisional
    dashboard: ['view'],                          // provisional
  },
  driver: {
    vehicles: ['view'],
    drivers: ['view'],
    trips: ['view', 'create'],
    trips: ['view', 'create', 'complete'],
    maintenance: [],
    'fuel-expense': ['logFuel'],
    reports: [],
    dashboard: ['view'],
  },
  safety_officer: {
    vehicles: ['view'],
    drivers: ['create', 'view', 'update', 'delete', 'updateSafetyScore'],
    trips: ['view'],
    maintenance: ['view'],
    'fuel-expense': [],
    reports: ['view'],
    dashboard: ['view'],
  },
  financial_analyst: {
    vehicles: ['view'],
    drivers: ['view'],
    trips: ['view'],
    maintenance: ['view'],
    'fuel-expense': ['view', 'create', 'update', 'delete'],
    reports: ['view', 'create', 'update', 'delete'],
    dashboard: ['view'],
  },
};

const OWN_RECORD_SCOPES = {
  driver: {
    drivers: true,
    trips: true,
  },
};

// action can be a single string (existing behavior, unaffected) or an array
// of acceptable action strings (new — needed when two roles use different
// permission names on the same route, e.g. Driver 'logFuel' vs Financial
// Analyst 'create' both POSTing to /api/fuel-logs).
function checkPermission(module, action) {
  return (req, res, next) => {
    const role = req.user.role;

    const allowedActions = PERMISSIONS[role]?.[module] || [];
    const requiredActions = Array.isArray(action) ? action : [action];
    const hasPermission = requiredActions.some((a) => allowedActions.includes(a));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: `Role '${role}' cannot perform '${requiredActions.join("' or '")}' on '${module}'`,
        },
      });
    }

    if (OWN_RECORD_SCOPES[role]?.[module]) {
      req.scopeToOwnRecord = true;
    }

    next();
  };
}

module.exports = checkPermission;
module.exports.PERMISSIONS = PERMISSIONS;
