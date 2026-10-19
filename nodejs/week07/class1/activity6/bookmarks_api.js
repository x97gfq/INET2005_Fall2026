// Activity 6: Bookmarks API
// Run:  docker compose exec node node week07/class1/activity6/bookmarks_api.js
// Test: open week07/class1/activity6/bookmarks.http and send the requests
//
// GOAL: build a small REST API for bookmarks using the pieces from class 1:
//   * an express.Router mounted at /api/bookmarks
//   * a validateBookmark middleware that rejects bad input with 400
//   * a 404 middleware and a central error handler
//
// Everything you need is in 02_router_basics.js and 03_errors_and_validation.js.
// Look for the TODOs. The in-memory array is done for you.

const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

// in-memory store (no database needed)
let bookmarks = [
  { id: 1, title: 'Express docs', url: 'https://expressjs.com', tags: ['node'] },
];
let nextId = 2;

// --- validation -------------------------------------------------------------
// TODO 1: write this middleware.
//   - title must be a non-empty string
//   - url must be a string that starts with "http"
//   - if there are errors, respond 400 with { error: 'Validation failed', details: [...] }
//     and do NOT call next()
//   - otherwise call next()
function validateBookmark(req, res, next) {
  // ...your code...
  next(); // replace with real validation
}

// --- router -----------------------------------------------------------------
const router = express.Router();

// GET /api/bookmarks  -> the whole list (done for you)
router.get('/', (req, res) => {
  res.json(bookmarks);
});

// TODO 2: GET /api/bookmarks/:id
//   - find the bookmark whose id matches req.params.id (remember Number(...))
//   - 404 with { error: 'Bookmark not found' } if there isn't one
//   - otherwise res.json(it)

// TODO 3: POST /api/bookmarks
//   - run validateBookmark first (router.post('/', validateBookmark, (req, res) => {...}))
//   - build { id: nextId++, title, url, tags: tags || [] } from req.body
//   - respond 201 with the new bookmark

// TODO 4: DELETE /api/bookmarks/:id
//   - remove it from the array, respond 204 with no body

// mount the router
app.use('/api/bookmarks', router);

// TODO 5: a 404 middleware for any route that didn't match (after the routes)

// TODO 6: the error handler (err, req, res, next) - FOUR params, placed LAST.
//   log err.message and respond 500 with { error: 'Something went wrong on the server' }

app.listen(PORT, () => {
  console.log(`Bookmarks API on http://localhost:${PORT}`);
});
