// The Comment model: sample_mflix.comments. Each comment points at a movie by its _id.
//   { name, email, movie_id: ObjectId, text, date }
// We never show the email - it's personal data, and nobody asked us to publish it.

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: String,
    movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    date: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Model name 'Comment' -> collection 'comments'
module.exports = mongoose.model('Comment', commentSchema);
