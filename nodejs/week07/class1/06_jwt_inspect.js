// Middleware 6: receiving a JWT (Authorization: Bearer <token>) and unwrapping it
// Run:  docker compose exec node node week07/class1/06_jwt_inspect.js
// Test: open week07/class1/06_requests.http in VS Code (REST Client) and send each request
//
// A JWT ("jot", JSON Web Token) is how most APIs know who's calling. Instead of a
// session cookie (class 2), the client sends a token on EVERY request:
//     Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
//
// A JWT is three base64url pieces joined by dots:   HEADER.PAYLOAD.SIGNATURE
//   header    - {"alg":"HS256","typ":"JWT"}       which algorithm signed it
//   payload   - {"sub":"42","name":"Alice",...}   the "claims": who, and until when
//   signature - HMAC of header.payload using a SECRET only the server knows
// The payload is ENCODED, not encrypted - anyone can read it (/api/inspect proves it).
// The signature is what stops anyone from CHANGING it (/api/profile checks it).
//
// ---- Make your own token at https://jwt.io --------------------------------------
//   1. Open https://jwt.io and switch to the encoder (the side where you build a token).
//   2. Header: leave it as {"alg":"HS256","typ":"JWT"}.
//   3. Payload: paste something like
//        { "sub": "42", "name": "Alice", "role": "student", "iat": 1790000000 }
//      Optional: add "exp" (expiry) as a Unix time in SECONDS, e.g. 1893456000 = 2030-01-01.
//      An exp in the past gets you a "Token expired" 401 - try it.
//   4. Secret: paste the JWT_SECRET below (inet2005-week7-jwt-demo-secret-key).
//   5. Copy the token, paste it into @token in 06_requests.http, and send the requests.
//   Then change ONE letter of the secret on jwt.io: /api/inspect still reads it, but
//   /api/profile says "Invalid token". That's the whole point of the signature.
// No jwt.io? POST /api/token makes one for you (see 06_requests.http).

const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// In a real app this lives in .env (week 5) and is long and random. Anyone who knows
// it can make tokens that this server will trust.
const JWT_SECRET = process.env.JWT_SECRET || 'inet2005-week7-jwt-demo-secret-key';

app.use(express.json());

// Pull the token out of "Authorization: Bearer <token>". null if it's missing.
function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

// base64url -> JSON object. This is ALL jwt.decode() does for the first two parts.
function decodePart(part) {
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
}

app.get('/', (req, res) => {
  res.send(
    'Send a request with "Authorization: Bearer <token>" to /api/inspect or /api/profile. ' +
      'Make a token at https://jwt.io or POST /api/token. See 06_requests.http.'
  );
});

// (1) Unwrap it BY HAND - no library, and NO verification.
//     Shows that the payload is readable by anyone. Never trust what this returns.
app.get('/api/inspect', (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Send an Authorization: Bearer <token> header' });

  const parts = token.split('.');
  if (parts.length !== 3) return res.status(400).json({ error: 'A JWT has 3 parts separated by dots' });

  try {
    const header = decodePart(parts[0]);
    const payload = decodePart(parts[1]);
    res.json({
      warning: 'Decoded but NOT verified - anyone could have written this',
      header,
      payload,
      signature: parts[2],
      // exp and iat are Unix times in SECONDS; Date wants milliseconds
      issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
      expires: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'never (no exp claim)',
    });
  } catch (err) {
    res.status(400).json({ error: 'That is not valid base64url JSON' });
  }
});

// (2) The real thing: a guard middleware, the same shape as requireKey in 01.
//     jwt.verify() re-computes the signature with OUR secret and checks exp.
//     If it passes, the payload is trustworthy and goes on req.user for the route.
function requireJwt(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  try {
    // algorithms: only accept the one we sign with, never whatever the header claims
    req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch (err) {
    // TokenExpiredError: exp is in the past. JsonWebTokenError: bad signature, malformed...
    const reason = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    res.status(401).json({ error: reason, detail: err.message });
  }
}

app.get('/api/profile', requireJwt, (req, res) => {
  res.json({ message: `Hello ${req.user.name || req.user.sub}, your token checks out`, user: req.user });
});

// (3) Optional: let the server make a token, so you can test without jwt.io.
//     In a real app this is the LOGIN route - it checks a password first (class 2 does).
app.post('/api/token', (req, res) => {
  const { name = 'Alice', role = 'student' } = req.body || {};
  const token = jwt.sign({ sub: '42', name, role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`JWT demo on http://localhost:${PORT}`);
  console.log('Send the requests in week07/class1/06_requests.http');
});
