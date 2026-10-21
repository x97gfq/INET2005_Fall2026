# A complete prompt: rebuild the Movies API from scratch

This is the prompt you would give an AI coding assistant (Claude, Copilot, ChatGPT...) to
build everything in `mflix-api/` from nothing. It's long on purpose. Compare it with what
most people type:

> make me a secure express api for movies with jwt

That leaves the assistant to guess the stack, the folder layout, the rules, the error
format, which roles exist, what "secure" means and what files you need. Every guess is a
place where you get something different from what you wanted, and a security guess is a
place where you get nothing at all. A good prompt says:

1. **Context**: who you are, what already exists, what it runs on
2. **The goal**: what is being built, in one paragraph
3. **Exact requirements**: endpoints, rules, status codes, names
4. **Security requirements**: spelled out, because an assistant will skip what you don't ask for
5. **Constraints**: packages allowed, style, what *not* to do
6. **Deliverables**: every file you expect back
7. **How you'll check it**: tests that must pass
8. **What to report back**: assumptions and remaining risks

It covers everything in our final version, including **helmet**, **login rate limiting**
and a **logout that revokes the token**. Compare what you get back with `mflix-api/`.

**Using it:** copy everything inside the box below. An assistant's code is a first draft
from a fast, confident junior developer. **Read every file**, run every request, and if you
can't explain a line, ask the assistant to explain it or take it out. You are the one who
answers for it.

---

````text
## Context

I'm a college web development student. I have a Docker Compose environment with:
- a Node.js 22 container (service "node", code mounted at /app, port 3001 published)
- MongoDB 8 (service "mongo", no authentication, local development only), reachable from
  the node container at mongodb://mongo:27017 (MONGO_URL is already set in the environment)
- MongoDB's sample_mflix database already loaded. The movies collection has ~23,500
  documents with fields like: title, year, runtime, genres[], rated, plot, directors[],
  cast[], imdb { rating, votes }, type ("movie" | "series"). Some old documents have bad
  data (e.g. year stored as the string "1981è"), so reads must tolerate it.

## Goal

Build a REST API microservice for sample_mflix.movies with Express 5 and Mongoose 9:
public reads, authenticated writes with role-based permissions, custom validation
middleware, structured logging, and a consistent JSON error format. It should be
something I'd be comfortable showing a security-minded reviewer, and the code should
teach: comment the WHY of each decision for a student reader.

## Stack and constraints

- CommonJS (require), Node 22, Express 5 (rely on Express 5 forwarding errors thrown in
  async routes; no try/catch in route handlers)
- Packages: express, mongoose, dotenv, jsonwebtoken, bcryptjs, morgan, winston, helmet,
  express-rate-limit, swagger-ui-express, yaml. Do NOT add any others (no Joi, Zod,
  express-validator, Passport): validation must be my own middleware so I can learn how
  it works.
- Folder layout:
    server.js              app setup, middleware order, 404, error handler, connect then listen
    config.js              every setting read from process.env in one place
    logger.js              the winston logger
    middleware/validate.js custom validation middleware
    middleware/auth.js     requireJwt and requireRole
    middleware/rateLimit.js the login rate limiter
    routes/auth.js         login, me, logout
    routes/movies.js       CRUD
    models/Movie.js        Mongoose schema
    models/RevokedToken.js logged-out token ids (TTL index)
    public/                the existing front end (index.html + app.js)
    openapi.yaml           OpenAPI 3.0 description, served by Swagger UI at /api-docs
- Settings come from a .env file loaded with dotenv BEFORE anything reads process.env.
  Variables already set in the environment (Docker) must win over .env.
- Every error response has the shape { "error": "message" }, plus "details":
  { field: message } for validation errors.

## Endpoints

Public:
- GET /api/movies?title=&genre=&year=&page=&limit=
    title = case-insensitive substring match (escape regex special characters first);
    genre = exact match in genres[]; year = exact 4-digit year.
    Pagination: page >= 1 (default 1), limit 1-100 (default 20).
    Response: { page, limit, total, totalPages, results } with results showing only
    title, year, genres, runtime, rated, imdb.rating, sorted by title then _id so pages
    never overlap.
- GET /api/movies/:id -> the full document, or 404 { error: "Movie not found" }

Auth:
- POST /api/auth/login { username, password } -> { token, tokenType: "Bearer", expiresIn }
- GET /api/auth/me (token required) -> { user, role, expires }
- POST /api/auth/logout (token required) -> 204; that token is rejected from then on

Writes (token required):
- POST   /api/movies       editor or admin -> 201, Location header, the created movie
- PUT    /api/movies/:id   editor or admin -> replaces the whole document (fields not sent are removed)
- PATCH  /api/movies/:id   editor or admin -> changes only the fields sent
- DELETE /api/movies/:id   admin only -> 204 with no body
All writes run Mongoose validators (runValidators: true on updates).

## Users and roles

For this exercise, hard-code three demo users in routes/auth.js with bcrypt hashes
(cost 10), never plaintext passwords in code:
  alice / password123 -> admin   (everything)
  bob   / letmein     -> editor  (create, update)
  carol / hunter2     -> viewer  (read only; can log in but every write is 403)
Add a comment that a real app keeps users in a database collection.

## Custom validation middleware (middleware/validate.js)

Each validator is middleware that either responds 400 (and does NOT call next) or calls
next(). Never neither. Write:
- validateMovie({ partial }) — a function that RETURNS middleware. A table of one rule
  per field (each rule returns an error message or null):
    title     non-empty string, max 200, required unless partial
    year      integer 1870-2100
    runtime   integer 1-1000
    genres, directors, cast   arrays of strings, max 50 items
    rated     non-empty string, max 20
    plot      non-empty string, max 1000
    type      "movie" or "series"
    imdb      object with only rating (number 0-10) and votes (integer >= 0)
  The body must be a JSON object (not an array or null). Unknown fields are REJECTED
  with a message, not silently dropped (this blocks mass assignment like
  { "isAdmin": true } and operator injection like { "$where": ... }).
  partial: true (PATCH) requires at least one field. Report ALL problems at once.
- validateId — :id must be 24 hex characters, else 400 (checked before any database call).
- validateMovieQuery — only title, genre, year, page, limit are allowed; each must appear
  at most once (a repeated key arrives as an array: reject it); length caps on text;
  an empty value means "no filter".
- validateLogin — username and password are non-empty strings with sensible max lengths.
Also keep a pickFields() allow-list in the routes as defence in depth.

## Authentication and authorization (middleware/auth.js, routes/auth.js)

- requireJwt reads "Authorization: Bearer <token>", verifies it with jwt.verify using
  the secret from config and algorithms: ['HS256'] ONLY (so "alg": "none" and algorithm
  swaps fail), and puts the payload on req.user. Missing/invalid -> 401; expired -> 401
  { error: "Token expired" }.
- requireRole(...roles) returns middleware: 403 if req.user.role isn't listed.
- Middleware order on each route: requireJwt, requireRole, then validation, then the
  handler, so an anonymous caller gets 401 and learns nothing about the validation rules.
- Login: compare with bcrypt. If the username doesn't exist, still run bcrypt.compare
  against a dummy hash so response time doesn't reveal which usernames exist. One
  message for both failures: 401 { error: "Invalid username or password" }.
- Token payload: { sub: username, role } only, plus a unique jti (crypto.randomUUID())
  set with jwt.sign's jwtid option. No password, nothing secret (the payload is readable
  by anyone). Expiry from JWT_EXPIRES_IN (default "1h").
- Logout must really invalidate the token: store its jti in a revoked_tokens MongoDB
  collection (Mongoose model) with expiresAt = the token's exp and a TTL index
  (expires: 0) so entries delete themselves. requireJwt (async) rejects a token with no
  jti or a revoked jti: 401 { error: "Token has been logged out. Log in again" }.
- JWT_SECRET comes from .env. If NODE_ENV=production and it's missing, throw at startup.
  In development, fall back to a clearly-named dev secret and log a warning.

## Logging (logger.js, server.js)

- winston: level from LOG_LEVEL (default "http"); JSON lines with timestamps; transports
  for a coloured console, logs/error.log (errors only) and logs/combined.log.
- morgan for request logging, streamed into logger.http(), format
  ":method :url :status :response-time ms user=:user" with a custom :user token from req.user.
- logger.info audit lines for login success and every create/update/delete, including
  WHO did it (req.user.sub) and the movie id.
- logger.warn for failed logins (username + IP), rejected tokens (the reason, NOT the
  token), 403s and unmatched routes.
- NEVER log passwords, tokens, the Authorization header or full request bodies.

## Error handling (server.js)

- JSON 404 for any unmatched /api route.
- A final error handler (err, req, res, next) that maps: Mongoose CastError -> 400,
  Mongoose ValidationError -> 400 with details per field, invalid JSON body -> 400,
  body too large -> 413, anything else -> 500 { error: "Something went wrong on the
  server" }. The stack trace goes to logger.error, never into the response.
- Connect to MongoDB first, then listen. If the connection fails, log it and exit(1).

## Other security requirements

- helmet() as the first middleware. Keep its default Content-Security-Policy (scripts only
  from 'self', so any front-end JavaScript must be in a .js file, not an inline <script>),
  add connect-src for any other API the front end calls, and turn off
  upgrade-insecure-requests while developing on http://localhost (with a comment to
  re-enable it on HTTPS). Swagger UI at /api-docs must still work.
- express-rate-limit on POST /api/auth/login, AFTER validateLogin: 5 FAILED attempts
  (skipSuccessfulRequests) per username + IP (use the package's ipKeyGenerator for the IP)
  per 15 minutes; a successful login resets that key. 429 { error } with draft-8 RateLimit
  headers and Retry-After. Max attempts configurable with LOGIN_MAX_ATTEMPTS.
- express.json({ limit: '10kb' }).
- app.disable('x-powered-by').
- No CORS middleware (same-origin only); add a comment on how to allow ONE specific
  origin if that changes.
- Swagger UI disabled when NODE_ENV=production.
- Query values are always treated as strings, never passed to Mongo as objects.

## Deliverables

1. All the source files listed above, commented for a student reader.
2. openapi.yaml: every endpoint, a bearerAuth security scheme (so Swagger's Authorize
   button works), and the 400/401/403/404/413/429 responses with examples.
3. .env.example with every variable (PORT, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN,
   LOGIN_MAX_ATTEMPTS, LOG_LEVEL, NODE_ENV), comments, and a one-line command to generate a random secret.
   JWT_SECRET is left empty.
4. A .gitignore covering node_modules/, .env and logs/.
5. requests.http for the VS Code REST Client extension, in order: public reads;
   validation failures; a write with no token (401); login failures; logins for all
   three users saved with "# @name"; a viewer write (403); an invalid body (400);
   create / read / PATCH / PUT; an editor delete (403); an admin delete (204); 404
   afterwards; expired, forged (wrong secret) and "alg": "none" tokens (all 401);
   six failed logins for a non-existent user (the sixth is 429); log in, log out, then
   the same token is 401; a request whose response headers show helmet's work;
   invalid JSON; an unknown route. Include the precomputed bad tokens. Use a random
   username ({{$guid}}) for the "no such user" test so re-runs never hit the rate limit.
6. A Postman v2.1 collection with the same requests in numbered folders, collection
   variables (baseUrl, token_alice, token_bob, token_carol, movieId) set from test
   scripts, and a pm.test status check (plus a body check where useful) on every
   request, so `npx newman run` passes from top to bottom.
7. README.md: how to run it in Docker, the demo users, and a table of every route with
   who may call it.

## How I will check it

- `npx newman run <collection>` passes every assertion against a fresh start.
- Six failed logins in a row for one username get 429 on the sixth, and the collection
  can be run twice in a row without failing.
- After POST /api/auth/logout, the same token gets 401.
- The front end and Swagger UI load with no Content-Security-Policy errors in the
  browser console.
- No password or token appears anywhere in logs/combined.log after running the collection.
- Starting with NODE_ENV=production and no JWT_SECRET refuses to start.

## When you're done

List (1) every assumption you made, (2) anything in this prompt you did NOT do or did
differently, and why, and (3) the security and production loose ends that remain
(e.g. HTTPS, refresh tokens, a shared rate-limit store, users in the database, log
rotation, MongoDB authentication). Don't claim it's "production ready".
````
