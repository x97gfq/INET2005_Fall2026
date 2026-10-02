// ANSWER KEY - Activity 3: Sales Page (the Node + MongoDB version of www/index.php)
// Run:  docker compose exec node node week04/class2/_solution/activity3_sales_page.js
// Open: http://localhost:3001

const express = require('express');
const { MongoClient } = require('mongodb');
const config = require('../../../config');

const app = express();
const client = new MongoClient(config.mongoUrl);
const sales = client.db('inet').collection('sales');

app.get('/', async (req, res) => {
  // SELECT * FROM sales WHERE storeLocation = 'Halifax' ORDER BY saleDate DESC LIMIT 10
  const docs = await sales.find({ storeLocation: 'Halifax' }).sort({ saleDate: -1 }).limit(10).toArray();

  // one <tr> per document - the while loop in index.php
  const rows = docs.map((d) => `<tr>
    <td>${d.saleDate.toLocaleDateString()}</td>
    <td>${d.storeLocation}</td>
    <td>${d.purchaseMethod}</td>
    <td>${d.customer.email}</td>
    <td>${d.customer.age}</td>
    <td>${d.items.length}</td>
  </tr>`).join('');

  res.send(`<!DOCTYPE html>
<html><head><title>Sales</title>
<style>body{font-family:Arial;margin:40px} table{border-collapse:collapse} td,th{border:1px solid #ccc;padding:8px;}</style>
</head><body>
<h1>Halifax Sales</h1>
<table>
  <tr><th>Date</th><th>Store</th><th>Method</th><th>Customer</th><th>Age</th><th>Items</th></tr>
  ${rows}
</table>
</body></html>`);
});

client.connect().then(() => {
  app.listen(config.port, () => console.log(`Sales page on http://localhost:${config.port}`));
});
