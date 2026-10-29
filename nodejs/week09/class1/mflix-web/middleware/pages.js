// Middleware for the EJS pages - the session-cookie version of middleware/auth.js.
//
//                       the JSON API (week 7)             the pages (week 8)
//   who are you?        requireJwt  -> 401 JSON            requireLogin    -> redirect to /login
//   are you allowed?    requireRole -> 403 JSON            requirePageRole -> 403 page
//   where it lives      Authorization: Bearer <token>      a session cookie (req.session.user)
//
// Why two? A browser sends cookies by itself on every request, so a cookie login suits
// pages: no JavaScript has to hold a token. An API client (Postman, React, a phone app)
// sends the token on purpose. The API ignores the cookie; the pages ignore the token.
//
// Used in server.js and routes/pages.js.

const crypto = require('crypto');
const logger = require('../logger');

// ---- what every template gets ---------------------------------------------------
// Anything on res.locals is a variable in EVERY template rendered for this request, so
// the header can show who's logged in without each route passing it in.
function pageLocals(req, res, next) {
  const user = req.session.user || null;
  res.locals.user = user;
  res.locals.canEdit = !!user && ['editor', 'admin'].includes(user.role);
  res.locals.isAdmin = !!user && user.role === 'admin';

  // A "flash" message: set before a redirect, shown once on the next page, then gone.
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
}

// ---- CSRF: is this POST really from one of OUR forms? ---------------------------------
// The session cookie goes along with every request to this site - even one started by a
// form on someone else's site (cross-site request forgery). So every form we render
// carries a secret token in a hidden field, and every POST must send it back.
// The cookie's sameSite: 'lax' (server.js) blocks most of these already; the token is the
// second lock on the same door, as pickFields() was for validateMovie in week 7.
function csrf(req, res, next) {
  if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  res.locals.csrfToken = req.session.csrfToken; // forms: <input type="hidden" name="_csrf" ...>

  if (req.method === 'POST' && req.body._csrf !== req.session.csrfToken) {
    logger.warn('CSRF token missing or wrong', { url: req.originalUrl, ip: req.ip });
    return res.status(403).render('error', {
      title: 'Forbidden', status: 403,
      message: 'This form has expired or did not come from this site. Go back, reload the page and try again.',
    });
  }
  next();
}

// ---- the guards ---------------------------------------------------------------------
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  // Come back here after logging in (only for pages you can GET - not a half-sent form)
  if (req.method === 'GET') req.session.returnTo = req.originalUrl;
  req.session.flash = { type: 'info', message: 'Please log in first.' };
  res.redirect('/login');
}

// Like requireRole(): a function that RETURNS a middleware. Runs after requireLogin.
function requirePageRole(...roles) {
  return function (req, res, next) {
    if (roles.includes(req.session.user.role)) return next();
    logger.warn('Forbidden', { user: req.session.user.username, role: req.session.user.role, needs: roles, url: req.originalUrl });
    res.status(403).render('error', { title: 'Forbidden', status: 403, message: `This needs the ${roles.join(' or ')} role.` });
  };
}

module.exports = { pageLocals, csrf, requireLogin, requirePageRole };
