// Warm-up: register, log in, log out - and the movies come from the API, with a JWT
// Code along: we start from last class's warm-up in week09/class2/00_warmup/ (this copy is the answer key)
// The TODO comments match the starter, so you can search for "TODO Part 2" to find your place
// Terminal 1:  docker compose exec node node week09/class2/mflix-api/server.js
// Terminal 2:  docker compose exec node node week09/class2/_solution/00_warmup/app.js
// Open http://localhost:3001

const path = require('path');
const express = require('express');
// TODO Part 1: replace the MongoClient require with express-session, and add the API constant
const session = require('express-session');

// Both servers run in the node container, so "localhost" here means that container
const API = 'http://localhost:3002/api';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// TODO Part 1: add express.urlencoded() and the session middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 30 },
}));

// TODO Part 7: add middleware that copies req.session.username into res.locals
// Every template can see who's logged in (the header needs it)
app.use((req, res, next) => {
  res.locals.username = req.session.username;
  next();
});

// TODO Part 3: add GET /register, POST /register and GET /login
// Register: the API checks the fields and hashes the password. We just pass them along.
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const apiRes = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!apiRes.ok) {
    const data = await apiRes.json();
    return res.status(apiRes.status).render('register', { error: data.error });
  }
  res.redirect('/login?registered=1');
});

// Log in: trade the password for a JWT, and keep the JWT in the session
app.get('/login', (req, res) => {
  const notice = req.query.registered ? 'Account created. Now log in.' : null;
  res.render('login', { error: null, notice });
});

// TODO Part 4: add POST /login, and keep the JWT in req.session.token
app.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  const apiRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await apiRes.json();
  if (!apiRes.ok) {
    return res.status(apiRes.status).render('login', { error: data.error, notice: null });
  }

  // A new session id at login, then the token stays on the SERVER. The browser only gets a cookie.
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.username = username.trim();
    req.session.token = data.token;
    res.redirect('/');
  });
});

// TODO Part 5: send a visitor with no token to /login, then fetch() the movies from the API with the token
// The page: no more database. Ask the API, and show it the token from the session.
app.get('/', async (req, res) => {
  if (!req.session.token) return res.redirect('/login');

  const apiRes = await fetch(`${API}/movies?year=1999&limit=10`, {
    headers: { Authorization: `Bearer ${req.session.token}` },
  });

  // The token expired or was revoked: this session is no use any more
  if (apiRes.status === 401) {
    return req.session.destroy(() => res.redirect('/login'));
  }
  if (!apiRes.ok) throw new Error(`The API replied ${apiRes.status}`);

  const data = await apiRes.json();
  res.render('home', { movies: data.results });
});

// TODO Part 6: add POST /logout: revoke the token at the API, then destroy the session
// Log out twice: the API kills the token, then we throw away the session
app.post('/logout', async (req, res) => {
  if (req.session.token) {
    await fetch(`${API}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${req.session.token}` },
    });
  }
  req.session.destroy(() => res.redirect('/login'));
});

// TODO Part 6: add the error middleware for when the API isn't running
// fetch() throws if nothing is listening on port 3002: the likeliest mistake in class
app.use((err, req, res, next) => {
  if (err.cause?.code !== 'ECONNREFUSED') return next(err);
  res.status(502).send('The movies API is not answering. Is it running in your other terminal?');
});

app.listen(3001, () => console.log('Warm-up on http://localhost:3001'));
