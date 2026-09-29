// Class 2 follow-along queries - inet.sales
//
// Three ways to run these:
//   * MongoDB Compass: connect to mongodb://localhost:27017, open inet > sales,
//     click ">_ MONGOSH" at the bottom and paste one query at a time
//   * VS Code MongoDB extension: open this file and click "Play" (it is a Playground)
//   * Terminal:  docker compose exec mongo mongosh inet   then paste

use('inet');

// 1. Find all sales (Compass shows the first 20; mongosh shows 20 and "Type it for more")
db.sales.find({});

// 2. Sales from one store
db.sales.find({ storeLocation: 'Halifax' });

// 3. Sales where some item has quantity greater than 8
db.sales.find({ 'items.quantity': { $gt: 8 } });

// 4. Sales that include a specific item, e.g. a notebook
db.sales.find({ 'items.name': 'notebook' });

// 5. Sales within a date range (all of 2025)
db.sales.find({ saleDate: { $gte: ISODate('2025-01-01'), $lt: ISODate('2026-01-01') } });

// 6. Count the sales for each store
db.sales.aggregate([
  { $group: { _id: '$storeLocation', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);

// 7. Total revenue for each item ($unwind splits the items array first)
db.sales.aggregate([
  { $unwind: '$items' },
  { $group: { _id: '$items.name', totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
]);

// 8. Top 5 items by revenue
db.sales.aggregate([
  { $unwind: '$items' },
  { $group: { _id: '$items.name', totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
  { $sort: { totalSales: -1 } },
  { $limit: 5 },
]);
