// Activity 10: mflix-lite - the week 9 lab
// First (once):  docker compose exec node node week06/class1/00_seed_mflix.js
// Run:           docker compose exec node node week09/class2/activity10/app.js
// Open http://localhost:3001
//
// A small, read-mostly face on sample_mflix. The list and the movie page already work.
// Work through the levels in order; LAB.md (one folder up) has the details and hints.
//
//   LEVEL 1  paging on the list, and the movie's comments on its page   (everyone)
//   LEVEL 2  a movie-row partial, and a Top rated page that reuses it
//   LEVEL 3  a form to add a comment (validation + Post/Redirect/Get)
//   LEVEL 4  the Top rated page again, built in the browser with fetch()  (stretch)
//
// Models: Movie is mflix-web's (class 2); Comment is in models/Comment.js (given).

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const Movie = require('../../class1/mflix-web/models/Movie');
const Comment = require('./models/Comment');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const PAGE_SIZE = 20;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const str = (v) => (typeof v === 'string' ? v.trim() : ''); // ?title[]=x arrives as an array: ignore it
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

app.get('/', (req, res) => res.redirect('/movies'));

app.get('/movies', async (req, res) => {
  const search = str(req.query.title).slice(0, 100);
  const filter = search ? { title: { $regex: escapeRegex(search), $options: 'i' } } : {};

  // TODO LEVEL 1a: paging.
  //   - read ?page= (parseInt, at least 1)
  //   - skip((page - 1) * PAGE_SIZE) before the limit
  //   - work out totalPages, and pass page, totalPages and a pageUrl(n) function to the
  //     template. pageUrl keeps the search:  '/movies?' + new URLSearchParams({ title: search, page: n })
  //   (mflix-web's routes/pages.js does exactly this.)
  const [total, movies] = await Promise.all([
    Movie.countDocuments(filter),
    Movie.find(filter).sort({ title: 1, _id: 1 }).limit(PAGE_SIZE).select('title year genres imdb.rating').lean(),
  ]);

  res.render('movies', { title: 'Movies', movies, search, total });
});

// TODO LEVEL 2b: GET /top -> render 'top' with the 20 best-rated MOVIES (type: 'movie')
//   that have at least 50,000 IMDb votes ('imdb.votes': { $gte: 50000 }), best first.
//   Put the query in a function topRated() - level 4 uses it again.

// TODO LEVEL 4: GET /api/top -> res.json(await topRated()), then write public/top.js

app.get('/movies/:id', async (req, res) => {
  if (!isId(req.params.id)) return res.status(404).render('error', { title: 'Not found', message: 'No movie with that id.' });

  const movie = await Movie.findById(req.params.id).lean();
  if (!movie) return res.status(404).render('error', { title: 'Not found', message: 'No movie with that id.' });

  // TODO LEVEL 1b: the comments for this movie.
  //   - Comment.find({ movie_id: movie._id }), newest first (date: -1), at most 10,
  //     only the fields name, text and date (NOT email)
  //   - and Comment.countDocuments(...) for the total
  //   - pass comments and commentCount to the template
  // TODO LEVEL 3: the template's form needs form and errors too - pass {} for both here.
  res.render('movie', { title: movie.title, movie });
});

// TODO LEVEL 3: POST /movies/:id/comments
//   - name and text are required (trim them); name up to 50 characters, text up to 1000
//   - problems? status 400 and render the movie page again with errors + what they typed
//     (you'll want the movie + comments code above in a function, so both routes can use it)
//   - fine? Comment.create({ name, text, movie_id: req.params.id }), then
//     redirect to /movies/<id>#comments

app.use((req, res) => res.status(404).render('error', { title: 'Not found', message: `There's no page at ${req.originalUrl}.` }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Error', message: 'Something went wrong on the server.' });
});

mongoose
  .connect(MONGO_URL, { dbName: 'sample_mflix' })
  .then(() => app.listen(PORT, () => console.log(`mflix-lite on http://localhost:${PORT}`)))
  .catch((err) => console.error('Could not connect to MongoDB:', err.message));
