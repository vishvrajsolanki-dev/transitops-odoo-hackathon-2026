// TASK: auth controller
// Owns request/response handling only. Business logic goes in auth.service.js
// Always return through utils/response.js (success/error envelope) — see project README.
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/env');
const { success, error } = require('../../utils/response');
const authService = require('./auth.service');

const JWT_EXPIRES_IN = '8h'; // matches the hackathon window; revisit if this outlives the demo

function issueToken(user) {
  // Payload shape is a locked interface contract: { userId, role, iat, exp }.
  // iat/exp are added automatically by jwt.sign — never add extra fields here.
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

async function register(req, res) {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return error(res, 'MISSING_FIELDS', 'email, password, and role are required', 400);
  }

  try {
    const existing = await authService.findUserByEmail(email);
    if (existing) {
      return error(res, 'EMAIL_TAKEN', 'Email already registered', 409);
    }

    const passwordHash = await authService.hashPassword(password);
    const user = await authService.createUser({ email, passwordHash, role });
    const token = issueToken(user);

    return success(res, { token, user: { id: user.id, email: user.email, role: user.role } }, 201);
  } catch (err) {
    return error(res, 'REGISTER_FAILED', 'Could not register user', 500);
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return error(res, 'MISSING_FIELDS', 'email and password are required', 400);
  }

  try {
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return error(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const passwordMatches = await authService.verifyPassword(password, user.password_hash);
    if (!passwordMatches) {
      return error(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const token = issueToken(user);
    return success(res, { token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    return error(res, 'LOGIN_FAILED', 'Could not log in', 500);
  }
}

module.exports = { register, login };
