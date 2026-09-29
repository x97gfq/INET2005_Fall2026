// Example 4: reading a file from disk and sending it
// Run:  docker compose exec node node week04/class1/04_serve_file.js
// Open: http://localhost:3001   (Ctrl+C in the terminal to stop it)

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3001;

// __dirname is the folder THIS file lives in, so the path works
// no matter which folder you run node from
const file = path.join(__dirname, 'index.html');

// fs.readFile is asynchronous: Node carries on, and calls the arrow
// function (the "callback") later, once the file has been read
fs.readFile(file, (err, html) => {
  if (err) {
    console.error('Could not read index.html:', err.message);
    return;
  }

  const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
  });

  server.listen(port, () => {
    console.log(`Server started, go to http://localhost:${port}`);
  });
});

console.log('This line prints BEFORE the file has been read. Why?');
