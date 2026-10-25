// The pages: the same movies as /api/movies, as HTML built on the server with EJS.
//
//   GET  /movies               the list: search, genre, paging    anyone
//   GET  /movies/:id           one movie                          anyone
//   GET  /movies/new           empty form                         editor, admin
//   POST /movies               create -> redirect to the movie    editor, admin
//   GET  /movies/:id/edit      filled-in form                     editor, admin
//   POST /movies/:id/edit      update -> redirect to the movie    editor, admin
//   POST /movies/:id/delete    delete -> redirect to the list     admin
//   GET  /login, POST /login   session login
//   POST /logout               session logout
//
// Put this next to routes/movies.js. Each route does the same job as its API twin, with
// the same Movie model, the same rules (movieProblems) and the same query (listMovies).
// Three differences:
//   * the last line is res.render() or res.redirect(), not res.json()
//   * HTML forms can only send GET and POST - so edit and delete are POSTs to their own
//     URLs, where the API uses PUT/PATCH and DELETE
//   * who you are comes from the session cookie, not a bearer token

const express = require('express');
const Movie = require('../models/Movie');
const { listMovies, listGenres } = require('../services/movies');
const { movieProblems } = require('../middleware/validate');
const { requireLogin, requirePageRole } = require('../middleware/pages');
const { pageLoginLimiter, loginKey } = require('../middleware/rateLimit');
const { checkPassword } = require('../users');
const logger = require('../logger');

const router = express.Router();

const canEdit = [requireLogin, requirePageRole('editor', 'admin')];

// ---- forms <-> movies ---------------------------------------------------------------
// A form sends every field as a string: year=1999, genres=Action, Sci-Fi. The API's rules
// expect numbers and arrays, so convert first, then check with the very same rules.
// An empty box means "not set".

const str = (v) => (typeof v === 'string' ? v.trim() : ''); // ?title[]=x arrives as an array: ignore it
const list = (v) => str(v).split(',').map((s) => s.trim()).filter(Boolean);

// form body -> { movie, empty }: the movie to check and save, and the fields left blank
function fromForm(body) {
  const movie = {};
  const empty = [];
  for (const f of ['title', 'rated', 'plot']) str(body[f]) ? (movie[f] = str(body[f])) : empty.push(f);
  for (const f of ['year', 'runtime']) str(body[f]) ? (movie[f] = Number(str(body[f]))) : empty.push(f);
  for (const f of ['genres', 'directors', 'cast']) list(body[f]).length ? (movie[f] = list(body[f])) : empty.push(f);
  if (str(body.rating)) movie.imdb = { rating: Number(str(body.rating)) };
  else empty.push('imdb.rating');
  return { movie, empty };
}

// movie from the database -> the strings the form's inputs show
function toForm(m) {
  return {
    title: m.title || '', year: m.year ?? '', runtime: m.runtime ?? '', rated: m.rated || '', plot: m.plot || '',
    genres: (m.genres || []).join(', '), directors: (m.directors || []).join(', '), cast: (m.cast || []).join(', '),
    rating: m.imdb && m.imdb.rating !== undefined ? m.imdb.rating : '',
  };
}

// The pages' version of validateId: a bad id is just a page that doesn't exist
const isId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
const notFound = (res) => res.status(404).render('error', { title: 'Not found', status: 404, message: 'No movie with that id.' });

// ---- READ ---------------------------------------------------------------------------

router.get('/', (req, res) => res.redirect('/movies'));

// GET /movies?title=matrix&genre=Sci-Fi&page=2
router.get('/movies', async (req, res) => {
  const title = str(req.query.title).slice(0, 100);
  const genre = str(req.query.genre).slice(0, 50);
  const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), 100000);

  const [data, genres] = await Promise.all([listMovies({ title, genre, page, limit: 20 }), listGenres()]);

  // The link to another page of the SAME search: keep title and genre, change page
  const pageUrl = (n) => '/movies?' + new URLSearchParams({ title, genre, page: n });

  res.render('movies', { title: 'Movies', ...data, search: title, genre, genres, pageUrl });
});

// /movies/new BEFORE /movies/:id - otherwise "new" would be taken for an id
router.get('/movies/new', canEdit, (req, res) => {
  res.render('movie-form', { title: 'Add a movie', action: '/movies', form: {}, errors: {} });
});

router.get('/movies/:id', async (req, res) => {
  if (!isId(req.params.id)) return notFound(res);
  // .lean(): a plain object with ALL the document's fields (fullplot, awards...), not
  // just the ones in the schema
  const movie = await Movie.findById(req.params.id).lean();
  if (!movie) return notFound(res);
  res.render('movie', { title: movie.title, movie });
});

// ---- CREATE -------------------------------------------------------------------------

router.post('/movies', canEdit, async (req, res) => {
  const { movie } = fromForm(req.body);
  const errors = movieProblems(movie);
  if (Object.keys(errors).length > 0) {
    // 400 and the same form again: the messages, and what they typed
    return res.status(400).render('movie-form', { title: 'Add a movie', action: '/movies', form: req.body, errors });
  }

  const created = await Movie.create(movie);
  logger.info('Movie created', { id: created._id.toString(), title: created.title, by: req.session.user.username, via: 'page' });
  req.session.flash = { type: 'success', message: `Added "${created.title}".` };
  res.redirect(`/movies/${created._id}`); // Post/Redirect/Get, as in class 1's 05_forms
});

// ---- UPDATE -------------------------------------------------------------------------

router.get('/movies/:id/edit', canEdit, async (req, res) => {
  if (!isId(req.params.id)) return notFound(res);
  const movie = await Movie.findById(req.params.id).lean();
  if (!movie) return notFound(res);
  res.render('movie-form', { title: `Edit ${movie.title}`, action: `/movies/${movie._id}/edit`, form: toForm(movie), errors: {} });
});

router.post('/movies/:id/edit', canEdit, async (req, res) => {
  if (!isId(req.params.id)) return notFound(res);
  const action = `/movies/${req.params.id}/edit`;
  const { movie, empty } = fromForm(req.body);
  const errors = movieProblems(movie);
  if (Object.keys(errors).length > 0) {
    return res.status(400).render('movie-form', { title: 'Edit movie', action, form: req.body, errors });
  }

  // Change only what the form shows: set the filled-in fields, remove the emptied ones.
  // (Replacing the whole document would wipe fields the form doesn't have: fullplot, awards...)
  // imdb.rating, not imdb, so imdb.votes survives.
  const $set = { ...movie };
  if ($set.imdb) { $set['imdb.rating'] = $set.imdb.rating; delete $set.imdb; }
  const $unset = Object.fromEntries(empty.filter((f) => f !== 'title').map((f) => [f, '']));

  const updated = await Movie.findByIdAndUpdate(req.params.id, { $set, $unset }, { returnDocument: 'after', runValidators: true });
  if (!updated) return notFound(res);
  logger.info('Movie updated', { id: req.params.id, by: req.session.user.username, via: 'page' });
  req.session.flash = { type: 'success', message: 'Saved.' };
  res.redirect(`/movies/${req.params.id}`);
});

// ---- DELETE -------------------------------------------------------------------------

router.post('/movies/:id/delete', requireLogin, requirePageRole('admin'), async (req, res) => {
  if (!isId(req.params.id)) return notFound(res);
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) return notFound(res);
  logger.info('Movie deleted', { id: req.params.id, title: movie.title, by: req.session.user.username, via: 'page' });
  req.session.flash = { type: 'success', message: `Deleted "${movie.title}".` };
  res.redirect('/movies');
});

// ---- LOGIN / LOGOUT -----------------------------------------------------------------

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/movies');
  res.render('login', { title: 'Log in', username: '', error: null });
});

// The pages' validateLogin: both boxes filled in, as strings, before the rate limiter
function loginFields(req, res, next) {
  if (str(req.body.username) && typeof req.body.password === 'string' && req.body.password) return next();
  res.status(400).render('login', { title: 'Log in', username: str(req.body.username), error: 'Enter a username and a password.' });
}

router.post('/login', loginFields, pageLoginLimiter, async (req, res, next) => {
  const user = await checkPassword(req.body.username, req.body.password);
  if (!user) {
    logger.warn('Login failed', { username: str(req.body.username), ip: req.ip, via: 'page' });
    return res.status(401).render('login', { title: 'Log in', username: str(req.body.username), error: 'Invalid username or password.' });
  }
  await pageLoginLimiter.resetKey(loginKey(req));

  // A NEW session id at login (session fixation): if someone planted a session id in this
  // browser before, it's worth nothing now.
  const returnTo = req.session.returnTo || '/movies';
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.user = user; // { username, role } - never the password or its hash
    req.session.flash = { type: 'success', message: `Welcome, ${user.username} (${user.role}).` };
    logger.info('Login ok', { username: user.username, role: user.role, via: 'page' });
    res.redirect(returnTo);
  });
});

router.post('/logout', (req, res, next) => {
  const username = req.session.user && req.session.user.username;
  // The session's data is deleted on the server: the old cookie now points at nothing.
  // (The JWT needed a revoked-token list for this. A session just... ends.)
  req.session.destroy((err) => {
    if (err) return next(err);
    if (username) logger.info('Logout', { username, via: 'page' });
    res.clearCookie('mflix.sid');
    res.redirect('/movies');
  });
});

module.exports = router;
