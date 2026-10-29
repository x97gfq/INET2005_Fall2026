// EJS 5: forms - a GET search and a POST that adds a movie
// Run:  docker compose exec node node week08/class1/05_forms/app.js
// Open http://localhost:3001
//
// The two kinds of form, both rendered by the same views/movies.ejs:
//
//   <form method="GET">    reading. The inputs land in the URL: /?q=matrix -> req.query.q
//                          Bookmarkable, shareable, safe to repeat.
//   <form method="POST">   changing something. The inputs go in the request body
//                          -> req.body, once express.urlencoded() has parsed it.
//
// After a successful POST we REDIRECT instead of rendering (Post/Redirect/Get): the browser
// lands on a GET page, so pressing F5 doesn't add the same movie twice. On a FAILED post
// we render the form again, with the error messages and what they typed.
//
// The list lives in memory: restart the server and it's back to three movies.
// Next week (week 9) does exactly this against MongoDB.

const path = require('path');
const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Forms send "title=Up&year=2009" (url-encoded), not JSON. This fills req.body from it,
// the way express.json() did for the week 7 API.
app.use(express.urlencoded({ extended: false }));

const movies = [
  { title: 'Casablanca', year: 1942 },
  { title: 'The Matrix', year: 1999 },
  { title: 'Inception', year: 2010 },
];

// GET /  or  GET /?q=mat
app.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  const shown = q ? movies.filter((m) => m.title.toLowerCase().includes(q.toLowerCase())) : movies;

  // movies.ejs always expects errors and form, so pass them empty here
  res.render('movies', { movies: shown, q, errors: {}, form: {} });
});

// POST /movies   body: title=...&year=...
app.post('/movies', (req, res) => {
  // Everything from a form arrives as a STRING, even the year
  const title = (req.body.title || '').trim();
  const year = Number(req.body.year);

  // The same idea as week 7's validateMovie: check at the door, list every problem
  const errors = {};
  if (!title) errors.title = 'Title is required';
  if (!Number.isInteger(year) || year < 1870 || year > 2100) errors.year = 'Year must be a whole number from 1870 to 2100';

  if (Object.keys(errors).length > 0) {
    // 400, and the same page again: the messages plus what they typed (form)
    return res.status(400).render('movies', { movies, q: '', errors, form: req.body });
  }

  movies.push({ title, year });
  res.redirect('/'); // Post/Redirect/Get
});

app.listen(PORT, () => {
  console.log(`EJS forms on http://localhost:${PORT}`);
});
