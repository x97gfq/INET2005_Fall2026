// ANSWER KEY - Activity 1: Build Your Own Server
// Run:  docker compose exec node node week04/class1/_solution/activity1_my_server.js
// Open: http://localhost:3001, http://localhost:3001/about, http://localhost:3001/nope

const http = require('http');

const port = 3001;

const favourites = [
  { name: 'Halifax Mooseheads', why: 'Scotiabank Centre on a Friday night' },
  { name: 'Cape Breton Highlands', why: 'The Cabot Trail in October' },
  { name: 'Donairs', why: 'Sweet sauce, obviously' },
];

// Requirement 5: the counter lives OUTSIDE the request function, so it survives
// between requests. It resets to 0 only when the server (the program) restarts.
let visits = 0;

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
    <nav class="mb-4"><a href="/">Home</a> | <a href="/about">About</a></nav>
    ${content}
  </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  // Requirement 2: every request shows up in the terminal.
  // Notice the browser also asks for /favicon.ico - that's the 404 route at work.
  console.log(`${new Date().toLocaleTimeString()}  ${req.method} ${req.url}`);

  if (req.url === '/') {
    // Requirement 3 + 5
    visits++;

    // map turns each object into an <li> string; join glues them into one string
    const items = favourites
      .map((f) => `<li class="list-group-item"><strong>${f.name}</strong>: ${f.why}</li>`)
      .join('');

    const html = page('Home', `
      <h1>Hello, I'm Jamie</h1>
      <p class="lead">This page was built by a Node.js server, not Apache.</p>
      <h2 class="h4">A few favourites</h2>
      <ul class="list-group mb-4">${items}</ul>
      <p>Server time: ${new Date().toLocaleString()}</p>
      <p class="text-muted">This page has been viewed ${visits} time${visits === 1 ? '' : 's'} since the server started.</p>`);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.url === '/about') {
    // Requirement 4
    const html = page('About', `
      <h1>About this server</h1>
      <p>Running on Node ${process.version}, listening on port ${port}.</p>
      <p>It has been up for ${Math.round(process.uptime())} seconds.</p>`);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else {
    // Requirement 6: the status code is what the browser and search engines see;
    // the HTML is just what a person sees
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(page('Not found', `
      <h1>404</h1>
      <p>There's no page at <code>${req.url.replace(/</g, '&lt;')}</code>.</p>`));
  }
});

// Requirement 1
server.listen(port, () => {
  console.log(`My server is running at http://localhost:${port}`);
});
