// MongoDB 3: aggregation pipelines - the NoSQL version of GROUP BY
// Run:  docker compose exec node node week04/class2/03_mongo_aggregate.js
//
// A pipeline is an array of stages; each stage's output feeds the next one.

const { MongoClient } = require('mongodb');
const config = require('../../config');

async function main() {
  const client = new MongoClient(config.mongoUrl);

  try {
    await client.connect();
    const sales = client.db(config.mongoDb).collection('sales');

    // Number of sales per store  (SELECT storeLocation, COUNT(*) ... GROUP BY storeLocation)
    const perStore = await sales.aggregate([
      { $group: { _id: '$storeLocation', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray();
    console.log('Sales per store:');
    console.table(perStore);

    // Revenue per item: $unwind turns one sale with 3 items into 3 documents,
    // then we can group by item name and add up price x quantity
    const topItems = await sales.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]).toArray();
    console.log('Top 5 items by revenue:');
    console.table(topItems.map((t) => ({ item: t._id, units: t.unitsSold, revenue: t.revenue.toFixed(2) })));

    // Average customer satisfaction per purchase method
    const satisfaction = await sales.aggregate([
      { $group: { _id: '$purchaseMethod', avgSatisfaction: { $avg: '$customer.satisfaction' } } },
    ]).toArray();
    console.log('Average satisfaction by purchase method:');
    console.table(satisfaction);
  } finally {
    await client.close();
  }
}

main().catch((err) => console.error('Error:', err.message));
