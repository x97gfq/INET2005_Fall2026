// Example 8: summarizing product data
// Objective: total inventory value, and how many products are in each category
// Run:  docker compose exec node node week04/class1/08_summarize_products.js

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(file, 'utf8'));

// Inventory value = price x stock, summed over every product
const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

// Same counting pattern as example 7, written with reduce this time
const perCategory = products.reduce((counts, p) => {
  counts[p.category] = (counts[p.category] || 0) + 1;
  return counts;
}, {});

// Most valuable line of stock: sort a COPY so the original order is kept
const top = [...products].sort((a, b) => b.price * b.stock - a.price * a.stock)[0];

console.log(`Total inventory value: $${inventoryValue.toLocaleString()}`);
console.log('Products in each category:', perCategory);
console.log(`Most valuable stock: ${top.name} ($${(top.price * top.stock).toLocaleString()})`);
