// EJS 2: pass an object, print its fields, make a decision - and escape what users typed
// Run:  docker compose exec node node week08/class1/02_data/app.js
// Open http://localhost:3001
//
// One movie, shaped like a document from sample_mflix (week 6). Next class this object
// comes out of MongoDB instead of being typed in here - the template won't change.
//
// The tags in views/movie.ejs:
//   <%= value %>   print it, HTML-escaped     (use this for anything a user typed)
//   <%- value %>   print it RAW, as HTML      (only for HTML you wrote yourself)
//   <% code %>     run JavaScript, print nothing  (if / else, loops)

const path = require('path');
const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const movie = {
  title: 'The Matrix',
  year: 1999,
  rated: 'R',
  runtime: 136,
  genres: ['Action', 'Sci-Fi'],
  imdb: { rating: 8.7 },
  plot: 'A hacker finds out that the world he lives in is a simulation, and joins the rebels fighting the machines that built it.',
};

// A review someone typed into a form. It has HTML in it - and a script.
const review = 'Loved it! <b>10/10</b> <script>alert("Gotcha - this script ran in your browser")</script>';

app.get('/', (req, res) => {
  res.render('movie', { movie, review });
});

app.listen(PORT, () => {
  console.log(`EJS data on http://localhost:${PORT}`);
});
