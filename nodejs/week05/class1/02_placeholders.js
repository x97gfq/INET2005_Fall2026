// MySQL 2: placeholders - never glue user input into SQL
// Run:  docker compose exec node node week05/class1/02_placeholders.js
//       docker compose exec node node week05/class1/02_placeholders.js son
//
// The word after the file name is the search term (process.argv[2]).
// Try the injection too:  ... 02_placeholders.js "' OR '1'='1"

const mysql = require('mysql2/promise');
const config = require('../../config');

const term = process.argv[2] || 'son';

async function main() {
  const conn = await mysql.createConnection(config.mysql);

  try {
    // WRONG: the term becomes part of the SQL itself
    const unsafeSql = `SELECT first_name, last_name FROM contacts WHERE last_name LIKE '%${term}%'`;
    console.log('Unsafe SQL sent to MySQL:\n  ' + unsafeSql);
    const [unsafe] = await conn.query(unsafeSql);
    console.log(`  -> ${unsafe.length} row(s)\n`);

    // RIGHT: a ? placeholder, and the value travels separately.
    // execute() makes a prepared statement, like $stmt->bind_param() in PHP.
    // The % wildcards go in the VALUE, not around the ?
    const safeSql = 'SELECT first_name, last_name FROM contacts WHERE last_name LIKE ?';
    console.log('Safe SQL sent to MySQL:\n  ' + safeSql + `\n  value: %${term}%`);
    const [safe] = await conn.execute(safeSql, [`%${term}%`]);
    console.log(`  -> ${safe.length} row(s)`);
    safe.forEach((r) => console.log(`     ${r.first_name} ${r.last_name}`));

    // An empty result is not an error - it is an empty array
    if (safe.length === 0) console.log('     No records found.');
  } finally {
    await conn.end();
  }
}

main().catch((err) => console.error('Failed:', err.message));
