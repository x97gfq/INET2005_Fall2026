// MySQL 5: one Node page, two databases - MySQL and MongoDB side by side
// Run:  docker compose exec node node week05/class1/05_two_databases.js
// Open http://localhost:3001
//
// The point: the language and the database are separate choices.
// PHP can talk to MongoDB, Node can talk to MySQL, and one program can use both.

const express = require('express');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const config = require('../../config');

const app = express();
const pool = mysql.createPool(config.mysql);
const mongo = new MongoClient(config.mongoUrl);
const sales = mongo.db(config.mongoDb).collection('sales');

// Same htmlspecialchars() stand-in as example 04
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

app.get('/', async (req, res) => {
  try {
    // Start both queries, then wait for both. Neither waits for the other.
    const [[contacts], stores] = await Promise.all([
      // MySQL: SQL text, rows back
      pool.query('SELECT first_name, last_name, email FROM contacts ORDER BY last_name'),
      // MongoDB: a pipeline of JavaScript objects, documents back
      sales.aggregate([
        { $group: { _id: '$storeLocation', sales: { $sum: 1 } } },
        { $sort: { sales: -1 } },
      ]).toArray(),
    ]);

    const contactRows = contacts
      .map((c) => `<tr><td>${esc(c.first_name)} ${esc(c.last_name)}</td><td>${esc(c.email)}</td></tr>`)
      .join('');
    const storeRows = stores
      .map((s) => `<tr><td>${esc(s._id)}</td><td class="text-end">${s.sales}</td></tr>`)
      .join('');

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Two Databases</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container py-4">
    <h1>One Node page, two databases</h1>
    <div class="row mt-4">
      <div class="col-md-6">
        <h2 class="h4">Contacts <span class="badge bg-info">MySQL</span></h2>
        <table class="table table-sm table-striped">${contactRows}</table>
      </div>
      <div class="col-md-6">
        <h2 class="h4">Sales per store <span class="badge bg-success">MongoDB</span></h2>
        <table class="table table-sm table-striped w-auto">${storeRows}</table>
      </div>
    </div>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error: ' + err.message);
  }
});

mongo.connect().then(() => {
  app.listen(config.port, () => console.log(`Two databases on http://localhost:${config.port}`));
}).catch((err) => console.error('Could not connect to MongoDB:', err.message));
