// Activity 8 ANSWER KEY: Session Notepad
// Run:  docker compose exec node node week08/class1/_solution/activity8_notes_app.js

const path = require('path');
const express = require('express');
const session = require('express-session');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set('view engine', 'ejs');
// This solution's own views first (completed notes.ejs), then the shared partials
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, '..', 'views')]);
app.use(express.urlencoded({ extended: true }));

// TODO 1
app.use(
  session({
    secret: 'dev-secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.get('/', (req, res) => {
  // TODO 2
  if (!req.session.notes) req.session.notes = [];
  res.render('notes', { notes: req.session.notes });
});

// TODO 3
app.post('/notes', (req, res) => {
  const note = (req.body.note || '').trim();
  if (note) {
    if (!req.session.notes) req.session.notes = [];
    req.session.notes.push(note);
  }
  res.redirect('/');
});

// TODO 4
app.post('/clear', (req, res) => {
  req.session.notes = [];
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Session notepad (solution) on http://localhost:${PORT}`);
});
