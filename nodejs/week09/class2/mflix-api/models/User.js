// People who signed up through POST /api/auth/register.
//
// sample_mflix already has a "users" collection, but it's a different shape (name, email,
// password) and it's sample data. Ours gets its own collection, with a bcrypt hash in each
// document - this is the LOOSE END the hard-coded demo users pointed at in week 7.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true }, // unique index: no two bobs
    passwordHash: { type: String, required: true },           // never the password itself
    role: { type: String, required: true, default: 'viewer' },
  },
  { versionKey: false, timestamps: { createdAt: true, updatedAt: false } }
);

// Collection: api_users (in sample_mflix)
module.exports = mongoose.model('User', userSchema, 'api_users');
