// Activity 1: Build Your Own Server
// Run:  docker compose exec node node week04/class1/activity1/my_server.js
// Open: http://localhost:3001
//
// Every time you change this file: Ctrl+C in the terminal, then run it again.
// The server is a running program - it keeps the old code until you restart it.
//
// Requirements (see the slides for details):
//   1. Run it as-is first: it already listens on 3001 and shows a placeholder page
//   2. Log every request (method + URL) to the terminal
//   3. /       a home page with your name, a list built from the array below, and the current date/time
//   4. /about  a second page, with links between the two pages
//   5. Count visits: "This page has been viewed N times since the server started"
//   6. Anything else: a 404 page, sent with status code 404

const http = require('http');

const port = 3001;

// TODO: change these to your own favourites (games, teams, albums, places...)
// Keep at least 3 objects, each with the same properties.
const favourites = [
  { name: 'Example one', why: 'Replace me' },
  { name: 'Example two', why: 'Replace me' },
  { name: 'Example three', why: 'Replace me' },
];

// Wraps any content in a full HTML page, so every route looks the same.
// You don't need to change this, but you can add CSS if you like.
function page(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container py-4">
    ${content}
  </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  // TODO 2: log the request method and URL

  if (req.url === '/') {
    // TODO 3: build the home page
    //   - turn the favourites array into <li> items with .map() and .join('')
    //   - show new Date().toLocaleString()
    // TODO 5: add one to a visit counter and show it (where must the counter variable live?)
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page('Home', '<h1>Hello from my server</h1>'));
  } else if (req.url === '/about') {
    // TODO 4: an about page with a link back to /
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page('About', '<p>TODO: about page</p>'));
  } else {
    // TODO 6: a proper 404 page. Right now it says "not found" but the status code is still 200!
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page('Not found', '<p>TODO: not found</p>'));
  }
});

// 1. Start listening. This line is what makes the program a server that keeps running.
server.listen(port, () => {
  console.log(`My server is running at http://localhost:${port}`);
});
