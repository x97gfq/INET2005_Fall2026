// Week 12: the API half of our MERN app, now with a login.
// The APP half is your React app in react/app. Two programs, two folders, two .env files;
// the only thing they share is the API contract (README.md, and requests.http to try it).
//
// ANSWER KEY, end of class 1: week 11's GET, POST, DELETE, plus POST /api/login (bcrypt.compare, then jwt.sign).
// POST and DELETE are still open to anyone: class 2 adds requireAuth (see _solution/class2).
// Run:  docker compose exec node node week12/_solution/class1/server.js   -> http://localhost:3001/api/movies

const path = require('path');
// The settings live in week12/api/.env (copy .env.example). quiet: no "injecting env" line.
require('dotenv').config({ path: path.join(__dirname, '..', '..', 'api', '.env'), quiet: true });

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Settings: from .env, or from docker-compose.yml (MONGO_URL), or a default.
const PORT = Number(process.env.PORT) || 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'sample_mflix';

// The secret that signs every token. Anyone who has it can make a token for anyone, so it lives in .env
// (git-ignored), never in the code. No secret: refuse to start rather than sign with nothing.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('Set JWT_SECRET in week12/api/.env (32+ characters). See .env.example for how to make one.');
  process.exit(1);
}

const client = new MongoClient(MONGO_URL);
const movies = client.db(DB_NAME).collection('movies');
const users = client.db(DB_NAME).collection('users'); // sample_mflix's users, plus the ones add-user.js adds

const app = express();
app.use(express.json({ limit: '10kb' })); // a JSON body becomes req.body

// Only the fields the app shows. Never send a whole document "just in case".
const FIELDS = { title: 1, year: 1, genres: 1, 'imdb.rating': 1 };

// POST /api/login  { email, password } -> 200 { token, name }
//                                      -> 400 { error } a field is missing
//                                      -> 401 { error } wrong email or password (the same message for both)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // 1. Find the user. The database only has a hash of the password, never the password.
  const user = await users.findOne({ email: email.trim().toLowerCase() });

  // 2. bcrypt.compare hashes what was typed the same way and compares. No user, or no match: one answer,
  //    so nobody can use this route to find out which emails have an account.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Wrong email or password.' });
  }

  // 3. Sign a token: who it's for (sub), their name, and when it stops working. Not secret (anyone can
  //    read it at jwt.io), but nobody can change it without the secret: the signature would not match.
  const token = jwt.sign({ sub: user._id.toString(), name: user.name }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, name: user.name });
});

// GET /api/movies?title=star -> 200 [ { _id, title, year, genres, imdb } ]  (at most 20)
// Newest _id first, so a movie you just added is at the top.
app.get('/api/movies', async (req, res) => {
  const filter = {};
  const title = String(req.query.title || '').trim();
  if (title) {
    // Escape regex characters so "(500)" means the text (500), not a regex group.
    const safe = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: safe, $options: 'i' };
  }
  const results = await movies.find(filter).project(FIELDS).sort({ _id: -1 }).limit(20).toArray();
  res.json(results);
});

// The same rules as the React form. The form's checks are for the user; these are the real ones,
// because anyone can send a POST without our form (requests.http does).
function validateMovie(body) {
  const errors = {};
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const year = Number(body.year);
  const genres = body.genres === undefined ? [] : body.genres;
  const maxYear = new Date().getFullYear() + 5;

  if (!title) errors.title = 'Title is required.';
  else if (title.length > 200) errors.title = 'Title must be 200 characters or fewer.';

  if (!Number.isInteger(year) || year < 1888 || year > maxYear) {
    errors.year = `Year must be a whole number from 1888 to ${maxYear}.`;
  }

  if (!Array.isArray(genres) || genres.length > 5 ||
      !genres.every((g) => typeof g === 'string' && g.trim() && g.length <= 30)) {
    errors.genres = 'Genres must be a list of up to 5 short words.';
  }

  // Build the document from the fields we checked. Nothing else from the body gets in.
  const movie = { title, year, genres: Array.isArray(genres) ? genres.map((g) => g.trim()) : [], addedBy: 'week12' };
  return { errors, movie };
}

// POST /api/movies  { title, year, genres } -> 201 the new movie (with its _id)
//                                            -> 400 { errors: { field: message } }
app.post('/api/movies', async (req, res) => {
  const { errors, movie } = validateMovie(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  const result = await movies.insertOne(movie);
  res.status(201).json({ _id: result.insertedId, ...movie });
});

// DELETE /api/movies/:id -> 204 (deleted, no body)
//                        -> 400 { error } when :id can't be a MongoDB _id
//                        -> 404 { error } when no movie has that _id
app.delete('/api/movies/:id', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'That is not a valid movie id.' });
  }
  const result = await movies.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'No movie with that id.' });
  }
  res.status(204).end();
});

// TODO (class 2): requireAuth: POST and DELETE answer 401 without a good token. GET stays public.
//   1. function requireAuth(req, res, next) { ... }, ABOVE the routes that use it
//      - const [scheme, token] = (req.get('Authorization') || '').split(' ');
//      - scheme !== 'Bearer' or no token                              -> 401 { error: 'Log in first.' }
//      - try { req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }); next(); }
//        catch { 401 }   (verify throws when the signature doesn't match or the token has expired)
//   2. Put it between the path and the handler:  app.post('/api/movies', requireAuth, async (req, res) => ...)
//                                                app.delete('/api/movies/:id', requireAuth, async (req, res) => ...)

// Anything else under /api: JSON, not Express's HTML page
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// A bad JSON body, or Mongo is down: JSON again, and the details stay in the terminal
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'The body is not valid JSON.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}/api/movies (database ${DB_NAME})`));
