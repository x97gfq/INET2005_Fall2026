// EJS 3: a list - loop over an array, and handle the empty case
// Run:  docker compose exec node node week08/class1/03_loops/app.js
// Open http://localhost:3001   and   http://localhost:3001/empty
//
// An array of movies, like the "results" array the week 7 API returns from
// GET /api/movies. In views/movies.ejs a forEach writes one table row per movie.

const path = require('path');
const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const movies = [
  { title: 'Casablanca', year: 1942, rating: 8.5 },
  { title: 'The Godfather', year: 1972, rating: 9.2 },
  { title: 'Back to the Future', year: 1985, rating: 8.5 },
  { title: 'The Matrix', year: 1999, rating: 8.7 },
  { title: 'Spirited Away', year: 2001, rating: 8.6 },
  { title: 'Inception', year: 2010, rating: 8.8 },
];

app.get('/', (req, res) => {
  res.render('movies', { movies });
});

// Same template, no movies: shows the empty state instead of an empty table
app.get('/empty', (req, res) => {
  res.render('movies', { movies: [] });
});

app.listen(PORT, () => {
  console.log(`EJS loops on http://localhost:${PORT}`);
});
