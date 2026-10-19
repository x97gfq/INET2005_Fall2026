// Middleware 3: validation and one central error handler
// Run:  docker compose exec node node week07/class1/03_errors_and_validation.js
// Test: open week07/class1/03_requests.http in VS Code (REST Client) and send each request
//
// Two jobs every real API has:
//   1. VALIDATION - reject bad input with 400 before it causes damage.
//   2. ERROR HANDLING - when something throws, send a clean status code, not a
//      stack trace or a hung request.
//
// The movies API in week 6 had this exact error handler at the bottom of server.js.
// Here we build it from scratch so you can see why it has FOUR parameters.

const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

let products = [{ id: 1, name: 'Laptop', price: 1200 }];
let nextId = 2;

// --- validation as its own middleware ---------------------------------------
// Keeping it separate means the route stays about "add a product", not about
// checking types. Reuse it on POST and PUT.
function validateProduct(req, res, next) {
  const { name, price } = req.body || {};
  const errors = [];
  if (typeof name !== 'string' || name.trim() === '') errors.push('name is required');
  if (typeof price !== 'number' || price < 0) errors.push('price must be a number >= 0');

  if (errors.length > 0) {
    // Stop here: respond 400 and DON'T call next(). The route never runs.
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
}

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', validateProduct, (req, res) => {
  const product = { id: nextId++, name: req.body.name.trim(), price: req.body.price };
  products.push(product);
  res.status(201).json(product);
});

// A route that throws on purpose, to show the error handler catching it.
// Express 5 forwards errors from async routes automatically - no try/catch needed.
app.get('/api/boom', (req, res) => {
  throw new Error('Something broke while building the response');
});

// --- 404: no route matched --------------------------------------------------
// A normal middleware with no path, placed AFTER all routes.
app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// --- the error handler ------------------------------------------------------
// FOUR parameters (err, req, res, next) is how Express knows this is the error
// handler, not an ordinary middleware. It must be LAST. Any error thrown above,
// or passed with next(err), lands here.
app.use((err, req, res, next) => {
  console.error('Caught by error handler:', err.message);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Validation + errors demo on http://localhost:${PORT}`);
  console.log('Send the requests in week07/class1/03_requests.http');
});
