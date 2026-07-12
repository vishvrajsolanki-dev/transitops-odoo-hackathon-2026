// TASK: auth service
// Business logic + Prisma queries live here. Controllers call into this file.
const bcrypt = require('bcrypt');
const prisma = require('../../config/db');

const SALT_ROUNDS = 10;

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUser({ email, passwordHash, role }) {
  try {
    return await prisma.user.create({
      data: { email, password_hash: passwordHash, role },
    });
  } catch (err) {
    // Prisma unique-constraint violation — translate here so the controller
    // never has to know about ORM-specific error shapes.
    if (err.code === 'P2002') {
      const dupError = new Error('Email already registered');
      dupError.code = 'EMAIL_TAKEN';
      throw dupError;
    }
    throw err;
  }
}

module.exports = { hashPassword, verifyPassword, findUserByEmail, createUser };
