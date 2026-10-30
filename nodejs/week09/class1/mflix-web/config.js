// Settings read from the environment (.env, or docker-compose.yml), in ONE place.
// server.js loads .env before require()ing this file, so process.env is already filled.
//
// Two secrets now, and they guard different doors:
//   JWT_SECRET      signs the API's tokens (week 7). Know it -> forge { "role": "admin" }
//   SESSION_SECRET  signs the pages' session cookie (week 9). Know it -> forge a session id
// For both:
//   * it comes from .env, never from code that gets committed
//   * in production (NODE_ENV=production) the server refuses to start without one
//   * in class we fall back to a dev secret so the demo runs, and log a warning

const logger = require('./logger');

function secret(name, devValue) {
  if (process.env[name]) return process.env[name];
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} is not set. Put a long random value in .env`);
  }
  logger.warn(`${name} is not set - using the development secret. Never do this in production.`);
  return devValue;
}

module.exports = {
  PORT: Number(process.env.PORT) || 3001,
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
  DB_NAME: process.env.DB_NAME || 'sample_mflix',
  JWT_SECRET: secret('JWT_SECRET', 'inet2005-week7-mflix-dev-secret-change-me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  SESSION_SECRET: secret('SESSION_SECRET', 'inet2005-week9-mflix-dev-session-secret'),
  LOGIN_MAX_ATTEMPTS: Number(process.env.LOGIN_MAX_ATTEMPTS) || 5, // failed logins per 15 min
};
