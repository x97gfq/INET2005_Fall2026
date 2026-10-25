// EJS 4: partials - write the header and footer once, include them on every page
// Run:  docker compose exec node node week08/class1/04_partials/app.js
// Open http://localhost:3001   and   http://localhost:3001/about
//
// Two pages, one header, one footer:
//   views/partials/header.ejs   <!DOCTYPE>, <head>, the nav       (takes a title)
//   views/partials/footer.ejs   closes what the header opened
//   views/index.ejs, about.ejs  just their own content, wrapped in two includes
//
// Change the nav once, both pages change. Same idea as include 'header.php' in PHP.
// public/style.css is a plain static file (express.static, week 6) - the header links to it.

const path = require('path');
const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); // /style.css

app.get('/', (req, res) => {
  // page: which nav link to highlight. title: goes in the <title> and the <h1>.
  res.render('index', { title: 'Movie Night', page: 'home' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About', page: 'about' });
});

app.listen(PORT, () => {
  console.log(`EJS partials on http://localhost:${PORT}`);
});
