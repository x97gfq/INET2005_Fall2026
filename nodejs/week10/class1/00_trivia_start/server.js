// Assignment 4 starter: the trivia game's server, with every endpoint STUBBED OUT.
// Each route answers 501 "Not built yet" until you write it. Fill in the TODOs, top to bottom.
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
// The welcome screen, the question area, the answer form and the score (views/index.ejs).
app.get('/', (req, res) => {
  res.render('index', { title: 'Trivia' });
});

// ---- GET /question ---------------------------------------------------------------------
// Ask the AI for a question, keep it AND its answer here, send the page only { id, question }.
app.get('/question', async (req, res) => {
  // TODO 1: call the provider (ask.js has the fetch: POST {AI_BASE_URL}/chat/completions,
  //         Authorization: Bearer AI_API_KEY, a timeout, check res.ok)
  // TODO 2: parse the text into { question, answer } (parseTrivia on the slides). null? ask again
  // TODO 3: avoid repeats: recent questions in the prompt, and/or check `asked` and ask again
  // TODO 4: const id = crypto.randomUUID(); store { id, question, answer, answered: false }
  //         and keep only the last 100 (push, then shift() when there are more than 100)
  // TODO 5: res.json({ id, question })       // never the answer
  notBuilt(res, 'GET /question');
});

// ---- POST /answer ----------------------------------------------------------------------
// Body: { id, answer }. Compare on the server; reply { correct, correctAnswer, score }.
app.post('/answer', (req, res) => {
  // TODO 1: validate: id and answer are non-empty strings, answer not huge (400 if not)
  // TODO 2: find the question in `asked` by id (404 if it isn't there)
  // TODO 3: already answered? 409: no double points. Otherwise mark it answered
  // TODO 4: compare normalize(answer) with normalize(item.answer) (normalize on the slides)
  // TODO 5: update `score` (answered++, and correct++ if right)
  // TODO 6: res.json({ correct, correctAnswer: item.answer, score })
  notBuilt(res, 'POST /answer');
});

// ---- GET /score ------------------------------------------------------------------------
app.get('/score', (req, res) => {
  // TODO: res.json(score)   (and decide: does Start Game reset it? Say so in your README)
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

