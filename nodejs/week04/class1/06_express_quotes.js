// Example 6: the same idea with Express, the most popular Node web framework
// Run:  docker compose exec node node week04/class1/06_express_quotes.js
// Open http://localhost:3001 (HTML) and http://localhost:3001/api/quote (JSON)

// express is an npm package (listed in package.json, installed by npm install)
const express = require('express');

const app = express();
const port = 3001;

const quotes = [
  { author: 'Albert Einstein', text: 'Life is like riding a bicycle. To keep your balance you must keep moving.' },
  { author: 'Isaac Newton', text: 'If I have seen further it is by standing on the shoulders of Giants.' },
  { author: 'Yoda', text: 'Do, or do not. There is no try.' },
  { author: 'Nelson Mandela', text: 'It always seems impossible until it is done.' },
  { author: 'Wayne Gretzky', text: "You miss 100% of the shots you don't take." },
];

function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

// A route: when a GET request arrives for '/', run this arrow function
app.get('/', (req, res) => {
  const quote = getRandomQuote();
  console.log('got a request', quote);

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Random Quote</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <figure class="p-4 bg-light rounded">
      <blockquote class="blockquote"><p>${quote.text}</p></blockquote>
      <figcaption class="blockquote-footer">${quote.author}</figcaption>
    </figure>
  </div>
</body>
</html>`);
});

// A second route: res.json() does the JSON.stringify and Content-Type for you
app.get('/api/quote', (req, res) => {
  res.json(getRandomQuote());
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
