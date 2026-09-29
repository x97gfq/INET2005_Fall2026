// Example 1: the smallest possible web server
// Run:  docker compose exec node node week04/class1/01_hello_http.js
// Open: http://localhost:3001   (Ctrl+C in the terminal to stop it)

// http is built into Node - no npm install needed
const http = require('http');

const port = 3001;

// This function runs once for EVERY request the browser makes
const server = http.createServer((req, res) => {
  console.log(`got a request: ${req.method} ${req.url}`);

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!');
});

// No host given, so Node listens on every network interface.
// (Listening on '127.0.0.1' only would break inside a Docker container.)
server.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
