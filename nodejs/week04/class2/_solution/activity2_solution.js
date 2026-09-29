// ANSWER KEY - Activity 2 checked from Node: runs every query in activity2_queries.mongodb.js
// and prints the result next to the expected answer.
// Run: docker compose exec node node week04/class2/_solution/activity2_solution.js

const { MongoClient } = require('mongodb');
const config = require('../../../config');

const revenue = { $sum: { $multiply: ['$items.price', '$items.quantity'] } };

async function main() {
  const client = new MongoClient(config.mongoUrl);

  try {
    await client.connect();
    const sales = client.db(config.mongoDb).collection('sales');

    // [label, filter, expected count]
    const finds = [
      ['1. all sales', {}, 300],
      ['2. Halifax', { storeLocation: 'Halifax' }, 50],
      ['3. item quantity > 8', { 'items.quantity': { $gt: 8 } }, 72],
      ['4. includes a notebook', { 'items.name': 'notebook' }, 79],
      ['5. during 2025', { saleDate: { $gte: new Date('2025-01-01'), $lt: new Date('2026-01-01') } }, 190],
      ['own: online + coupon', { purchaseMethod: 'Online', couponUsed: true }, 31],
      ['own: customer under 25', { 'customer.age': { $lt: 25 } }, 43],
      ['own: Halifax, satisfaction 5', { storeLocation: 'Halifax', 'customer.satisfaction': 5 }, 7],
      ['own: laptop or headphones', { 'items.name': { $in: ['laptop', 'headphones'] } }, 168],
    ];
    for (const [label, filter, expected] of finds) {
      const n = await sales.countDocuments(filter);
      console.log(`${label.padEnd(30)} ${String(n).padStart(4)}   expected ${expected}  ${n === expected ? 'OK' : 'DIFFERENT'}`);
    }

    console.log('\n6. sales per store');
    console.table(await sales.aggregate([
      { $group: { _id: '$storeLocation', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray());

    console.log('7/8. revenue per item (top 5 = query 8)');
    const items = await sales.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalSales: revenue } },
      { $sort: { totalSales: -1 } },
    ]).toArray();
    console.table(items.map((i) => ({ item: i._id, totalSales: i.totalSales.toFixed(2) })));

    console.log('stretch: average customer age per store');
    const ages = await sales.aggregate([
      { $group: { _id: '$storeLocation', avgAge: { $avg: '$customer.age' } } },
      { $sort: { _id: 1 } },
    ]).toArray();
    console.table(ages.map((a) => ({ store: a._id, avgAge: a.avgAge.toFixed(1) })));
  } finally {
    await client.close();
  }
}

main().catch((err) => console.error('Error:', err.message));
