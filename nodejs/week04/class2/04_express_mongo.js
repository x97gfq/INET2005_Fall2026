// MongoDB 4: Express + MongoDB - a web page and an API backed by a collection
// Run:  docker compose exec node node week04/class2/04_express_mongo.js
// Open http://localhost:3001            (HTML: sales per store)
//      http://localhost:3001/api/sales?store=Truro   (JSON, filtered by query string)

const express = require('express');
const { MongoClient } = require('mongodb');
const config = require('../../config');

const app = express();
const client = new MongoClient(config.mongoUrl);
const sales = client.db(config.mongoDb).collection('sales');

// async route handler: await the database instead of passing a callback
app.get('/', async (req, res) => {
  try {
    const stores = await sales.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$storeLocation',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
    ]).toArray();

    const rows = stores
      .map((s) => `<tr><td><a href="/api/sales?store=${encodeURIComponent(s._id)}">${s._id}</a></td><td class="text-end">$${s.revenue.toFixed(2)}</td></tr>`)
      .join('');

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sales by Store</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container py-4">
    <h1>Revenue by Store (MongoDB)</h1>
    <table class="table table-striped w-auto">
      <tr><th>Store</th><th class="text-end">Revenue</th></tr>
      ${rows}
    </table>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error - is the mongo container running?');
  }
});

// /api/sales?store=Halifax&limit=5  -> req.query holds the ?key=value pairs
app.get('/api/sales', async (req, res) => {
  const filter = req.query.store ? { storeLocation: req.query.store } : {};
  const limit = Math.min(Number(req.query.limit) || 10, 100);

  try {
    const docs = await sales.find(filter).sort({ saleDate: -1 }).limit(limit).toArray();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect once at startup, then start listening
client.connect().then(() => {
  app.listen(config.port, () => {
    console.log(`Sales site on http://localhost:${config.port}`);
  });
}).catch((err) => console.error('Could not connect to MongoDB:', err.message));
