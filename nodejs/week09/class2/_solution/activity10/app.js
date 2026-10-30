// Activity 10: mflix-lite - ANSWER KEY (all four levels)
// Run:  docker compose exec node node week09/class2/_solution/activity10/app.js
// Open http://localhost:3001

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const Movie = require('../../../class1/mflix-web/models/Movie');
const Comment = require('./models/Comment');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const PAGE_SIZE = 20;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

app.get('/', (req, res) => res.redirect('/movies'));

// LEVEL 1: paging
app.get('/movies', async (req, res) => {
  const search = str(req.query.title).slice(0, 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const filter = search ? { title: { $regex: escapeRegex(search), $options: 'i' } } : {};

  const [total, movies] = await Promise.all([
    Movie.countDocuments(filter),
    Movie.find(filter).sort({ title: 1, _id: 1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE)
      .select('title year genres imdb.rating').lean(),
  ]);
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const pageUrl = (n) => '/movies?' + new URLSearchParams({ title: search, page: n });

  res.render('movies', { title: 'Movies', movies, search, total, page, totalPages, pageUrl });
});

// LEVEL 2: top rated, reusing the movie-row partial
async function topRated() {
  return Movie.find({ type: 'movie', 'imdb.votes': { $gte: 50000 }, 'imdb.rating': { $type: 'number' } })
    .sort({ 'imdb.rating': -1, 'imdb.votes': -1 })
    .limit(20)
    .select('title year genres imdb.rating imdb.votes')
    .lean();
}

app.get('/top', async (req, res) => {
  res.render('top', { title: 'Top rated', movies: await topRated() });
});

// LEVEL 4: the same data as JSON, for public/top.js to render in the browser
app.get('/api/top', async (req, res) => {
  res.json(await topRated());
});

// LEVEL 1: comments on the movie page
async function renderMovie(res, id, { form = {}, errors = {} } = {}) {
  const movie = await Movie.findById(id).lean();
  if (!movie) return res.status(404).render('error', { title: 'Not found', message: 'No movie with that id.' });

  const [comments, commentCount] = await Promise.all([
    Comment.find({ movie_id: movie._id }).sort({ date: -1 }).limit(10).select('name text date').lean(),
    Comment.countDocuments({ movie_id: movie._id }),
  ]);
  res.render('movie', { title: movie.title, movie, comments, commentCount, form, errors });
}

app.get('/movies/:id', async (req, res) => {
  if (!isId(req.params.id)) return res.status(404).render('error', { title: 'Not found', message: 'No movie with that id.' });
  await renderMovie(res, req.params.id);
});

// LEVEL 3: add a comment
app.post('/movies/:id/comments', async (req, res) => {
  if (!isId(req.params.id)) return res.status(404).render('error', { title: 'Not found', message: 'No movie with that id.' });
  const name = str(req.body.name);
  const text = str(req.body.text);

  const errors = {};
  if (!name || name.length > 50) errors.name = 'Name is required (up to 50 characters)';
  if (!text || text.length > 1000) errors.text = 'Comment is required (up to 1000 characters)';
  if (Object.keys(errors).length > 0) {
    res.status(400);
    return renderMovie(res, req.params.id, { form: req.body, errors });
  }

  if (!(await Movie.exists({ _id: req.params.id }))) {
    return res.status(404).render('error', { title: 'Not found', message: 'No movie with that id.' });
  }
  await Comment.create({ name, text, movie_id: req.params.id });
  res.redirect(`/movies/${req.params.id}#comments`); // Post/Redirect/Get
});

app.use((req, res) => res.status(404).render('error', { title: 'Not found', message: `There's no page at ${req.originalUrl}.` }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Error', message: 'Something went wrong on the server.' });
});

mongoose
  .connect(MONGO_URL, { dbName: 'sample_mflix' })
  .then(() => app.listen(PORT, () => console.log(`mflix-lite (answer key) on http://localhost:${PORT}`)))
  .catch((err) => console.error('Could not connect to MongoDB:', err.message));
