// Middleware 1: what middleware actually is
// Run:  docker compose exec node node week07/class1/01_what_is_middleware.js
// Open http://localhost:3001/  and  http://localhost:3001/slow  and watch the terminal
//
// You have USED middleware already: app.use(express.json()) and express.static in
// the week 6 movies API. This file shows what one IS, so express-session (class 2)
// isn't magic.
//
// A middleware is just a function (req, res, next). Express runs them in order on
// every request. Each one either:
//   * calls next()        -> hand off to the next middleware / route, or
//   * sends a response    -> res.send/json/... and the chain stops.
// Forget to do either and the request hangs forever.

const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// (1) Logger: runs on EVERY request. Measures how long the response took.
app.use((req, res, next) => {
  const started = Date.now();
  // res.on('finish') fires once the response has been sent
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - started}ms)`);
  });
  next(); // <-- without this line, nothing below ever runs
});

// (2) A middleware can add things to req for later handlers to use.
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).slice(2, 8);
  next();
});

// (3) Route-level middleware: only runs for requests whose path starts with /admin.
//     This is how a real app protects pages - exactly what sessions will do in class 2.
function requireKey(req, res, next) {
  if (req.query.key === 'secret') return next();
  res.status(401).send('Need ?key=secret to see /admin');
}
app.use('/admin', requireKey);

// Routes are just the last middleware in the chain.
app.get('/', (req, res) => {
  res.send(`Hello. Your request id is ${req.requestId}. Try /slow and /admin`);
});

app.get('/slow', (req, res) => {
  // Pretend this did a slow database query, so the logger's timing is visible.
  setTimeout(() => res.send('That took about a second.'), 1000);
});

app.get('/admin', (req, res) => {
  res.send('Welcome to the admin page.');
});

app.listen(PORT, () => {
  console.log(`Middleware demo on http://localhost:${PORT}`);
  console.log('Open /, /slow and /admin (with and without ?key=secret) and watch this terminal.');
});
