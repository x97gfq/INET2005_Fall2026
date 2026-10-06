// /api/movies routes: Create, Read, Update, Delete -> POST, GET, PUT/PATCH, DELETE
//
// Express 5 passes any error thrown in an async route to the error handler in
// server.js, so these routes don't need their own try/catch.

const express = require('express');
const Movie = require('../models/Movie');

const router = express.Router();

// Only these fields may come from a request body. Anything else ({ "_id": ... },
// { "$set": ... }, { "isAdmin": true }) is dropped before it reaches the database.
const FIELDS = ['title', 'year', 'runtime', 'genres', 'rated', 'plot', 'directors', 'cast', 'imdb', 'type'];

function pickFields(body) {
  const picked = {};
  for (const field of FIELDS) {
    if (body && body[field] !== undefined) picked[field] = body[field];
  }
  return picked;
}

// "Matrix" should match "The Matrix" - but "(" or "*" in a search must not be regex syntax
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// READ (many):  GET /api/movies?title=matrix&genre=Sci-Fi&year=1999&page=1&limit=20
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.title) filter.title = { $regex: escapeRegex(String(req.query.title)), $options: 'i' };
  if (req.query.genre) filter.genres = String(req.query.genre);
  if (req.query.year) filter.year = String(req.query.year); // Mongoose casts it (or throws a CastError)

  // Pagination: page 1 = documents 0-19, page 2 = 20-39 ...
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  // Two queries at once: how many match in total, and this page of them.
  // _id in the sort keeps the order identical between requests, so no movie
  // shows up on two pages (lots of movies share a title).
  const [total, results] = await Promise.all([
    Movie.countDocuments(filter),
    Movie.find(filter)
      .sort({ title: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .select('title year genres runtime rated imdb.rating'),
  ]);

  res.json({ page, limit, total, totalPages: Math.ceil(total / limit), results });
});

// READ (one):  GET /api/movies/573a139bf29313caabcf3d23
router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
});

// CREATE:  POST /api/movies   body: { "title": "...", "year": 2026, ... }
router.post('/', async (req, res) => {
  const movie = await Movie.create(pickFields(req.body)); // validates against the schema first
  res.status(201).location(`/api/movies/${movie._id}`).json(movie);
});

// UPDATE (replace):  PUT /api/movies/:id - the body becomes the whole movie.
// Fields you leave out are gone afterwards.
router.put('/:id', async (req, res) => {
  const movie = await Movie.findOneAndReplace({ _id: req.params.id }, pickFields(req.body), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
});

// UPDATE (partial):  PATCH /api/movies/:id - only the fields you send change
router.patch('/:id', async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, { $set: pickFields(req.body) }, {
    returnDocument: 'after',
    runValidators: true, // without this, updates skip the schema rules
  });
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
});

// DELETE:  DELETE /api/movies/:id -> 204 No Content
router.delete('/:id', async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.status(204).end();
});

module.exports = router;
