// Movies API: a small microservice - Express + Mongoose over sample_mflix.movies
// First (once):  docker compose exec node node week05/class2/00_seed_mflix.js
// Run:           docker compose exec node node week05/class2/movies-api/server.js
// Open http://localhost:3001             front end (public/index.html)
//      http://localhost:3001/api/movies  the API
//      http://localhost:3001/api-docs    Swagger UI, built from openapi.yaml
//
// Express is unopinionated: this folder layout (models/, routes/, public/) is our
// choice, not a rule. Activity 5's comments service fits in a single file.

const path = require('path');
const fs = require('fs');

// Optional .env next to this file. Inside Docker, MONGO_URL is already set by
// docker-compose.yml, and dotenv never overwrites a variable that already exists.
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const moviesRouter = require('./routes/movies');

const PORT = Number(process.env.PORT) || 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'sample_mflix';

const app = express();

// Middleware runs on every request, in this order, before the routes
app.use(express.json());                                   // JSON request body -> req.body
app.use(express.static(path.join(__dirname, 'public')));   // the front end
app.use((req, res, next) => {                              // a one-line request log
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// The API
app.use('/api/movies', moviesRouter);

// Swagger UI: interactive docs generated from the OpenAPI description
const openapi = YAML.parse(fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8'));
app.get('/openapi.json', (req, res) => res.json(openapi));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

// Any other /api URL: JSON 404, not Express's HTML page
app.use('/api', (req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` }));

// Error handler (4 parameters): turns thrown errors into HTTP status codes
app.use((err, req, res, next) => {
  if (err.name === 'CastError') {
    // /api/movies/banana - not a valid ObjectId, or ?year=abc
    return res.status(400).json({ error: `Invalid ${err.path}: ${JSON.stringify(err.value)}` });
  }
  if (err.name === 'ValidationError') {
    // The schema said no: list each field's problem
    const details = {};
    for (const [field, problem] of Object.entries(err.errors)) details[field] = problem.message;
    return res.status(400).json({ error: 'Validation failed', details });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Connect first, then start taking requests
mongoose.connect(MONGO_URL, { dbName: DB_NAME })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Movies API on http://localhost:${PORT}  (docs: http://localhost:${PORT}/api-docs)`);
    });
  })
  .catch((err) => console.error('Could not connect to MongoDB:', err.message));
