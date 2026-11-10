// mflix-bff: the server behind the React app (a "backend for frontend", BFF).
// It's week 9 class 2's warm-up with every res.render() swapped for res.json().
// React draws the pages now, so this server only answers JSON.
//
//   browser (React, :5173) --cookie--> mflix-bff (:3001) --Bearer JWT--> mflix-api (:3002) --> MongoDB
//                                          |
//                                          +--Bearer AI key--> the AI provider (week 11)
//
// Terminal 1:  docker compose exec node node week09/class2/mflix-api/server.js
// Terminal 2:  docker compose exec node node week10/mflix-bff/server.js
// Terminal 3:  docker compose exec react npm run dev    -> http://localhost:5173
//
// Week 10: React's first request asks /api/session. Week 11: React registers, logs in and logs
// out through it, then we type the AI route (search for TODO) and call it from React.
// Answer key: week10/_solution/mflix-bff/server.js
//
// The browser never talks to mflix-api or the AI provider. It only ever sees a session cookie:
// the JWT and the AI key stay here, on the server.

const path = require('path');
// .env first, so process.env has the AI settings (copy .env.example to .env)
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

// Both servers run in the node container, so "localhost" here means that container
const API = process.env.MOVIES_API || 'http://localhost:3002/api';
const PORT = Number(process.env.PORT) || 3001;

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(session({
  name: 'mflix.sid',
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 30 },
}));

// ---- CSRF, the fetch() version ------------------------------------------------------
// Class 1's forms carried a token. A fetch() app can do something simpler: send a custom
// header that a forged request can't. An HTML form can't add headers, and a script on
// another origin that tries is stopped by CORS (this server never says Access-Control-Allow-*).
// So anything that changes something must arrive with our header.
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') return next();
  if (req.get('X-Requested-With') !== 'mflix-react') {
    console.log(`Refused ${req.method} ${req.originalUrl}: no X-Requested-With header (CSRF?)`);
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

// ---- helpers ------------------------------------------------------------------------
// Send fields to the API as JSON (from week 9's warm-up)
function postToApi(url, fields) {
  return fetch(API + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
}

// The API's error, as one line (on a 400 it lists each bad field in details)
function problem(data) {
  return data.details ? Object.values(data.details).join('. ') : data.error;
}

// GET from the API with this session's JWT
function getFromApi(req, url) {
  return fetch(API + url, { headers: { Authorization: `Bearer ${req.session.token}` } });
}

// No token in the session = not logged in
function requireLogin(req, res, next) {
  if (!req.session.token) return res.status(401).json({ error: 'Please log in' });
  next();
}

// The token expired or was revoked: the session is no use any more
function sessionExpired(req, res) {
  req.session.destroy(() => res.status(401).json({ error: 'Your session expired. Please log in again.' }));
}

// ---- who am I? ----------------------------------------------------------------------
// React asks this once, when the page loads. The answer comes from the session, which the
// browser points at with its cookie. React itself remembers nothing between page loads.
app.get('/api/session', (req, res) => {
  res.json({ username: req.session.username || null });
});

// ---- register, log in, log out: week 9's routes, answering JSON ----------------------
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const apiRes = await postToApi('/auth/register', { username, password });
  const data = await apiRes.json();
  if (!apiRes.ok) return res.status(apiRes.status).json({ error: problem(data) });
  res.status(201).json({ username: data.username });
});

app.post('/api/login', async (req, res, next) => {
  const { username, password } = req.body;
  const apiRes = await postToApi('/auth/login', { username, password });
  const data = await apiRes.json();
  if (!apiRes.ok) return res.status(apiRes.status).json({ error: problem(data) });

  // A new session id at login, then the JWT stays HERE. The browser only gets the cookie.
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.username = username.trim();
    req.session.token = data.token;
    res.json({ username: req.session.username });
  });
});

app.post('/api/logout', async (req, res) => {
  if (req.session.token) {
    await fetch(`${API}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${req.session.token}` },
    });
  }
  req.session.destroy(() => {
    res.clearCookie('mflix.sid');
    res.json({ username: null });
  });
});

// ---- the movies ---------------------------------------------------------------------
// Pass the search along, with the token. React gets the API's own JSON back.
app.get('/api/movies', requireLogin, async (req, res) => {
  const params = new URLSearchParams({ limit: '15' });
  if (req.query.title) params.set('title', String(req.query.title));
  if (req.query.page) params.set('page', String(req.query.page));

  const apiRes = await getFromApi(req, `/movies?${params}`);
  if (apiRes.status === 401) return sessionExpired(req, res);
  const data = await apiRes.json();
  if (!apiRes.ok) return res.status(apiRes.status).json({ error: problem(data) });
  res.json(data); // { page, limit, total, totalPages, results: [...] }
});

// ---- week 11: ask an AI, from the server --------------------------------------------
// TODO week 11: the AI route.
// The same move as week 9's weather demo, with one difference: this API wants a KEY.
// The key lives in .env, is read here, and goes in a header to the provider. It is never
// in a response, never in React's code, and never in the browser.
const AI_BASE_URL = (process.env.AI_BASE_URL || '').replace(/\/+$/, ''); // no trailing slash
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL;

// Every call costs real money (or free-tier quota). 5 a minute per user is plenty here.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: (req) => req.session.username,
  handler: (req, res) => res.status(429).json({ error: 'Slow down: 5 suggestions a minute' }),
});

// POST /api/movies/:id/similar  ->  { movie, text }
//   1. no AI settings? 503 with a helpful message
//   2. get the movie from OUR API (getFromApi), not from the browser
//   3. fetch() the provider's /chat/completions with the key in the Authorization header
//   4. check aiRes.ok, then send back just the text
app.post('/api/movies/:id/similar', requireLogin, aiLimiter, async (req, res) => {
  res.status(501).json({ error: 'Not written yet: week 11' });
});

// ---- errors -------------------------------------------------------------------------
// Any other /api URL: JSON, not Express's HTML 404 page
app.use('/api', (req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` }));

// fetch() throws when nothing answers at all: the API isn't running, or the AI timed out
app.use((err, req, res, next) => {
  if (err.cause?.code === 'ECONNREFUSED') {
    return res.status(502).json({ error: 'The movies API is not answering. Is it running in terminal 1?' });
  }
  if (err.name === 'TimeoutError') {
    return res.status(504).json({ error: 'That took too long. Try again.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`mflix-bff on http://localhost:${PORT}  (movies API: ${API})`);
  console.log(AI_API_KEY ? `AI: ${AI_MODEL} at ${AI_BASE_URL}` : 'AI: not set up (no AI_API_KEY in .env)');
});
