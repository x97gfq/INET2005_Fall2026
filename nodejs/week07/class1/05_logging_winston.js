// Middleware 5: application logging with winston (and morgan feeding into it)
// Run:  docker compose exec node node week07/class1/05_logging_winston.js
// Test: open week07/class1/05_requests.http in VS Code (REST Client) and send each request
// Then look at week07/class1/logs/combined.log and logs/error.log
//
// morgan logs REQUESTS: "GET /api/tasks 200". That's all it knows.
// winston logs whatever YOUR CODE decides is worth saying: "user alice logged in",
// "payment failed", "MongoDB connection lost". It adds:
//   * levels      - error, warn, info, ... so you can filter what you see
//   * transports  - send the same log to the terminal AND files (or a log service)
//   * structure   - extra data as JSON ({ taskId: 3 }), not glued into a string
//
// console.log has none of those. Real apps use a logger like winston instead.
// The setup lives in logger.js, so open that file alongside this one.

const express = require('express');
const morgan = require('morgan');
const logger = require('./logger');
const tasksRouter = require('./taskRouter');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// morgan -> winston. Instead of printing, morgan hands each line to logger.http(),
// so request logs land in the same terminal and files as everything else.
// .trim() removes the newline morgan adds to the end of each line.
app.use(
  morgan(':method :url :status :response-time ms', {
    stream: { write: (line) => logger.http(line.trim()) },
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  // The second argument is extra data. It's stored as JSON fields in combined.log.
  logger.info('Home page visited', { ip: req.ip });
  res.send('Try /levels, /api/tasks, /api/boom and /nope, then open the logs/ folder');
});

// One message at every level. With the default LOG_LEVEL=http you'll only see the
// first four. Restart with -e LOG_LEVEL=debug to see verbose and debug too.
app.get('/levels', (req, res) => {
  logger.error('error   - something failed and needs fixing');
  logger.warn('warn    - odd, but the app carried on');
  logger.info('info    - normal events worth recording');
  logger.http('http    - one line per request (morgan uses this)');
  logger.verbose('verbose - more detail than usual');
  logger.debug('debug   - for you while hunting a bug');
  res.send(`Logged one message at each level. Current level: ${logger.level}`);
});

// The router from 02_router_basics.js, reused as-is.
app.use('/api/tasks', tasksRouter);

app.get('/api/boom', (req, res) => {
  throw new Error('Something broke while building the response');
});

// 404, as in 03. A warn: not our bug, but worth knowing if it happens a lot.
app.use((req, res) => {
  logger.warn('No route matched', { method: req.method, url: req.originalUrl });
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// The error handler from 03, now logging with winston instead of console.error.
// The stack trace goes in the log (for you), NOT in the response (for the user).
app.use((err, req, res, next) => {
  logger.error(err.message, { method: req.method, url: req.originalUrl, stack: err.stack });
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  logger.info(`winston demo on http://localhost:${PORT} (log level: ${logger.level})`);
});
