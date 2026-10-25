// Auth middleware: who is calling (requireJwt), and are they allowed (requireRole).
// requireJwt is the guard from week07/class1/06_jwt_inspect.js, moved into its own file,
// plus one more check: has this token been logged out?
//
//   401 Unauthorized  - we don't know who you are: no token, expired, forged or logged out
//   403 Forbidden     - we know who you are, and you're not allowed to do this
//
// Used in routes/movies.js, in this order:
//   router.delete('/:id', requireJwt, requireRole('admin'), validateId, handler)

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const RevokedToken = require('../models/RevokedToken');
const logger = require('../logger');

// "Authorization: Bearer <token>" -> "<token>", or null
function getBearerToken(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

// async: it looks the token up in MongoDB. Express 5 sends a rejected promise from
// middleware to the error handler, same as from a route.
async function requireJwt(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing bearer token. POST /api/auth/login to get one' });

  let payload;
  try {
    // algorithms: only the one we sign with - never whatever the token's header asks for
    payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    const reason = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    // Log WHY (for us), but never the token itself: a logged token is a stolen token.
    logger.warn(`Rejected token: ${err.message}`, { url: req.originalUrl, ip: req.ip });
    return res.status(401).json({ error: reason });
  }

  // Signature and exp are fine. Was it logged out? (Every token we sign has a jti;
  // one without is not one of ours.)
  if (!payload.jti || (await RevokedToken.exists({ jti: payload.jti }))) {
    logger.warn('Rejected token: logged out', { user: payload.sub, url: req.originalUrl });
    return res.status(401).json({ error: 'Token has been logged out. Log in again' });
  }

  req.user = payload;
  next();
}

// A function that RETURNS a middleware, like validateMovie(): requireRole('admin'),
// requireRole('editor', 'admin'). Runs after requireJwt, so req.user is already set.
function requireRole(...roles) {
  return function (req, res, next) {
    if (roles.includes(req.user.role)) return next();
    logger.warn('Forbidden', { user: req.user.sub, role: req.user.role, needs: roles, url: req.originalUrl });
    res.status(403).json({ error: `Requires role: ${roles.join(' or ')}` });
  };
}

module.exports = { requireJwt, requireRole };
