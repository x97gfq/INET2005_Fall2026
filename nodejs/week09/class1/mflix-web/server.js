// mflix-web, week 9: the week 7 movies API, plus a face - EJS pages built on the server.
// First (once):  docker compose exec node node week06/class1/00_seed_mflix.js
// Run:           docker compose exec node node week09/class1/mflix-web/server.js
// Open http://localhost:3001             the EJS pages (log in as alice, bob or carol)
//      http://localhost:3001/fetch.html  week 6's page: the same list, built in the browser
//      http://localhost:3001/api-docs    the JSON API, unchanged from week 7
//
// What changed since week07/class2/mflix-api:
//   routes/pages.js        NEW  the pages: list, detail, add/edit/delete forms, login, logout
//   views/                 NEW  the EJS templates + partials/
//   middleware/pages.js    NEW  session guards (requireLogin, requirePageRole), CSRF, res.locals
//   services/movies.js     NEW  listMovies(): the query the API and the pages share
//   users.js               NEW  the demo users + checkPassword(), shared by both logins
//   middleware/validate.js      movieProblems() pulled out, so forms use the API's rules
//   middleware/rateLimit.js     + pageLoginLimiter (answers with the login page, not JSON)
//   config.js                   + SESSION_SECRET
//   below                       + view engine, urlencoded bodies, express-session, HTML errors
//   public/index.html      ->   public/fetch.html, so / belongs to the EJS pages
//   public/confirm.js      NEW  "Delete this movie?" - the only JavaScript the pages use

const path = require('path');
const fs = require('fs');

// .env first: config.js and logger.js read process.env when they're require()d
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const { PORT, MONGO_URL, DB_NAME, SESSION_SECRET } = require('./config');
const logger = require('./logger');
const authRouter = require('./routes/auth');
const moviesRouter = require('./routes/movies');
const pagesRouter = require('./routes/pages');
const { pageLocals, csrf } = require('./middleware/pages');

const app = express();

// EJS: res.render('movies') runs views/movies.ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware runs on every request, in this order, before the routes.

// (0) helmet: a dozen security headers in one line. They switch on protections the
//     browser has but leaves OFF unless the server asks: Content-Security-Policy,
//     X-Content-Type-Options: nosniff, X-Frame-Options (no clickjacking), Referrer-Policy,
//     Strict-Transport-Security... It also removes "X-Powered-By: Express" - no need to
//     tell an attacker what to look up. First, so even error responses get the headers.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // helmet's defaults (scripts only from this server, no plugins, no framing...)
        // plus the one other place our front end talks to:
        'connect-src': ["'self'", 'http://localhost:3002'], // fetch() to the comments service
        // helmet's default tells the browser to switch every http:// URL to https://.
        // We're on http://localhost in class, so turn that off. On a real HTTPS server,
        // delete this line.
        'upgrade-insecure-requests': null,
      },
    },
  })
);

// (1) morgan -> winston: one log line per request. :user is a custom token - who the JWT
//     said you were (requireJwt sets req.user; morgan writes the line when the response
//     finishes, so it's there by then). morgan never logs the Authorization header.
//     Week 9: or who the session says you are, for the pages.
morgan.token('user', (req) => (req.user ? req.user.sub : req.session && req.session.user ? req.session.user.username : '-'));
app.use(
  morgan(':method :url :status :response-time ms user=:user', {
    stream: { write: (line) => logger.http(line.trim()) },
  })
);

// (2) JSON bodies, capped at 10 kB. A movie is well under 1 kB; without a limit (default
//     100 kB) someone can make the server parse huge bodies all day.
app.use(express.json({ limit: '10kb' }));
//     ...and form bodies (title=Up&year=2009), the same 10 kB cap. Week 9: the pages' forms.
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// (3) Static files: week 6's fetch.html + app.js, and the pages' confirm.js
app.use(express.static(path.join(__dirname, 'public')));

// The API
app.use('/api/auth', authRouter);
app.use('/api/movies', moviesRouter);

// Swagger UI: interactive docs generated from the OpenAPI description
const openapi = YAML.parse(fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8'));
app.get('/openapi.json', (req, res) => res.json(openapi));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

// Any other /api URL: JSON 404, not Express's HTML page
app.use('/api', (req, res) => {
  logger.warn('No route matched', { method: req.method, url: req.originalUrl });
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// ---- The pages (week 9) ----------------------------------------------------------
// Sessions start HERE, after the API: an /api request has already been answered above,
// so it never gets a session or a cookie. The API is still token-only.
app.use(
  session({
    name: 'mflix.sid',      // not the default 'connect.sid': no need to say what we run
    secret: SESSION_SECRET, // signs the cookie, so a made-up session id is refused
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,           // page JavaScript can't read it (an XSS can't steal it)
      sameSite: 'lax',          // not sent with POSTs started by other sites (CSRF)
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
      // secure: true          // HTTPS only. LOOSE END: turn on once the site has HTTPS
    },
    // LOOSE END: the default store keeps sessions in memory - restart the server and
    // everyone is logged out. A real app uses a shared store (e.g. connect-mongo).
  })
);
app.use(pageLocals); // user, canEdit, isAdmin, flash -> every template
app.use(csrf);       // every POST must carry the form's token
app.use('/', pagesRouter);

// Anything else: a 404 PAGE (the API's 404 above is JSON)
app.use((req, res) => {
  res.status(404).render('error', { title: 'Not found', status: 404, message: `There's no page at ${req.originalUrl}.` });
});

// Error handler (4 parameters), LAST. The validators catch most bad input before it
// gets here; this is the safety net for everything they didn't think of.
app.use((err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${JSON.stringify(err.value)}` });
  }
  if (err.name === 'ValidationError') {
    const details = {};
    for (const [field, problem] of Object.entries(err.errors)) details[field] = problem.message;
    return res.status(400).json({ error: 'Validation failed', details });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large (limit 10 kB)' });
  }
  // Our bug. The stack trace goes in the LOG for us - never in the response for them.
  logger.error(err.message, { method: req.method, url: req.originalUrl, stack: err.stack });
  // The API answers in JSON; a page answers with a page
  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({ error: 'Something went wrong on the server' });
  }
  res.status(500).render('error', { title: 'Error', status: 500, message: 'Something went wrong on the server.' });
});

// Connect first, then start taking requests. No database = no point running: exit 1.
mongoose.connect(MONGO_URL, { dbName: DB_NAME })
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`mflix-web on http://localhost:${PORT}  (API docs: http://localhost:${PORT}/api-docs, log level: ${logger.level})`);
    });
  })
  .catch((err) => {
    logger.error(`Could not connect to MongoDB: ${err.message}`);
    process.exit(1);
  });
