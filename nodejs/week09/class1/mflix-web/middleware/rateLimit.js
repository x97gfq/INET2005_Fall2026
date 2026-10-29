// Rate limiting the login: at most 5 FAILED tries per username, per IP, per 15 minutes.
//
// Without this, nothing stops a script trying 10,000 passwords for alice. bcrypt makes
// each guess slow (~50 ms), but a script doesn't get bored. After 5 misses the 6th
// request gets 429 Too Many Requests - even with the RIGHT password - until the window ends.
//
// Used in routes/auth.js (the API) and routes/pages.js (the login page):
//   router.post('/login', validateLogin, loginLimiter, handler)
//   router.post('/login', loginFields, pageLoginLimiter, handler)
// The validator runs first, so the key below can trust req.body.username is a string.

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

// The same settings for both logins; only what the 6th try gets back differs.
function loginLimit(handler) {
  return rateLimit({
    windowMs: WINDOW_MINUTES * 60 * 1000,
    limit: LOGIN_MAX_ATTEMPTS,
    keyGenerator: loginKey,
    skipSuccessfulRequests: true, // only failures (status >= 400) count
    standardHeaders: 'draft-8',   // RateLimit + RateLimit-Policy headers: how many tries are left
    legacyHeaders: false,         // no old X-RateLimit-* headers
    handler: (req, res, next, options) => {
      logger.warn('Login rate limit hit', { username: req.body.username, ip: req.ip });
      handler(req, res.status(options.statusCode), `Too many failed logins. Try again in ${WINDOW_MINUTES} minutes`);
    },
  });
}

// POST /api/auth/login - the JSON API gets JSON
const loginLimiter = loginLimit((req, res, message) => res.json({ error: message }));

// POST /login - the login PAGE gets the form back, with the message (week 8).
// Its own counter, so 5 misses on the page and 5 on the API are counted separately.
const pageLoginLimiter = loginLimit((req, res, message) =>
  res.render('login', { title: 'Log in', username: req.body.username, error: message })
);

module.exports = { loginLimiter, pageLoginLimiter, loginKey };
