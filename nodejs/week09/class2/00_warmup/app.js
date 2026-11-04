// Warm-up: register, log in, log out - and the movies come from the API, with a JWT
// Code along: this is where last class's warm-up finished. We change it together (answer key: ../_solution/00_warmup)
// Fell behind? README.md lists the TODOs. Each one is marked the same way in the answer key, so search for "TODO Part 2"
// Terminal 1:  docker compose exec node node week09/class2/mflix-api/server.js
// Terminal 2:  docker compose exec node node week09/class2/00_warmup/app.js
// Open http://localhost:3001

const path = require('path');
const express = require('express');
// TODO Part 1: replace the MongoClient require with express-session, and add the API constant
const { MongoClient } = require('mongodb');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// TODO Part 1: add express.urlencoded() and the session middleware
// TODO Part 7: add middleware that copies req.session.username into res.locals

// TODO Part 1: delete the client, the movies collection and the /api/movies route
const client = new MongoClient(process.env.MONGO_URL);
const movies = client.db('sample_mflix').collection('movies');

// Like an API: send the query results as JSON
app.get('/api/movies', async (req, res) => {
  const results = await movies.find({ year: 1999 }).limit(10).toArray();
  res.json(results);
});

// TODO Part 3: add GET /register, POST /register and GET /login
// TODO Part 4: add POST /login, and keep the JWT in req.session.token

// TODO Part 5: send a visitor with no token to /login, then fetch() the movies from the API with the token
// Like a website: push the query results into views/home.ejs and send the finished HTML
app.get('/', async (req, res) => {
  const results = await movies.find({ year: 1999 }).limit(10).toArray();
  res.render('home', { movies: results });
});

// TODO Part 6: add POST /logout: revoke the token at the API, then destroy the session
// TODO Part 6: add the error middleware for when the API isn't running

app.listen(3001, () => console.log('Warm-up on http://localhost:3001'));
