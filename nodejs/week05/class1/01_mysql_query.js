// MySQL 1: query the contacts table from Node - the same table www/index.php reads
// Run:  docker compose exec node node week05/class1/01_mysql_query.js
//
// Node has no database support built in. mysql2 is the driver (npm install mysql2),
// the Node equivalent of PHP's mysqli extension.

const mysql = require('mysql2/promise'); // the /promise version works with await
const config = require('../../config');  // host/user/password, set by docker-compose.yml

async function main() {
  // PHP: $conn = new mysqli($host, $user, $password, $database);
  const conn = await mysql.createConnection(config.mysql);
  console.log(`Connected to ${config.mysql.database} on ${config.mysql.host}:${config.mysql.port}`);

  try {
    // PHP: $result = $conn->query($sql);
    // mysql2 hands back two things: the rows, and a description of the columns
    const [rows, fields] = await conn.query(
      'SELECT id, first_name, last_name, email FROM contacts ORDER BY last_name'
    );

    console.log(`${rows.length} rows, columns: ${fields.map((f) => f.name).join(', ')}`);

    // Each row is a plain object: { id: 1, first_name: 'Jamie', ... }
    // PHP: while ($row = $result->fetch_assoc()) { ... }
    for (const row of rows) {
      console.log(`${row.id}. ${row.first_name} ${row.last_name} <${row.email}>`);
    }

    console.table(rows);
  } catch (err) {
    console.error('Query failed:', err.message);
  } finally {
    await conn.end(); // a script should close its connection, or Node waits on it forever
  }
}

main();
