// TASK-001B: verifies JWT, attaches req.user = { userId, role }
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { error } = require('../utils/response');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return error(res, 'NO_TOKEN', 'Authorization token missing', 401);
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Only expose what the contract defines — never pass the raw payload through.
    req.user = { userId: payload.userId, role: payload.role };
    return next();
  } catch (err) {
    return error(res, 'INVALID_TOKEN', 'Token is invalid or expired', 401);
  }
};
