// Landing page for the inet-node container: http://localhost:3000
//
// This is the one Node program the container starts by itself (npm start).
// It checks the container can reach MySQL and MongoDB.
//
// The week04 examples are separate programs - you start each one yourself:
//   docker compose exec node node week04/class1/01_hello_http.js
//
// Edited this file? It is already running, so restart it: docker compose restart node

const express = require('express');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const config = require('./config');

const app = express();
const port = 3000;

// Try each database and report ok / the error message
async function checkMysql() {
  try {
    const conn = await mysql.createConnection(config.mysql);
    const [rows] = await conn.query('SELECT COUNT(*) AS n FROM contacts');
    await conn.end();
    return `ok - ${rows[0].n} contacts in ${config.mysql.database}`;
  } catch (err) {
    return 'ERROR - ' + err.message;
  }
}

async function checkMongo() {
  const client = new MongoClient(config.mongoUrl, { serverSelectionTimeoutMS: 2000 });
  try {
    await client.connect();
    const n = await client.db(config.mongoDb).collection('sales').countDocuments();
    return `ok - ${n} documents in ${config.mongoDb}.sales`;
  } catch (err) {
    return 'ERROR - ' + err.message;
  } finally {
    await client.close();
  }
}

app.get('/', async (req, res) => {
  const [mysqlStatus, mongoStatus] = await Promise.all([checkMysql(), checkMongo()]);

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>INET2005 Node Server</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container py-4">
    <h1>Node.js is running</h1>
    <p class="text-muted">Node ${process.version} inside the inet-node container</p>
    <table class="table w-auto">
      <tr><th>MySQL (${config.mysql.host}:${config.mysql.port})</th><td>${mysqlStatus}</td></tr>
      <tr><th>MongoDB (${config.mongoUrl})</th><td>${mongoStatus}</td></tr>
    </table>

    <h2 class="h4 mt-4">Run an example</h2>
    <p>Each example is its own program. Start it from a terminal in the repo folder:</p>
    <pre class="bg-light p-3">docker compose exec node node week04/class1/01_hello_http.js</pre>
    <p>then open <a href="http://localhost:3001">http://localhost:3001</a>.
       Watch the terminal for its console.log output, and press Ctrl+C to stop it.</p>
  </div>
</body>
</html>`);
});

app.listen(port, () => {
  console.log(`Landing page on http://localhost:${port}`);
});
