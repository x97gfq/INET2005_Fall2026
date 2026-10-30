// Class 2, step 1: the smallest face on the movies data - one list page, one detail page
// First (once):  docker compose exec node node week06/class1/00_seed_mflix.js
// Run:           docker compose exec node node week09/class1/01_movies_page.js
// Open http://localhost:3001/movies
//
// Class 1's 03_loops with the array swapped for a MongoDB query. Compare with the week 7
// API's GET /api/movies: the same Movie.find(), but the route ends in res.render()
// instead of res.json(). The server builds the HTML table and sends a finished page
// (server-side rendering). Week 6's public/index.html got JSON and built the table in the
// browser with fetch() (client-side rendering). Same data - the difference is WHERE the
// HTML gets built.

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

// Reuse the week 7 API's Movie model - no need to redefine the schema.
const Movie = require('../../week07/class2/mflix-api/models/Movie');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Home -> send people to the list
app.get('/', (req, res) => res.redirect('/movies'));

// The list, with an optional ?title= search
app.get('/movies', async (req, res, next) => {
  try {
    const search = typeof req.query.title === 'string' ? req.query.title.trim() : '';
    // escapeRegex, as in week 7: "(" or "*" in a search is text, not regex syntax
    const filter = search ? { title: { $regex: escapeRegex(search), $options: 'i' } } : {};

    const [total, movies] = await Promise.all([
      Movie.countDocuments(filter),
      Movie.find(filter).sort({ title: 1, _id: 1 }).limit(25).select('title year genres imdb.rating'),
    ]);

    // Hand the data to the template. The page comes back as finished HTML.
    res.render('movies', { movies, total, search });
  } catch (err) {
    next(err); // off to the error handler
  }
});

// One movie's detail page
app.get('/movies/:id', async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send('Movie not found');
    res.render('movie', { movie });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).send('Something went wrong');
});

mongoose
  .connect(MONGO_URL, { dbName: 'sample_mflix' })
  .then(() => app.listen(PORT, () => console.log(`Movies (EJS) on http://localhost:${PORT}/movies`)))
  .catch((err) => console.error('Could not connect to MongoDB:', err.message));
