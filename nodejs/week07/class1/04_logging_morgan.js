// Middleware 4: request logging with morgan
// Run:  docker compose exec node node week07/class1/04_logging_morgan.js
// Open http://localhost:3001/ , /slow , /nope  and watch the terminal.
// Then look at week07/class1/logs/access.log
//
// In 01_what_is_middleware.js we wrote our own logger with res.on('finish').
// morgan (npm install morgan) is that same middleware, already written: one line per
// request with the method, URL, status code and response time. Every Express app
// you'll meet has it (or something like it) near the top of server.js.

const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// (1) 'dev' = short, coloured output for the terminal. Status codes are green (2xx),
//     cyan (3xx), yellow (4xx) and red (5xx). This is the one you'll use most.
//       GET /slow 200 1003.512 ms - 26
app.use(morgan('dev'));

// (2) A custom token. Same idea as 01: one middleware adds req.requestId, and morgan
//     can print it as :id. Tokens are just functions of (req, res).
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).slice(2, 8);
  next();
});
morgan.token('id', (req) => req.requestId);

// (3) A second morgan, writing to a FILE instead of the terminal. The terminal
//     scrolls away; a log file is what you read the morning after something broke.
//     flags: 'a' = append, so restarting the server doesn't wipe old lines.
const LOG_DIR = path.join(__dirname, 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });
const accessLog = fs.createWriteStream(path.join(LOG_DIR, 'access.log'), { flags: 'a' });

// Build your own format from tokens. Other built-in formats: 'combined' (the Apache
// format web servers use), 'common', 'short', 'tiny'.
app.use(
  morgan(':date[iso] :id :method :url :status :response-time ms', { stream: accessLog })
);

// Routes
app.get('/', (req, res) => {
  res.send(`Hello (request ${req.requestId}). Try /slow and /nope, then open logs/access.log`);
});

app.get('/slow', (req, res) => {
  setTimeout(() => res.send('That took about a second.'), 1000);
});

app.use((req, res) => {
  res.status(404).send(`No route for ${req.originalUrl}`);
});

app.listen(PORT, () => {
  console.log(`morgan demo on http://localhost:${PORT}`);
  console.log(`Writing access log to ${path.join(LOG_DIR, 'access.log')}`);
});
