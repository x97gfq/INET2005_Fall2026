// Custom validation middleware - week07/class1/03_errors_and_validation.js, grown up.
//
// In week 6 the only check was the Mongoose schema, deep inside the route: bad data
// went all the way to Movie.create() before anything said no. Now each request is
// checked at the door, BEFORE the route runs:
//   * a bad request gets a 400 with every problem listed, and the route never runs
//   * the route can trust req.body / req.params / req.query
//   * the schema is still there as the last line of defence
//
// Each middleware follows the rule from class 1: respond (400) OR call next(). Never neither.

// ---- one rule per field --------------------------------------------------------
// A rule takes a value and returns an error message, or null if the value is fine.
// Adding a field to the API = adding one line here.

const isString = (max) => (v) =>
  typeof v !== 'string' || v.trim() === '' ? 'must be a non-empty string'
    : v.length > max ? `must be at most ${max} characters` : null;

const isInt = (min, max) => (v) =>
  !Number.isInteger(v) ? 'must be a whole number'
    : v < min || v > max ? `must be between ${min} and ${max}` : null;

const isStringArray = (v) =>
  !Array.isArray(v) || v.some((x) => typeof x !== 'string') ? 'must be an array of strings'
    : v.length > 50 ? 'must have at most 50 items' : null;

const movieRules = {
  title: isString(200),
  year: isInt(1870, 2100),
  runtime: isInt(1, 1000),
  genres: isStringArray,
  rated: isString(20),
  plot: isString(1000),
  directors: isStringArray,
  cast: isStringArray,
  type: (v) => (['movie', 'series'].includes(v) ? null : "must be 'movie' or 'series'"),
  imdb: (v) => {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) return 'must be an object';
    for (const key of Object.keys(v)) if (!['rating', 'votes'].includes(key)) return `unknown field imdb.${key}`;
    if (v.rating !== undefined && (typeof v.rating !== 'number' || v.rating < 0 || v.rating > 10)) return 'imdb.rating must be a number from 0 to 10';
    if (v.votes !== undefined && (!Number.isInteger(v.votes) || v.votes < 0)) return 'imdb.votes must be a whole number >= 0';
    return null;
  },
};

// ---- the body: POST, PUT, PATCH ------------------------------------------------
// A function that RETURNS a middleware, so one validator covers both cases:
//   validateMovie()                  POST / PUT: title is required
//   validateMovie({ partial: true }) PATCH: only check what was sent, but send something
function validateMovie({ partial = false } = {}) {
  return function (req, res, next) {
    const body = req.body;
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return res.status(400).json({ error: 'Send a JSON object with Content-Type: application/json' });
    }

    const details = {};
    for (const [field, value] of Object.entries(body)) {
      const rule = movieRules[field];
      // Unknown fields are refused, not quietly dropped: { "$set": ... } or { "isAdmin": true }
      // is either a typo or someone probing the API, and either way they should hear about it.
      if (!rule) details[field] = 'is not an allowed field';
      else {
        const problem = rule(value);
        if (problem) details[field] = `${field} ${problem}`;
      }
    }
    if (!partial && body.title === undefined) details.title = 'title is required';
    if (partial && Object.keys(body).length === 0) details.body = 'send at least one field to change';

    if (Object.keys(details).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details });
    }
    next();
  };
}

// ---- the :id in the URL ----------------------------------------------------------
// Week 6 let Mongoose throw a CastError for /api/movies/banana and turned it into a 400
// in the error handler. Checking up front is clearer, and skips the database trip.
function validateId(req, res, next) {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
    return res.status(400).json({ error: `Invalid id: ${JSON.stringify(req.params.id)} (expected 24 hex characters)` });
  }
  next();
}

// ---- the ?query string: GET /api/movies ----------------------------------------
// Query values always arrive as strings, and ?title=a&title=b arrives as an ARRAY.
function validateMovieQuery(req, res, next) {
  const details = {};
  const allowed = ['title', 'genre', 'year', 'page', 'limit'];

  for (const [key, value] of Object.entries(req.query)) {
    if (!allowed.includes(key)) details[key] = 'is not a supported filter';
    else if (typeof value !== 'string') details[key] = `${key} must be given once`;
  }
  // ?year= (empty) means "no filter", as in week 6
  const given = (v) => typeof v === 'string' && v !== '';
  const { title, genre, year, page, limit } = req.query;
  if (given(title) && title.length > 100) details.title = 'title must be at most 100 characters';
  if (given(genre) && genre.length > 50) details.genre = 'genre must be at most 50 characters';
  if (given(year) && !/^\d{4}$/.test(year)) details.year = 'year must be a 4-digit year';
  if (given(page) && !/^[1-9]\d{0,5}$/.test(page)) details.page = 'page must be a whole number >= 1';
  if (given(limit) && !(/^\d{1,3}$/.test(limit) && +limit >= 1 && +limit <= 100)) details.limit = 'limit must be 1-100';

  if (Object.keys(details).length > 0) {
    return res.status(400).json({ error: 'Invalid query', details });
  }
  next();
}

// ---- the login body: POST /api/auth/login --------------------------------------
function validateLogin(req, res, next) {
  const { username, password } = req.body || {};
  const details = {};
  if (typeof username !== 'string' || username.trim() === '' || username.length > 50) details.username = 'username is required';
  if (typeof password !== 'string' || password === '' || password.length > 200) details.password = 'password is required';
  if (Object.keys(details).length > 0) {
    return res.status(400).json({ error: 'Validation failed', details });
  }
  next();
}

module.exports = { validateMovie, validateId, validateMovieQuery, validateLogin };
