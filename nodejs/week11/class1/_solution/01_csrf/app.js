// Class 1, step 1: a CSRF attack, then the fix.
// The victim: a tiny mflix "account" page. Log in, change your email. That's all.
//
// Terminal 1:  docker compose exec node node week11/class1/01_csrf/app.js    -> http://localhost:3001
// Terminal 2:  docker compose exec node node week11/class1/01_csrf/evil.js   -> the attacker, port 3002
//
// Log in as alice / password123, then (in the SAME browser) open the attacker's page:
//   http://localhost:3002    a different port: same SITE, so sameSite: 'lax' doesn't stop it
//   http://127.0.0.1:3002    a different SITE: the browser holds the cookie back
//
// This is the answer key: the TODOs from 01_csrf/app.js, done. Run it instead of the starter:
//   docker compose exec node node week11/class1/_solution/01_csrf/app.js

const path = require('path');
const express = require('express');
const session = require('express-session');
// TODO Part 1: require crypto (built into Node, for the random token)
const crypto = require('crypto');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 30 },
}));

// One demo user, in memory. A restart puts the email back.
const users = { alice: { password: 'password123', email: 'alice@example.com' } };

// Every POST gets a line in the terminal, with the Origin header the browser added:
// that's how you see the attack arrive, and where it came from.
app.use((req, res, next) => {
  if (req.method === 'POST') {
    const who = req.session.username || 'nobody';
    console.log(`POST ${req.url}  user=${who}  Origin: ${req.get('origin') || '(none)'}`);
  }
  next();
});

// TODO Part 2: a CSRF middleware. Give the session a random token, put it in
// res.locals for the forms, and refuse any POST that doesn't send it back (403).
// The attacker can copy our form, but not this value: it's different for every session,
// and the same-origin policy stops their page from reading ours to find it.
app.use((req, res, next) => {
  // Check first. "!sent" matters: with no token in the session and none in the form,
  // undefined !== undefined is false, and the forgery would sail through.
  if (req.method === 'POST') {
    const sent = req.body._csrf;
    if (!sent || sent !== req.session.csrfToken) {
      console.log('  -> refused: CSRF token missing or wrong');
      return res.status(403).send('Forbidden: this form did not come from this site. Go back, reload and try again.');
    }
  }
  if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  res.locals.csrfToken = req.session.csrfToken; // the forms print it in a hidden field
  next();
});

app.get('/', (req, res) => {
  if (!req.session.username) return res.redirect('/login');
  const user = users[req.session.username];
  res.render('account', { username: req.session.username, email: user.email, saved: req.query.saved });
});

app.get('/login', (req, res) => res.render('login', { error: null }));

app.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).render('login', { error: 'Invalid username or password' });
  }
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.username = username;
    res.redirect('/');
  });
});

// The target. Change the email, and "forgot my password" mails the reset link to... whoever.
app.post('/email', (req, res) => {
  if (!req.session.username) return res.redirect('/login');
  users[req.session.username].email = String(req.body.email || '').trim();
  console.log(`  -> ${req.session.username}'s email is now ${users[req.session.username].email}`);
  res.redirect('/?saved=1');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.listen(3001, () => console.log('mflix account on http://localhost:3001  (alice / password123)'));
