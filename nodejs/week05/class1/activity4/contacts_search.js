// Activity 4: Contacts Search - .env + a ?search= query string
// Run:  docker compose exec node node week05/class1/activity4/contacts_search.js
// Open: http://localhost:3001  and  http://localhost:3001/?search=son
// Changed the file? Ctrl+C, then run it again.
//
// This page works as-is. Your job is to finish the TODOs below.
// It's the groundwork for Assignment 2: same pattern, your own table.

const express = require('express');
const mysql = require('mysql2/promise');

// TODO 1: these credentials should not be in the code.
//   - make sure week05/class1/.env exists (copy .env.example)
//   - load it with dotenv at the top of this file (see 03_dotenv.js)
//   - replace each value below with process.env.DB_...
const pool = mysql.createPool({
  host: 'db',
  port: 3306,
  user: 'appuser',
  password: 'apppassword',
  database: 'appdb',
});

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const app = express();

app.get('/', async (req, res) => {
  // TODO 2: read the search term from the query string.
  //   /?search=son  ->  req.query.search is 'son'
  //   No ?search= at all  ->  req.query.search is undefined, so default to ''
  const search = '';

  // TODO 3: when there is a search term, only return contacts whose first name,
  //   last name OR email contains it. Use ? placeholders and pool.execute() -
  //   never put the term inside the SQL string (see 02_placeholders.js).
  //   Hint: the same value is needed three times: [like, like, like]
  const [rows] = await pool.query(
    'SELECT first_name, last_name, email, phone FROM contacts ORDER BY last_name'
  );

  const tableRows = rows.map((row) => `
        <tr>
          <td>${escapeHtml(row.first_name)}</td>
          <td>${escapeHtml(row.last_name)}</td>
          <td>${escapeHtml(row.email)}</td>
          <td>${escapeHtml(row.phone)}</td>
        </tr>`).join('');

  // TODO 4: if rows is empty, show "No records found." instead of an empty table.
  // TODO 5: under the table, show "Total number of records: X" and the current date and time.

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contacts Search</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container py-4">
    <h1>Contacts</h1>

    <!-- A GET form puts the input into the URL as ?search=... - no JavaScript needed -->
    <form method="get" class="d-flex gap-2 mb-3" style="max-width: 420px">
      <input class="form-control" name="search" placeholder="Search name or email"
             value="${escapeHtml(search)}">
      <button class="btn btn-primary">Search</button>
    </form>

    <table class="table table-striped">
      <tr><th>First Name</th><th>Last Name</th><th>Email</th><th>Phone</th></tr>${tableRows}
    </table>
  </div>
</body>
</html>`);
});

// TODO 6: the port is hard-coded too. Read PORT from the environment, falling back to 3001.
app.listen(3001, () => console.log('Contacts search on http://localhost:3001'));
