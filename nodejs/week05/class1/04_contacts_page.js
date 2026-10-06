// MySQL 4: the Rolodex page from www/index.php, rewritten in Node with Express
// Run:  docker compose exec node node week05/class1/04_contacts_page.js
// Open http://localhost:3001                 (HTML table - compare with http://localhost)
//      http://localhost:3001/api/contacts    (the same rows as JSON)
//      http://localhost:3001/api/contacts/2  (one row, by id)

const express = require('express');
const mysql = require('mysql2/promise');
const config = require('../../config');

const app = express();

// A pool opens connections as needed and reuses them between requests.
// A server handles many requests, so it uses a pool; a one-off script uses one connection.
const pool = mysql.createPool(config.mysql);

// Like PHP's htmlspecialchars(): never put database text into HTML unescaped
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Human-readable HTML page
app.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT first_name, last_name, email, phone FROM contacts ORDER BY last_name'
    );

    // One <tr> per row: the Node version of PHP's while ($row = fetch_assoc())
    const tableRows = rows.map((row) => `
        <tr>
          <td>${escapeHtml(row.first_name)}</td>
          <td>${escapeHtml(row.last_name)}</td>
          <td>${escapeHtml(row.email)}</td>
          <td>${escapeHtml(row.phone)}</td>
        </tr>`).join('');

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contacts</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container py-4">
    <h1>Rolodex Contacts (Node.js)</h1>
    <table class="table table-striped">
      <tr><th>First Name</th><th>Last Name</th><th>Email</th><th>Phone</th></tr>${tableRows}
    </table>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error('Query failed:', err.message);
    res.status(500).send('Database error - is the db container running?');
  }
});

// The same data as JSON - an API another program (or a fetch() call) can use
app.get('/api/contacts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contacts ORDER BY last_name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route parameter + placeholder (?) - the Node version of a prepared statement
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'No contact with that id' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(config.port, () => {
  console.log(`Contacts on http://localhost:${config.port}`);
});
