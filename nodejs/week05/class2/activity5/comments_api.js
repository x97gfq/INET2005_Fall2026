// Activity 5: Comments Service - a second microservice, on its own port
// Run (2nd terminal, while movies-api is running in the 1st):
//   docker compose exec node node week05/class2/activity5/comments_api.js
// Try: http://localhost:3002/api/movies/573a139bf29313caabcf3d23/comments
// Then click a movie on http://localhost:3001 - its comments come from HERE.
//
// Everything in one file this time. Express doesn't mind: compare with the
// models/ + routes/ layout of movies-api. Both are fine.

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const PORT = Number(process.env.COMMENTS_PORT) || 3002;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';

// The documents in sample_mflix.comments look like this already
const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
    movie_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    date: { type: Date, default: Date.now },
  },
  { versionKey: false }
);
const Comment = mongoose.model('Comment', commentSchema); // -> collection 'comments'

const app = express();
app.use(cors());          // the movie page on :3001 calls us on :3002 - a different origin
app.use(express.json());
app.use((req, res, next) => { console.log(`${req.method} ${req.originalUrl}`); next(); });

// READ: the newest comments for one movie (no Router this time - routes go straight on app)
app.get('/api/movies/:movieId/comments', async (req, res) => {
  const comments = await Comment.find({ movie_id: req.params.movieId })
    .sort({ date: -1 })
    .limit(10);
  res.json(comments);

  // TODO 1: pagination, exactly like GET /api/movies in movies-api/routes/movies.js
  //   - read ?page and ?limit (default 1 and 10, limit at most 50)
  //   - use .skip() and .limit(), and countDocuments() for the total
  //   - respond with { page, limit, total, totalPages, results }
});

// TODO 2: CREATE - POST /api/movies/:movieId/comments
//   body: { "name": "...", "email": "...", "text": "..." }
//   - movie_id comes from the URL, not the body; date is set by the schema default
//   - only take name, email and text from req.body (never the whole body)
//   - respond 201 with the new comment

// TODO 3: DELETE - DELETE /api/comments/:id
//   - 204 if it was deleted, 404 { "error": "Comment not found" } if there was no such comment

// TODO 4: add requests for your new routes to week05/class2/activity5/comments.http
//   and run each one. Include one that should fail with a 400.

// STRETCH: before saving a comment, ask the MOVIES service whether the movie exists:
//   const r = await fetch(`http://localhost:3001/api/movies/${req.params.movieId}`);
//   r.status 404 -> respond 404 { "error": "Movie not found" }
//   This is how microservices talk: over HTTP, not by reading each other's collections.

// Errors -> status codes (same idea as movies-api/server.js)
app.use((err, req, res, next) => {
  if (err.name === 'CastError') return res.status(400).json({ error: `Invalid ${err.path}: ${JSON.stringify(err.value)}` });
  if (err.name === 'ValidationError') {
    const details = {};
    for (const [field, problem] of Object.entries(err.errors)) details[field] = problem.message;
    return res.status(400).json({ error: 'Validation failed', details });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

mongoose.connect(MONGO_URL, { dbName: 'sample_mflix' })
  .then(() => app.listen(PORT, () => console.log(`Comments service on http://localhost:${PORT}`)))
  .catch((err) => console.error('Could not connect to MongoDB:', err.message));
