// Settings read from the environment (.env, or docker-compose.yml), in ONE place.
// server.js loads .env before require()ing this file, so process.env is already filled.
//
// The JWT secret is the key to the whole API: anyone who knows it can sign a token
// that says { "role": "admin" } and this server will believe it. So:
//   * it comes from .env, never from code that gets committed
//   * in production (NODE_ENV=production) the server refuses to start without one
//   * in class we fall back to a dev secret so the demo runs, and log a warning

const logger = require('./logger');

const DEV_SECRET = 'inet2005-week7-mflix-dev-secret-change-me';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not set. Put a long random value in .env');
  }
  logger.warn('JWT_SECRET is not set - using the development secret. Never do this in production.');
  jwtSecret = DEV_SECRET;
}

module.exports = {
  PORT: Number(process.env.PORT) || 3001,
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
  DB_NAME: process.env.DB_NAME || 'sample_mflix',
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  LOGIN_MAX_ATTEMPTS: Number(process.env.LOGIN_MAX_ATTEMPTS) || 5, // failed logins per 15 min
};
