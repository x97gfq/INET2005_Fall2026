// Week 11: the API half of our MERN app (MongoDB, Express, React, Node).
// The APP half is the React app in react/mflix-react. Two programs, two folders, two .env files;
// the only thing they share is the API contract (README.md, and requests.http to try it).
//
// ANSWER KEY: the same as week11/api/server.js (students now get POST complete; class 1 builds the React form).
// Run:  docker compose exec node node week11/_solution/api/server.js   -> http://localhost:3001/api/movies

const path = require('path');
// This project's settings live in its own .env (copy .env.example). quiet: no "injecting env" line.
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const { MongoClient } = require('mongodb');

// Settings: from .env, or from docker-compose.yml (MONGO_URL), or a default.
const PORT = Number(process.env.PORT) || 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'sample_mflix';

const client = new MongoClient(MONGO_URL);
const movies = client.db(DB_NAME).collection('movies');

const app = express();
app.use(express.json({ limit: '10kb' })); // a JSON body becomes req.body

// Only the fields the app shows. Never send a whole document "just in case".
const FIELDS = { title: 1, year: 1, genres: 1, 'imdb.rating': 1 };

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
  const movie = { title, year, genres: Array.isArray(genres) ? genres.map((g) => g.trim()) : [], addedBy: 'week11' };
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

// Anything else under /api: JSON, not Express's HTML page
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// A bad JSON body, or Mongo is down: JSON again, and the details stay in the terminal
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'The body is not valid JSON.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}/api/movies (database ${DB_NAME})`));
