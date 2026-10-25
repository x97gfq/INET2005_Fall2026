// Activity 8: Movie Night - ANSWER KEY
// Run:  docker compose exec node node week08/class1/_solution/activity8/app.js
// Open http://localhost:3001

const path = require('path');
const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const movies = [
  { id: 1, title: 'Casablanca', year: 1942, rating: 8.5, genres: ['Drama', 'Romance'] },
  { id: 2, title: 'Singin\' in the Rain', year: 1952, rating: 8.3, genres: ['Comedy', 'Musical'] },
  { id: 3, title: 'The Godfather', year: 1972, rating: 9.2, genres: ['Crime', 'Drama'] },
  { id: 4, title: 'Alien', year: 1979, rating: 8.5, genres: ['Horror', 'Sci-Fi'] },
  { id: 5, title: 'Back to the Future', year: 1985, rating: 8.5, genres: ['Adventure', 'Comedy', 'Sci-Fi'] },
  { id: 6, title: 'Groundhog Day', year: 1993, rating: 8.0, genres: ['Comedy', 'Romance'] },
  { id: 7, title: 'The Matrix', year: 1999, rating: 8.7, genres: ['Action', 'Sci-Fi'] },
  { id: 8, title: 'Spirited Away', year: 2001, rating: 8.6, genres: ['Animation', 'Adventure'] },
  { id: 9, title: 'Mean Girls', year: 2004, rating: 7.1, genres: ['Comedy'] },
  { id: 10, title: 'Get Out', year: 2017, rating: 7.8, genres: ['Horror', 'Thriller'] },
];

// Every genre, once, A-Z - for the <select>
const allGenres = [...new Set(movies.flatMap((m) => m.genres))].sort();

// TODO 1
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// TODO 2 + TODO 5
app.get('/', (req, res) => {
  const genre = req.query.genre || '';
  const shown = genre ? movies.filter((m) => m.genres.includes(genre)) : movies;
  res.render('movies', { title: 'Movie Night', movies: shown, genres: allGenres, genre });
});

// TODO 6 (stretch)
app.get('/movies/:id', (req, res) => {
  const movie = movies.find((m) => m.id === Number(req.params.id));
  if (!movie) return res.status(404).render('movie', { title: 'Not found', movie: null });
  res.render('movie', { title: movie.title, movie });
});

app.listen(PORT, () => {
  console.log(`Movie Night (answer key) on http://localhost:${PORT}`);
});
