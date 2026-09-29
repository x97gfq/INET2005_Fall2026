// Example 7: read a JSON file and summarize it
// Objective: average age, and how many users live in each city
// Run:  docker compose exec node node week04/class1/07_summarize_users.js

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'users.json');

// readFileSync waits for the file - fine for a small script with no server
const users = JSON.parse(fs.readFileSync(file, 'utf8'));

// Average age: add them all up with reduce, then divide
const totalAge = users.reduce((sum, user) => sum + user.age, 0);
const averageAge = totalAge / users.length;

// Count per city: build an object like { Halifax: 4, Truro: 2 }
const cityCounts = {};
for (const user of users) {
  cityCounts[user.city] = (cityCounts[user.city] || 0) + 1;
}

console.log(`Number of users: ${users.length}`);
console.log(`Average age: ${averageAge.toFixed(2)}`);
console.log('Users per city:', cityCounts);
