// Week 12: GIVEN, not typed. Adds (or updates) one user you can log in as, with a HASHED password.
//   docker compose exec node node week12/api/add-user.js you@example.com "a long password" "Your Name"
//
// sample_mflix already has 185 users. Their password field holds bcrypt hashes ($2b$12$...), and nobody
// has the passwords that made them: not you, not MongoDB. Ours go in the same shape:
//   { name, email, password: '$2b$12$...', addedBy: 'week12' }
// The field is called password because sample_mflix calls it that. It never holds the password itself.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'sample_mflix';

async function main() {
  const [emailArg, password, name = 'Student'] = process.argv.slice(2);
  const email = String(emailArg || '').trim().toLowerCase();
  if (!email.includes('@') || !password) {
    console.log('Usage: node week12/api/add-user.js you@example.com "a long password" "Your Name"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.log('Use a password of 8 characters or more.');
    process.exit(1);
  }

  // 12 rounds: 2^12 = 4096 rounds of work for every guess, which is what makes a stolen hash slow to crack.
  // The salt is random and stored inside the hash, so two users with the same password get different hashes.
  const hash = await bcrypt.hash(password, 12);

  const client = new MongoClient(MONGO_URL);
  try {
    const users = client.db(DB_NAME).collection('users');
    // upsert: update the user with this email, or insert one if there isn't one. Safe to run again.
    const result = await users.updateOne(
      { email },
      { $set: { name, email, password: hash, addedBy: 'week12' } },
      { upsert: true }
    );
    console.log(result.upsertedCount ? 'Added' : 'Updated', email);
    console.log('Stored hash:', hash);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
