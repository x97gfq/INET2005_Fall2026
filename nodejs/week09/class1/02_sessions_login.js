// EJS 3: sessions with express-session - the Node version of week 2's PHP login
// Run:  docker compose exec node node week09/class1/02_sessions_login.js
// Open http://localhost:3001  (you'll be sent to /login)
//
// HTTP is stateless: the server forgets you between requests. A SESSION fixes that.
// express-session gives each browser a signed cookie holding a session id; the matching
// data lives on the server in req.session. This is exactly PHP's session_start() +
// $_SESSION from week 2 (login_example4), rebuilt in Node:
//
//   PHP                          Node (express-session)
//   session_start();             app.use(session({...}))   // once, as middleware
//   $_SESSION['user'] = ...      req.session.user = ...
//   if (!isset($_SESSION[...]))  if (!req.session.user)     // the guard
//   session_destroy();           req.session.destroy()

const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// The session middleware. Runs on every request, fills req.session, sets the cookie.
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production', // signs the cookie
    resave: false,
    saveUninitialized: false, // don't create a session until we store something
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 30 }, // 30 minutes; httpOnly = JS can't read it
  })
);

// A tiny "users table". In a real app these rows come from MySQL or Mongo (weeks 2 and 5);
// the password_hash column holds a bcrypt hash, never the plaintext. These hashes were
// made with bcrypt.hashSync(password, 10).
const users = [
  { username: 'alice', passwordHash: '$2b$10$8eyv4GJAgmD2uGWtpjG37uovyKkIwOGGJ6w5Bev7DewgxfVq1lSUm' }, // password123
  { username: 'bob', passwordHash: '$2b$10$4jS4pPILOqpFCjzu3kO65enuKbfshr/tYmdoxMdyTd4Mdwk4L1Ew6' },   // letmein
  { username: 'carol', passwordHash: '$2b$10$iS3DjxtayCddaRo0u4QieeYxfyBPtEny3aYk.KcZ1UdfSarwxicsG' }, // hunter2
];

// The guard: our own middleware, just like requireKey in week07/class1/01_what_is_middleware.js
// and requireJwt in week07/class2/mflix-api - same guard, a cookie instead of a token.
// Reuse it on any route that needs a logged-in user.
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  req.session.notice = 'Please log in to continue.';
  res.redirect('/login');
}

app.get('/', (req, res) => res.redirect(req.session.user ? '/dashboard' : '/login'));

app.get('/login', (req, res) => {
  // Read-and-clear a one-time notice (PHP calls this "flash" data)
  const notice = req.session.notice;
  delete req.session.notice;
  res.render('login', { error: null, notice: notice || null, username: '' });
});

app.post('/login', async (req, res) => {
  const username = (req.body.username || '').trim();
  const password = req.body.password || '';

  const user = users.find((u) => u.username === username);
  // Always compare against a hash, even when the user doesn't exist, and give one
  // vague message either way - don't reveal which half was wrong.
  const ok = user && (await bcrypt.compare(password, user.passwordHash));

  if (!ok) {
    return res.status(401).render('login', {
      error: 'Invalid username or password.',
      notice: null,
      username, // keep the username, never the password
    });
  }

  // Success: store who they are in the session. The next request will see it.
  req.session.user = { username: user.username };
  req.session.views = 0;
  res.redirect('/dashboard');
});

// Protected: requireLogin runs first. No session -> redirect, this handler never runs.
app.get('/dashboard', requireLogin, (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  res.render('dashboard', { user: req.session.user, views: req.session.views });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login')); // throw the session away
});

app.listen(PORT, () => {
  console.log(`Sessions login on http://localhost:${PORT}`);
});
