// Activity 5 answer key: Comments Service, all TODOs + the stretch goal
// Run (2nd terminal, while movies-api is running in the 1st):
//   docker compose exec node node week05/class2/_solution/activity5_comments_api.js
// Requests: week05/class2/_solution/activity5_comments.http

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const PORT = Number(process.env.COMMENTS_PORT) || 3002;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
// Where the movies service lives. Both run in the node container, so localhost works.
const MOVIES_API = process.env.MOVIES_API || 'http://localhost:3001/api/movies';

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
const Comment = mongoose.model('Comment', commentSchema);

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => { console.log(`${req.method} ${req.originalUrl}`); next(); });

// TODO 1: READ with pagination
app.get('/api/movies/:movieId/comments', async (req, res) => {
  const filter = { movie_id: req.params.movieId };
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const [total, results] = await Promise.all([
    Comment.countDocuments(filter),
    Comment.find(filter).sort({ date: -1, _id: 1 }).skip((page - 1) * limit).limit(limit),
  ]);

  res.json({ page, limit, total, totalPages: Math.ceil(total / limit), results });
});

// TODO 2: CREATE
app.post('/api/movies/:movieId/comments', async (req, res) => {
  // STRETCH: ask the movies service, over HTTP, whether the movie exists
  try {
    const check = await fetch(`${MOVIES_API}/${encodeURIComponent(req.params.movieId)}`);
    if (check.status === 404) return res.status(404).json({ error: 'Movie not found' });
    if (check.status === 400) return res.status(400).json({ error: 'Invalid movie id' });
  } catch {
    // The movies service is down. Our choice: refuse rather than save an unchecked comment.
    return res.status(503).json({ error: 'Movies service unavailable - try again later' });
  }

  const { name, email, text } = req.body || {};   // only the fields we want
  const comment = await Comment.create({ name, email, text, movie_id: req.params.movieId });
  res.status(201).location(`/api/comments/${comment._id}`).json(comment);
});

// TODO 3: DELETE
app.delete('/api/comments/:id', async (req, res) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  res.status(204).end();
});

app.use('/api', (req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` }));

app.use((err, req, res, next) => {
  if (err.name === 'CastError') return res.status(400).json({ error: `Invalid ${err.path}: ${JSON.stringify(err.value)}` });
  if (err.name === 'ValidationError') {
    const details = {};
    for (const [field, problem] of Object.entries(err.errors)) details[field] = problem.message;
    return res.status(400).json({ error: 'Validation failed', details });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body is not valid JSON' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

mongoose.connect(MONGO_URL, { dbName: 'sample_mflix' })
  .then(() => app.listen(PORT, () => console.log(`Comments service on http://localhost:${PORT}`)))
  .catch((err) => console.error('Could not connect to MongoDB:', err.message));
