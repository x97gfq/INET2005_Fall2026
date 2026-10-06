// MySQL 3: credentials from .env instead of the source code
// First:  docker compose exec node cp week05/class1/.env.example week05/class1/.env
// Run:    docker compose exec node node week05/class1/03_dotenv.js
//
// Then change DB_NAME in .env to something wrong and run it again:
// a different result, and not one line of code changed.

const path = require('path');
const fs = require('fs');

const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
  console.error('No .env file yet. Copy .env.example to .env in week05/class1/ first.');
  process.exit(1);
}

// Reads KEY=value lines from .env into process.env.
// path: this folder's .env (by default dotenv looks in the folder you ran node from)
// quiet: don't print dotenv's own "injected env" message
require('dotenv').config({ path: envFile, quiet: true });

const mysql = require('mysql2/promise');

async function main() {
  // Every setting comes from the environment - nothing secret in this file
  const settings = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  // Log where we're connecting, never the password
  console.log(`Connecting to ${settings.database} on ${settings.host}:${settings.port} as ${settings.user}`);

  const conn = await mysql.createConnection(settings);
  try {
    const [rows] = await conn.execute('SELECT COUNT(*) AS total FROM contacts');
    console.log(`contacts has ${rows[0].total} rows`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  // The usual suspects, in plain words
  const hints = {
    ENOTFOUND: 'DB_HOST is not a server name Node can find (inside Docker it should be db)',
    ECONNREFUSED: 'nothing is listening on DB_HOST:DB_PORT. Inside Docker, localhost is the node container itself - use db and 3306',
    ER_ACCESS_DENIED_ERROR: 'DB_USER / DB_PASSWORD were rejected',
    ER_DBACCESS_DENIED_ERROR: 'DB_NAME does not exist, or DB_USER is not allowed to use it',
    ER_BAD_DB_ERROR: 'DB_NAME does not exist',
  };
  console.error('Failed:', err.message || err.code);
  if (hints[err.code]) console.error('Hint:', hints[err.code]);
  process.exitCode = 1;
});
