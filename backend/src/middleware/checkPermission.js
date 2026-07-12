// TASK-001B builds the stub, TASK-003 fills in the real RBAC matrix.
// Signature: checkPermission(module, action) -> middleware
module.exports = function checkPermission(moduleName, action) {
  return function (req, res, next) {
    // STUB — always allows for now. TASK-003 replaces this with the real matrix check.
    next();
  };
};
