// MongoDB 2: find() with filters - the NoSQL version of SELECT ... WHERE
// Run:  docker compose exec node node week04/class2/02_mongo_find.js
// Same queries as queries.mongodb.js, but run from Node

const { MongoClient } = require('mongodb');
const config = require('../../config');

async function main() {
  const client = new MongoClient(config.mongoUrl);

  try {
    await client.connect();
    const sales = client.db(config.mongoDb).collection('sales');

    // SELECT * FROM sales WHERE storeLocation = 'Halifax'
    const halifax = await sales.find({ storeLocation: 'Halifax' }).toArray();
    console.log('Halifax sales:', halifax.length);

    // Match inside an array: any sale with at least one item named "laptop"
    const laptops = await sales.countDocuments({ 'items.name': 'laptop' });
    console.log('Sales that include a laptop:', laptops);

    // Comparison operators: $gt $gte $lt $lte $ne $in
    const bulk = await sales.countDocuments({ 'items.quantity': { $gt: 8 } });
    console.log('Sales with an item quantity over 8:', bulk);

    // Date range: every sale in 2025
    const in2025 = await sales.countDocuments({
      saleDate: { $gte: new Date('2025-01-01'), $lt: new Date('2026-01-01') },
    });
    console.log('Sales in 2025:', in2025);

    // Projection (pick fields), sort and limit - the 5 most recent online sales
    const recent = await sales
      .find({ purchaseMethod: 'Online' })
      .project({ _id: 0, saleDate: 1, storeLocation: 1, 'customer.email': 1 })
      .sort({ saleDate: -1 })
      .limit(5)
      .toArray();
    console.table(recent.map((s) => ({ date: s.saleDate.toISOString().slice(0, 10), store: s.storeLocation, email: s.customer.email })));
  } finally {
    await client.close();
  }
}

main().catch((err) => console.error('Error:', err.message));
