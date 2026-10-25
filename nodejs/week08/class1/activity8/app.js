// Activity 8: Movie Night
// Run:  docker compose exec node node week08/class1/activity8/app.js
// Open http://localhost:3001
//
// GOAL: a page that lists the movies below, shows each one's genres as badges, flags the
// best ones, and filters by genre with a dropdown. Everything you need is in today's
// steps 01-05 - open them side by side.
//
// Given:      the data, partials/header.ejs + footer.ejs (Bootstrap)
// You write:  the TODOs here and in views/movies.ejs
//
// Until TODO 1 and 2 are done the page says "Cannot GET /". That's expected.

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

// Every genre, once, A-Z - for the <select> in TODO 5
const allGenres = [...new Set(movies.flatMap((m) => m.genres))].sort();

// TODO 1: wire EJS in (01_hello): the view engine, and the views folder next to this file.

// TODO 2: GET / -> render 'movies' with { title: 'Movie Night', movies }
//         The page should now show the heading and the footer.

// TODO 5 (after 3 and 4 in movies.ejs): filter by genre.
//   - read req.query.genre ('' if missing)
//   - if there is one, keep only movies whose genres include it (array.filter + includes)
//   - also pass genres: allGenres and genre to the template, for the dropdown

// TODO 6 (stretch): GET /movies/:id -> a detail page.
//   - find the movie whose id === Number(req.params.id)
//   - not found? status 404
//   - make views/movie.ejs (copy movies.ejs for the includes) showing title, year, rating, genres
//   - in movies.ejs, make each title a link to /movies/<id>

app.listen(PORT, () => {
  console.log(`Movie Night on http://localhost:${PORT}`);
});
