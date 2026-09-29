// Example 5: using your own module
// Run:  docker compose exec node node week04/class1/05_modules.js
// Open: http://localhost:3001   (Ctrl+C in the terminal to stop it)

const http = require('http');

// './' means "a file in this folder" - no './' means "a built-in or npm package"
const dt = require('./myfirstmodule');

const port = 3001;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('The date and time are currently: ' + dt.myDateTime());
}).listen(port, () => {
  console.log(`Server started, go to http://localhost:${port}`);
});
