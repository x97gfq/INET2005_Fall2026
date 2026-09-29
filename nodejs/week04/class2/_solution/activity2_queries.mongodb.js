// ANSWER KEY - Activity 2: the follow-along queries with expected results,
// plus sample answers for "write one query of your own".
// Counts assume inet.sales loaded from mongo-init/sales.json (300 documents).
// Run in Compass's mongosh, as a VS Code Playground, or: docker compose exec mongo mongosh inet
// The same checks from Node: week04/class2/_solution/activity2_solution.js

use('inet');

// ---------- the eight follow-along queries ----------

// 1. All sales -> 300 documents (countDocuments to check: db.sales.countDocuments({}))
db.sales.find({});

// 2. Halifax -> 50
db.sales.find({ storeLocation: 'Halifax' });

// 3. Some item with quantity > 8 -> 72
db.sales.find({ 'items.quantity': { $gt: 8 } });

// 4. Includes a notebook -> 79
db.sales.find({ 'items.name': 'notebook' });

// 5. During 2025 -> 190
db.sales.find({ saleDate: { $gte: ISODate('2025-01-01'), $lt: ISODate('2026-01-01') } });

// 6. Sales per store -> Truro 59, Charlottetown 56, Halifax 50, Moncton 49, Dartmouth 44, Sydney 42
db.sales.aggregate([
  { $group: { _id: '$storeLocation', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);

// 7. Revenue per item -> 8 documents, one per item (unsorted, so the order can vary)
db.sales.aggregate([
  { $unwind: '$items' },
  { $group: { _id: '$items.name', totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
]);

// 8. Top 5 by revenue -> laptop 92623.89, headphones 6895.46, printer paper 4767.73,
//    envelopes 4410.16, pens 4333.03
db.sales.aggregate([
  { $unwind: '$items' },
  { $group: { _id: '$items.name', totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
  { $sort: { totalSales: -1 } },
  { $limit: 5 },
]);

// ---------- sample "your own query" answers (any working query is acceptable) ----------

// Online sales where a coupon was used -> 31
db.sales.find({ purchaseMethod: 'Online', couponUsed: true });

// Customers under 25 -> 43
db.sales.find({ 'customer.age': { $lt: 25 } });

// Halifax sales with a satisfaction score of 5 -> 7
db.sales.find({ storeLocation: 'Halifax', 'customer.satisfaction': 5 });

// Sales that include a laptop OR headphones ($in) -> 168
db.sales.find({ 'items.name': { $in: ['laptop', 'headphones'] } });

// Stretch: average customer age per store -> Charlottetown 41.9, Dartmouth 49.0, Halifax 43.7,
//          Moncton 44.9, Sydney 44.2, Truro 45.5
db.sales.aggregate([
  { $group: { _id: '$storeLocation', avgAge: { $avg: '$customer.age' } } },
  { $sort: { _id: 1 } },
]);
