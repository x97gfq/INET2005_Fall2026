// Movies API, week 7 edition: the week 6 microservice with everything from week 7 class 1.
// First (once):  docker compose exec node node week06/class1/00_seed_mflix.js
// Run:           docker compose exec node node week07/class2/mflix-api/server.js
// Test:          week07/class2/mflix-api/requests.http (or import the Postman collection)
// Open http://localhost:3001             front end (public/index.html, read-only)
//      http://localhost:3001/api-docs    Swagger UI - click Authorize and paste a token
//
// What changed since week06/class1/movies-api:
//   logger.js              winston: levels, console + logs/ files          (class 1, 05)
//   morgan, below          one line per request, fed into winston          (class 1, 04-05)
//   middleware/validate.js custom validation middleware -> 400 + details   (class 1, 03)
//   middleware/auth.js     requireJwt (Bearer token) + requireRole -> 401/403 (class 1, 06)
//   routes/auth.js         POST /api/auth/login: password -> JWT;  POST /api/auth/logout
//   middleware/rateLimit.js 5 failed logins / 15 min -> 429           (express-rate-limit)
//   models/RevokedToken.js logged-out tokens, so logout really logs out
//   helmet, below          security headers, including a Content-Security-Policy
//   routes/movies.js       the same routes, with middleware in front of each
//   config.js              settings + the JWT secret from .env, in one place
//   public/app.js          the front end's script, moved out of index.html for the CSP
//   models/Movie.js        unchanged

const path = require('path');
const fs = require('fs');

// .env first: config.js and logger.js read process.env when they're require()d
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const { PORT, MONGO_URL, DB_NAME } = require('./config');
const logger = require('./logger');
const authRouter = require('./routes/auth');
const moviesRouter = require('./routes/movies');

const app = express();

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
morgan.token('user', (req) => (req.user ? req.user.sub : '-'));
app.use(
  morgan(':method :url :status :response-time ms user=:user', {
    stream: { write: (line) => logger.http(line.trim()) },
  })
);

// (2) JSON bodies, capped at 10 kB. A movie is well under 1 kB; without a limit (default
//     100 kB) someone can make the server parse huge bodies all day.
app.use(express.json({ limit: '10kb' }));

// (3) The front end
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
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Connect first, then start taking requests. No database = no point running: exit 1.
mongoose.connect(MONGO_URL, { dbName: DB_NAME })
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Movies API on http://localhost:${PORT}  (docs: http://localhost:${PORT}/api-docs, log level: ${logger.level})`);
    });
  })
  .catch((err) => {
    logger.error(`Could not connect to MongoDB: ${err.message}`);
    process.exit(1);
  });
