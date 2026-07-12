// TASK-001B: verifies JWT, attaches req.user = { userId, role }
module.exports = function auth(req, res, next) {
  // TODO: verify JWT from Authorization header
  next();
};
