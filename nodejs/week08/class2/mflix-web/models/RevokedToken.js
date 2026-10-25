// Tokens that were logged out before they expired - a "denylist".
//
// A JWT is STATELESS: the server keeps no record of the tokens it hands out, it just
// checks the signature. That's why it scales, and also why you can't simply "delete"
// one: a stolen or logged-out token keeps working until its exp. To log out for real,
// the server has to remember the tokens it no longer accepts.
//
// Each token gets a unique id when it's signed (the "jti" claim, routes/auth.js).
// POST /api/auth/logout saves that id here; requireJwt refuses any token whose id is here.
//
// The list never grows forever: the TTL index below makes MongoDB delete each entry once
// expiresAt passes. By then the token has expired anyway, so jwt.verify() rejects it.

const mongoose = require('mongoose');

const revokedTokenSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true },
    user: String,                                        // who logged out (for the logs, not the check)
    expiresAt: { type: Date, required: true, expires: 0 }, // TTL index: delete at this time
  },
  { versionKey: false }
);

// Collection: revoked_tokens (in sample_mflix)
module.exports = mongoose.model('RevokedToken', revokedTokenSchema, 'revoked_tokens');
