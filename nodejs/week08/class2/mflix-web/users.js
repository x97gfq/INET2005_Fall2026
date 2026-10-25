// The demo users, in one place: the JSON API's login (routes/auth.js, gives a JWT) and the
// pages' login (routes/pages.js, starts a session) both check passwords here.
// In week 7 this list lived inside routes/auth.js; a second login is the reason to move it.
//
//   admin  - everything, including DELETE
//   editor - create and update movies
//   viewer - can log in, but can only read (same as not logged in)
//
// LOOSE END: a real app keeps these in a users collection (sample_mflix has one),
// with the bcrypt hash in the document. Hard-coded users are for the demo only.

const bcrypt = require('bcryptjs');

const users = [
  { username: 'alice', role: 'admin', passwordHash: '$2b$10$8eyv4GJAgmD2uGWtpjG37uovyKkIwOGGJ6w5Bev7DewgxfVq1lSUm' },  // password123
  { username: 'bob', role: 'editor', passwordHash: '$2b$10$4jS4pPILOqpFCjzu3kO65enuKbfshr/tYmdoxMdyTd4Mdwk4L1Ew6' },   // letmein
  { username: 'carol', role: 'viewer', passwordHash: '$2b$10$iS3DjxtayCddaRo0u4QieeYxfyBPtEny3aYk.KcZ1UdfSarwxicsG' }, // hunter2
];

// A hash to compare against when the username doesn't exist, so a wrong username takes
// as long as a wrong password. Otherwise the response time tells an attacker which
// usernames are real.
const DUMMY_HASH = bcrypt.hashSync('no-such-user', 10);

// The user, if the username and password match - otherwise null. Never says which was wrong.
async function checkPassword(username, password) {
  const user = users.find((u) => u.username === username.trim());
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  return user && ok ? { username: user.username, role: user.role } : null;
}

module.exports = { checkPassword };
