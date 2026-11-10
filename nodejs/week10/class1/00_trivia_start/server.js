// Assignment 4 starter: the trivia game's server, with every endpoint STUBBED OUT.
// Each route answers 501 "Not built yet" until you write it. 
//
// Run:   docker compose exec node node week10/class1/00_trivia_start/server.js
// Open:  http://localhost:3001
// Same .env as ask.js (this folder): AI_BASE_URL, AI_API_KEY, AI_MODEL.
//
// Copy this folder into your own project when you're ready; it's a starting point, not the answer.
// The class 1 slides have the pieces: parseTrivia(), remember() (the last 100), normalize(), the score.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const crypto = require('crypto');
const express = require('express');

const { AI_BASE_URL, AI_API_KEY, AI_MODEL } = process.env;
const PORT = Number(process.env.PORT) || 3001;

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json({ limit: '10kb' }));               // POST /answer sends JSON
app.use(express.static(path.join(__dirname, 'public'))); // public/game.js, your CSS

// ---- what the server remembers (in memory: a restart forgets it) ---------------------
const asked = [];                              // the last 100: { id, question, answer, answered }
const score = { correct: 0, answered: 0 };

// A stub's reply: says which route still needs writing
function notBuilt(res, what) {
  res.status(501).json({ error: `Not built yet: ${what}` });
}

// ---- the page --------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.render('index', { title: 'Trivia' });
});

// ---- GET /question ---------------------------------------------------------------------
// Ask the AI for a question, keep it AND its answer here, send the page only { id, question }.
app.get('/question', async (req, res) => {
  //
  //
  notBuilt(res, 'GET /question');
});

// ---- POST /answer ----------------------------------------------------------------------
// Body: { id, answer }. Compare on the server; reply { correct, correctAnswer, score }.
app.post('/answer', (req, res) => {
  //
  //
  notBuilt(res, 'POST /answer');
});

// ---- GET /score ------------------------------------------------------------------------
app.get('/score', (req, res) => {
  //
  //
  notBuilt(res, 'GET /score');
});

// ---- errors ----------------------------------------------------------------------------
// fetch() throws when the provider doesn't answer at all (offline, wrong host, timeout).
// Log the details here; give the page a polite message.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Try again.' });
});

app.listen(PORT, () => {
  console.log(`Trivia on http://localhost:${PORT}`);
  console.log(AI_API_KEY ? `AI: ${AI_MODEL} at ${AI_BASE_URL}` : 'AI: not set up yet (copy .env.example to .env)');
});

