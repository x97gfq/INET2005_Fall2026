// The Movie model: what a document in sample_mflix.movies should look like.
//
// MongoDB itself accepts any shape of document. Mongoose adds the rules:
// types, required fields, limits. They are checked by the app, before a write
// reaches the database - so data already in the collection can still break them
// (a few mflix movies have year: "1981è").

const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'title is required'], trim: true, maxlength: 200 },
    year: { type: Number, min: 1870, max: 2100 },
    runtime: { type: Number, min: 1 },           // minutes
    genres: [String],
    rated: String,                                // PG, R, NOT RATED ...
    plot: { type: String, maxlength: 1000 },
    directors: [String],
    cast: [String],
    imdb: {
      rating: { type: Number, min: 0, max: 10 },
      votes: Number,
    },
    type: { type: String, enum: ['movie', 'series'], default: 'movie' },
  },
  {
    // The real documents have more fields (fullplot, awards, tomatoes...).
    // Reads still return them; writes only accept the fields above.
    strict: true,
    // No __v version field: the sample documents don't have one either
    versionKey: false,
  }
);

// Model name 'Movie' -> Mongoose uses the collection 'movies' (lowercase, plural)
module.exports = mongoose.model('Movie', movieSchema);
