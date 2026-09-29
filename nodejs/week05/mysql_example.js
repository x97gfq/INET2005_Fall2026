// Assignment 2 reference: Node.js + MySQL
// The same Rolodex page as www/index.php, rewritten in Node with Express.
// Run:  docker compose exec node node week05/mysql_example.js
// Open http://localhost:3001 (HTML table) and http://localhost:3001/api/contacts (JSON)

const express = require('express');
const mysql = require('mysql2');
const config = require('../config'); // host/user/password - see config.js

const app = express();

// A pool opens connections as needed and reuses them between requests
const pool = mysql.createPool(config.mysql);

// Like PHP's htmlspecialchars(): never put database text into HTML unescaped
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Human-readable HTML page
app.get('/', (req, res) => {
  const sql = 'SELECT first_name, last_name, email, phone FROM contacts ORDER BY last_name';

  // The arrow function is a callback: it runs when MySQL answers
  pool.query(sql, (err, rows) => {
    if (err) {
      console.error('Query failed:', err.message);
      res.status(500).send('Database error - is the db container running?');
      return;
    }

    let html = `<!DOCTYPE html>
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
      <tr><th>First Name</th><th>Last Name</th><th>Email</th><th>Phone</th></tr>`;

    rows.forEach((row) => {
      html += `
      <tr>
        <td>${escapeHtml(row.first_name)}</td>
        <td>${escapeHtml(row.last_name)}</td>
        <td>${escapeHtml(row.email)}</td>
        <td>${escapeHtml(row.phone)}</td>
      </tr>`;
    });

    html += `
    </table>
  </div>
</body>
</html>`;

    res.send(html);
  });
});

// The same data as JSON - an API another program (or a fetch() call) can use
app.get('/api/contacts', (req, res) => {
  pool.query('SELECT * FROM contacts ORDER BY last_name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Route parameter + placeholder (?) - the Node version of a prepared statement
app.get('/api/contacts/:id', (req, res) => {
  pool.query('SELECT * FROM contacts WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (rows.length === 0) {
      res.status(404).json({ error: 'No contact with that id' });
      return;
    }
    res.json(rows[0]);
  });
});

app.listen(config.port, () => {
  console.log(`Contacts on http://localhost:${config.port}`);
});
