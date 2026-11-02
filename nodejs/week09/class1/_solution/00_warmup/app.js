// Warm-up: one query, two endings - JSON like an API, HTML from an EJS template
// Code along: we type this from a blank file in week09/class1/00_warmup/ (this copy is the answer key)
// Run:  docker compose exec node node week09/class1/_solution/00_warmup/app.js
// Open http://localhost:3001            (the EJS page)
//      http://localhost:3001/api/movies (the JSON)

const path = require('path');
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const client = new MongoClient(process.env.MONGO_URL);
const movies = client.db('sample_mflix').collection('movies');

// Like an API: send the query results as JSON
app.get('/api/movies', async (req, res) => {
  const results = await movies.find({ year: 1999 }).limit(10).toArray();
  res.json(results);
});

// Like a website: push the query results into views/home.ejs and send the finished HTML
app.get('/', async (req, res) => {
  const results = await movies.find({ year: 1999 }).limit(10).toArray();
  res.render('home', { movies: results });
});

app.listen(3001, () => console.log('Warm-up on http://localhost:3001'));
