// /api/movies routes: Create, Read, Update, Delete -> POST, GET, PUT/PATCH, DELETE
//
// The week 6 routes, unchanged inside. What's new is the MIDDLEWARE in front of each
// handler. Read a route left to right - each step either says no, or calls next():
//
//   router.delete('/:id', requireJwt, requireRole('admin'), validateId, handler)
//                         who are you?  are you allowed?     is the id ok?  do it
//
// Order matters: check WHO first, so a stranger gets 401 and learns nothing about
// what a valid request would look like.
//
//   GET     anyone              (reading is public, as in week 6)
//   POST    editor or admin
//   PUT     editor or admin
//   PATCH   editor or admin
//   DELETE  admin only
//
// Express 5 passes any error thrown in an async route to the error handler in
// server.js, so these routes don't need their own try/catch.

const express = require('express');
const Movie = require('../models/Movie');
const { listMovies } = require('../services/movies');
const { requireJwt, requireRole } = require('../middleware/auth');
const { validateMovie, validateId, validateMovieQuery } = require('../middleware/validate');
const logger = require('../logger');

const router = express.Router();

const canEdit = [requireJwt, requireRole('editor', 'admin')]; // an array of middleware works too

// Only these fields may reach the database. validateMovie already refuses anything
// else; this is a second lock on the same door, in case a validator is ever loosened.
const FIELDS = ['title', 'year', 'runtime', 'genres', 'rated', 'plot', 'directors', 'cast', 'imdb', 'type'];

function pickFields(body) {
  const picked = {};
  for (const field of FIELDS) {
    if (body && body[field] !== undefined) picked[field] = body[field];
  }
  return picked;
}

// READ (many):  GET /api/movies?title=matrix&genre=Sci-Fi&year=1999&page=1&limit=20
router.get('/', validateMovieQuery, async (req, res) => {
  // The query itself moved to services/movies.js in week 8, so the EJS pages share it
  res.json(await listMovies({
    title: req.query.title,
    genre: req.query.genre,
    year: req.query.year,
    page: Number(req.query.page) || 1,    // validateMovieQuery made sure these are sane
    limit: Number(req.query.limit) || 20,
  }));
});

// READ (one):  GET /api/movies/573a139bf29313caabcf3d23
router.get('/:id', validateId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
});

// CREATE:  POST /api/movies   body: { "title": "...", "year": 2026, ... }
router.post('/', canEdit, validateMovie(), async (req, res) => {
  const movie = await Movie.create(pickFields(req.body));
  // An audit trail: WHO changed WHAT. req.user came from the token.
  logger.info('Movie created', { id: movie._id.toString(), title: movie.title, by: req.user.sub });
  res.status(201).location(`/api/movies/${movie._id}`).json(movie);
});

// UPDATE (replace):  PUT /api/movies/:id - the body becomes the whole movie.
router.put('/:id', canEdit, validateId, validateMovie(), async (req, res) => {
  const movie = await Movie.findOneAndReplace({ _id: req.params.id }, pickFields(req.body), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  logger.info('Movie replaced', { id: req.params.id, by: req.user.sub });
  res.json(movie);
});

// UPDATE (partial):  PATCH /api/movies/:id - only the fields you send change
router.patch('/:id', canEdit, validateId, validateMovie({ partial: true }), async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, { $set: pickFields(req.body) }, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  logger.info('Movie updated', { id: req.params.id, fields: Object.keys(req.body), by: req.user.sub });
  res.json(movie);
});

// DELETE:  DELETE /api/movies/:id -> 204 No Content.  Admins only.
router.delete('/:id', requireJwt, requireRole('admin'), validateId, async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  logger.info('Movie deleted', { id: req.params.id, title: movie.title, by: req.user.sub });
  res.status(204).end();
});

module.exports = router;
