// Example 2: a JSON API
// Run:  docker compose exec node node week04/class1/02_json_api.js
// Then open http://localhost:3001 (raw JSON)
//
// CORS test: open http://localhost:3000, press F12, and in the Console run
//   fetch('http://localhost:3001').then(r => r.json()).then(console.log)
// That page is on a different port, so the browser only lets it read this
// response because of the Access-Control-Allow-Origin header below.

const http = require('http');

const port = 3001;

// An array of objects - exactly what JSON looks like
const books = [
  { title: 'The Rise of Anti-Intellectualism in America', author: 'Richard Hofstadter' },
  { title: "The Omnivore's Dilemma", author: 'Michael Pollan' },
  { title: 'Reclaiming Conversation', author: 'Sherry Turkle' },
  { title: 'Ungrading', author: 'Susan D. Blum' },
  { title: 'In Love with Node.js', author: 'Jamie' },
];

const server = http.createServer((req, res) => {
  // CORS header: lets a page from a DIFFERENT origin (e.g. localhost:3000) read this response
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, GET',
    'Content-Type': 'application/json',
  };

  // Browsers sometimes send an OPTIONS "preflight" request first
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    console.log('GET request - sending the book list');
    res.writeHead(200, headers);
    res.end(JSON.stringify(books)); // turn the JS array into a JSON string
    return;
  }

  res.writeHead(405, headers);
  res.end(JSON.stringify({ error: `${req.method} is not allowed` }));
});

server.listen(port, () => {
  console.log(`JSON API on http://localhost:${port}`);
});
