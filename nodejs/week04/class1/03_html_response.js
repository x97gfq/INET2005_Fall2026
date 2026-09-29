// Example 3: sending HTML instead of plain text
// Run:  docker compose exec node node week04/class1/03_html_response.js
// Open: http://localhost:3001   (Ctrl+C in the terminal to stop it)

const http = require('http');

const port = 3001;

const server = http.createServer((req, res) => {
  const now = new Date().toLocaleTimeString();

  // A template literal (backticks) can span lines and embed values with ${ }
  const html = `<!DOCTYPE html>
<html>
<head><title>My page</title></head>
<body>
  <h1>Hello there</h1>
  <p>This page was built by Node at ${now}. Refresh and watch it change.</p>
</body>
</html>`;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(html);
});

server.listen(port, () => {
  console.log(`Server started, go to http://localhost:${port}`);
});
