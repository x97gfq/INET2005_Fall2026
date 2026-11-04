// Rate limiting the login: at most 5 FAILED tries per username, per IP, per 15 minutes.
//
// Without this, nothing stops a script trying 10,000 passwords for alice. bcrypt makes
// each guess slow (~50 ms), but a script doesn't get bored. After 5 misses the 6th
// request gets 429 Too Many Requests - even with the RIGHT password - until the window ends.
//
// Used in routes/auth.js:
//   router.post('/login', validateLogin, loginLimiter, handler)
// validateLogin runs first, so the key below can trust req.body.username is a string.

const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { LOGIN_MAX_ATTEMPTS } = require('../config');
const logger = require('../logger');

const WINDOW_MINUTES = 15;

// Who is being counted. IP + username together:
//   * IP alone would lock out a whole classroom (one school network = one IP)
//   * username alone would let anyone lock alice out from anywhere
// ipKeyGenerator() groups IPv6 addresses by network, so one machine can't dodge the
// limit by hopping between the millions of IPv6 addresses it may own.
function loginKey(req) {
  return `${ipKeyGenerator(req.ip)}:${req.body.username.trim().toLowerCase()}`;
}

const loginLimiter = rateLimit({
  windowMs: WINDOW_MINUTES * 60 * 1000,
  limit: LOGIN_MAX_ATTEMPTS,
  keyGenerator: loginKey,
  skipSuccessfulRequests: true, // only failures (status >= 400) count
  standardHeaders: 'draft-8',   // RateLimit + RateLimit-Policy headers: how many tries are left
  legacyHeaders: false,         // no old X-RateLimit-* headers
  handler: (req, res, next, options) => {
    logger.warn('Login rate limit hit', { username: req.body.username, ip: req.ip });
    res.status(options.statusCode).json({ error: `Too many failed logins. Try again in ${WINDOW_MINUTES} minutes` });
  },
});

module.exports = { loginLimiter, loginKey };
