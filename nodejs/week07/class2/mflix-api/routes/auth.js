// /api/auth routes: trade a username + password for a JWT, and give it back.
//
// This is the "login" that week07/class1/06_jwt_inspect.js skipped: POST /api/token there
// signed a token for anyone who asked. Here the password is checked first.
//
//   POST /api/auth/login   { "username": "bob", "password": "letmein" }  -> { token }
//   GET  /api/auth/me      Authorization: Bearer <token>   -> who the token says you are
//   POST /api/auth/logout  Authorization: Bearer <token>   -> 204; that token is dead from now on

const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const { requireJwt } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validate');
const { loginLimiter, loginKey } = require('../middleware/rateLimit');
const RevokedToken = require('../models/RevokedToken');
const logger = require('../logger');

const router = express.Router();

// The same three demo users as week08's session login, now with a ROLE.
//   admin  - everything, including DELETE
//   editor - create and update movies
//   viewer - can log in, but can only read (same as no token at all)
// LOOSE END: a real app keeps these in a users collection (sample_mflix has one),
// with the bcrypt hash in the document. Hard-coded users are for the demo only.
const users = [
  { username: 'alice', role: 'admin', passwordHash: '$2b$10$8eyv4GJAgmD2uGWtpjG37uovyKkIwOGGJ6w5Bev7DewgxfVq1lSUm' },  // password123
  { username: 'bob', role: 'editor', passwordHash: '$2b$10$4jS4pPILOqpFCjzu3kO65enuKbfshr/tYmdoxMdyTd4Mdwk4L1Ew6' },   // letmein
  { username: 'carol', role: 'viewer', passwordHash: '$2b$10$iS3DjxtayCddaRo0u4QieeYxfyBPtEny3aYk.KcZ1UdfSarwxicsG' }, // hunter2
];

// A hash to compare against when the username doesn't exist, so a wrong username takes
// as long as a wrong password. Otherwise the response time tells an attacker which
// usernames are real.
const DUMMY_HASH = bcrypt.hashSync('no-such-user', 10);

// validateLogin, then the rate limiter (5 failed tries / 15 min), then the password check
router.post('/login', validateLogin, loginLimiter, async (req, res) => {
  const username = req.body.username.trim();
  const user = users.find((u) => u.username === username);
  const ok = await bcrypt.compare(req.body.password, user ? user.passwordHash : DUMMY_HASH);

  if (!user || !ok) {
    // One vague message either way - don't reveal which half was wrong.
    // Log the username and IP (useful for spotting a password-guessing attack), NEVER the password.
    logger.warn('Login failed', { username, ip: req.ip });
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Got it right: forget the failed tries, so earlier typos don't count against them
  await loginLimiter.resetKey(loginKey(req));

  // The payload is readable by anyone (class 1): who and what role. No password, no secrets.
  // jwtid adds a "jti" claim - a unique id for THIS token, so logout can revoke just this one.
  const token = jwt.sign({ sub: user.username, role: user.role }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
    jwtid: crypto.randomUUID(),
  });
  logger.info('Login ok', { username: user.username, role: user.role });
  res.json({ token, tokenType: 'Bearer', expiresIn: JWT_EXPIRES_IN });
});

router.get('/me', requireJwt, (req, res) => {
  res.json({ user: req.user.sub, role: req.user.role, expires: new Date(req.user.exp * 1000).toISOString() });
});

// Logout. The client deleting its copy of the token isn't enough - anyone who copied it
// could keep using it until it expires. So the server records the token's id as revoked
// (models/RevokedToken.js), and requireJwt turns it away from now on.
router.post('/logout', requireJwt, async (req, res) => {
  await RevokedToken.updateOne(
    { jti: req.user.jti },
    { jti: req.user.jti, user: req.user.sub, expiresAt: new Date(req.user.exp * 1000) },
    { upsert: true } // insert it, or leave it if it's already there
  );
  logger.info('Logout', { username: req.user.sub });
  res.status(204).end();
});

module.exports = router;
