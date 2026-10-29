// The movie queries, in one place, so the JSON API and the EJS pages can't drift apart.
//
//   routes/movies.js   GET /api/movies   -> res.json(await listMovies(...))
//   routes/pages.js    GET /movies       -> res.render('movies', await listMovies(...))
//
// Same search, same sort, same paging - only the last line of the route differs.
// (In week 7 this query lived inside routes/movies.js.)

const Movie = require('../models/Movie');

// "Matrix" should match "The Matrix" - but "(" or "*" in a search must not be regex syntax
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// title / genre / year: optional filters. page and limit: already checked by the caller.
async function listMovies({ title, genre, year, page = 1, limit = 20 } = {}) {
  const filter = {};
  if (title) filter.title = { $regex: escapeRegex(title), $options: 'i' };
  if (genre) filter.genres = genre;
  if (year) filter.year = Number(year);

  const skip = (page - 1) * limit;
  const [total, results] = await Promise.all([
    Movie.countDocuments(filter),
    Movie.find(filter)
      .sort({ title: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .select('title year genres runtime rated imdb.rating'),
  ]);

  return { page, limit, total, totalPages: Math.ceil(total / limit), results };
}

// Every genre in the collection, A-Z, for the pages' dropdown. Asked once, then remembered:
// genres don't change while the server runs (a new movie with a brand-new genre will show
// up after a restart).
let genreCache = null;
async function listGenres() {
  if (!genreCache) genreCache = (await Movie.distinct('genres')).filter(Boolean).sort();
  return genreCache;
}

module.exports = { listMovies, listGenres };
