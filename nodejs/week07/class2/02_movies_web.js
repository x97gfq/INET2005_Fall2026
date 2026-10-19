// EJS 2: a real page rendered from the database
// First (once):  docker compose exec node node week06/class1/00_seed_mflix.js
// Run:           docker compose exec node node week07/class2/02_movies_web.js
// Open http://localhost:3001/movies
//
// This is the week 6 movies API turned inside out. Week 6: the browser asked the API
// for JSON and built the table itself (client-side rendering). Here: the server queries
// Mongo, renders the HTML table with EJS, and sends a finished page (server-side rendering).
// Same data, same Mongoose model - the difference is WHERE the HTML gets built.

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

// Reuse the exact Movie model from week 6 - no need to redefine the schema.
const Movie = require('../../week06/class1/movies-api/models/Movie');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Home -> send people to the list
app.get('/', (req, res) => res.redirect('/movies'));

// The list, with an optional ?title= search
app.get('/movies', async (req, res, next) => {
  try {
    const search = (req.query.title || '').trim();
    const filter = search ? { title: { $regex: search, $options: 'i' } } : {};

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
