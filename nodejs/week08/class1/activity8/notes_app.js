// Activity 8: Session Notepad
// Run:  docker compose exec node node week08/class1/activity8/notes_app.js
// Open http://localhost:3001
//
// GOAL: a page where you type notes and they stack up in a list. The list lives in
// the SESSION, so it survives page reloads but is private to your browser - open a
// private window and the list is empty. This uses the same pieces as 03_sessions_login.js
// (express-session) and 01_ejs_intro.js (a form + an EJS loop), minus the login.
//
// Look for the TODOs here and in views/notes.ejs.

const path = require('path');
const express = require('express');
const session = require('express-session');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set('view engine', 'ejs');
// Look for views here first, then fall back to the shared class 1 views (for the partials)
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, '..', 'views')]);
app.use(express.urlencoded({ extended: true }));

// TODO 1: add the express-session middleware (see 03_sessions_login.js).
//   secret: 'dev-secret', resave: false, saveUninitialized: false

app.get('/', (req, res) => {
  // TODO 2: make sure req.session.notes is an array (set it to [] the first time),
  //         then render 'notes' with { notes: req.session.notes }
  res.render('notes', { notes: [] }); // replace with the session array
});

// TODO 3: POST /notes
//   - read req.body.note and trim it
//   - if it isn't empty, push it onto req.session.notes
//   - redirect back to '/'

// TODO 4: POST /clear
//   - empty req.session.notes (set it to [])
//   - redirect back to '/'

app.listen(PORT, () => {
  console.log(`Session notepad on http://localhost:${PORT}`);
});
