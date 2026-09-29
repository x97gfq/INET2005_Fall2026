// Example 9: summarizing sales (order) data
// Objective: total sales amount, and units sold per product
// Run:  docker compose exec node node week04/class1/09_summarize_orders.js

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'orders.json');
const orders = JSON.parse(fs.readFileSync(file, 'utf8'));

let totalSales = 0;
const unitsPerProduct = {};

orders.forEach((order) => {
  totalSales += order.quantity * order.unitPrice;
  unitsPerProduct[order.product] = (unitsPerProduct[order.product] || 0) + order.quantity;
});

console.log(`Total sales: $${totalSales.toLocaleString()}`);
console.log('Units sold per product:', unitsPerProduct);

// console.table prints an array of objects as a grid - handy for checking data
console.table(orders.filter((o) => o.product === 'Laptop'));
