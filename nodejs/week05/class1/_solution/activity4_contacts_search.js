// Activity 4 answer key: Contacts Search - .env + a ?search= query string
// Run:  docker compose exec node node week05/class1/_solution/activity4_contacts_search.js
// Open: http://localhost:3001/?search=son   http://localhost:3001/?search=zzz (no records)
//       http://localhost:3001/?search=' OR '1'='1   (finds nothing: the quote is just a character)

const path = require('path');

// TODO 1: load week05/class1/.env (one folder up from _solution)
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const express = require('express');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
  // TODO 2: ?search=son -> 'son'; no ?search= -> ''
  const search = (req.query.search || '').trim();

  // TODO 3: placeholders, and the wildcards go in the value
  let rows;
  if (search) {
    const like = `%${search}%`;
    [rows] = await pool.execute(
      `SELECT first_name, last_name, email, phone FROM contacts
       WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
       ORDER BY last_name`,
      [like, like, like]
    );
  } else {
    [rows] = await pool.query(
      'SELECT first_name, last_name, email, phone FROM contacts ORDER BY last_name'
    );
  }

  const tableRows = rows.map((row) => `
        <tr>
          <td>${escapeHtml(row.first_name)}</td>
          <td>${escapeHtml(row.last_name)}</td>
          <td>${escapeHtml(row.email)}</td>
          <td>${escapeHtml(row.phone)}</td>
        </tr>`).join('');

  // TODO 4: an empty result gets a message, not an empty table
  const results = rows.length === 0
    ? '<div class="alert alert-warning">No records found.</div>'
    : `<table class="table table-striped">
      <tr><th>First Name</th><th>Last Name</th><th>Email</th><th>Phone</th></tr>${tableRows}
    </table>`;

  // TODO 5: record count and the current date/time
  const now = new Date().toLocaleString('en-CA', { timeZone: 'America/Halifax' });

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

    <form method="get" class="d-flex gap-2 mb-3" style="max-width: 420px">
      <input class="form-control" name="search" placeholder="Search name or email"
             value="${escapeHtml(search)}">
      <button class="btn btn-primary">Search</button>
      ${search ? '<a class="btn btn-outline-secondary" href="/">Clear</a>' : ''}
    </form>

    ${results}

    <p class="text-muted">Total number of records: ${rows.length}<br>${now}</p>
  </div>
</body>
</html>`);
});

// TODO 6: port from the environment, 3001 if it isn't set
const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`Contacts search on http://localhost:${port}`));
