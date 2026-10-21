# Week 7: Middleware, Logging and JWT

| | Topic | Activities |
|---|---|---|
| **Class 1** | Assignment 3 review, then the Express backend properly: what **middleware** is, `express.Router`, a central **error handler**, **input validation**, **logging** with morgan + winston, and reading a **JWT** bearer token | Activity 6: Bookmarks API |
| **Class 2** | **Tie it together**: the week 6 movies API (`mflix`) rebuilt with custom validation middleware, morgan + winston, a JWT login with roles, helmet, a login rate limit and a logout that revokes the token, updated `requests.http` + Postman, the loose ends to tie up before you push, and a complete AI prompt that rebuilds it all | Activity 7: The Token Lifecycle (Bruno) |

EJS templates and sessions moved to [week 8](../week08/README.md).

Slides: `slides/nodejs_week7.pptx` (built by `slides/build_week7_deck.js`).

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d        # installs new packages: morgan, winston, jsonwebtoken, bcryptjs, helmet, express-rate-limit (+ ejs, express-session for week 8)
```

`package.json` adds **morgan**, **winston**, **jsonwebtoken**, **bcryptjs**, **helmet** and **express-rate-limit** (and week 8's **ejs** and
**express-session**); the node container installs them when it starts. If an example reports
`Cannot find module 'morgan'` (or `winston`, `jsonwebtoken`, `bcryptjs`), run `docker compose restart node` to re-run `npm install`.

Class 2's movies API needs MongoDB's `sample_mflix` (already loaded in week 6). If you
skipped it:

```bash
docker compose exec node node week06/class1/00_seed_mflix.js
```

## Cheat sheet

- **server** = keeps running. Open the URL, watch the terminal, **Ctrl+C** to stop it. One server per port.
- **script** = prints to the terminal and exits by itself.

Every example runs on **port 3001**, so run one at a time (Ctrl+C before starting the next).

### Class 1 — Middleware, Router, errors, validation, logging, JWT

| What | Type | Command |
|---|---|---|
| What middleware is (logger, timing, `next()`, a route guard) | server | `docker compose exec node node week07/class1/01_what_is_middleware.js` |
| `express.Router` (a `/api/tasks` mini-app) | server | `docker compose exec node node week07/class1/02_router_basics.js` |
| Validation + a central error handler + 404 | server | `docker compose exec node node week07/class1/03_errors_and_validation.js` |
| Requests for the above | VS Code | Open `week07/class1/03_requests.http`, click **Send Request** |
| Request logging with **morgan** (terminal + `logs/access.log`) | server | `docker compose exec node node week07/class1/04_logging_morgan.js` |
| App logging with **winston** (levels, console + log files, morgan feeding in) | server | `docker compose exec node node week07/class1/05_logging_winston.js` |
| Same, with verbose/debug messages shown | server | `docker compose exec -e LOG_LEVEL=debug node node week07/class1/05_logging_winston.js` |
| Requests for 05 | VS Code | `week07/class1/05_requests.http` |
| Receive a **JWT** (`Authorization: Bearer ...`): unwrap it, then verify it in middleware | server | `docker compose exec node node week07/class1/06_jwt_inspect.js` |
| Requests for 06 (good, expired and forged tokens) | VS Code | `week07/class1/06_requests.http` |
| **Activity 6**: Bookmarks API (starter with TODOs) | server | `docker compose exec node node week07/class1/activity6/bookmarks_api.js` |
| Activity 6 requests | VS Code | `week07/class1/activity6/bookmarks.http` |

While `01_what_is_middleware.js` runs:

| URL | What |
|---|---|
| http://localhost:3001/ | A request id added by middleware |
| http://localhost:3001/slow | The logger times a slow response (~1s) |
| http://localhost:3001/admin | 401 — the route guard blocks it |
| http://localhost:3001/admin?key=secret | The guard calls `next()` and lets you through |

### Making a JWT at jwt.io (for `06_jwt_inspect.js`)

`06_requests.http` already has a working token, but making your own shows how it works:

1. Open **https://jwt.io** and use the encoder (the side where you build a token).
2. **Header:** leave it as `{"alg":"HS256","typ":"JWT"}`.
3. **Payload:** for example `{ "sub": "42", "name": "Alice", "role": "student", "iat": 1790000000 }`.
   Add `"exp"` (expiry, Unix time in **seconds**, e.g. `1893456000` = 2030-01-01) if you want one.
   An `exp` in the past gets you `401 Token expired`.
4. **Secret:** `inet2005-week7-jwt-demo-secret-key` (the demo's `JWT_SECRET`).
5. Copy the token into `@token` at the top of `06_requests.http` and send the requests.

Then change one letter of the secret on jwt.io and try again: `/api/inspect` still reads the
token (the payload is only *encoded*, anyone can read it), but `/api/profile` answers
`401 Invalid token`, because the signature no longer matches. No jwt.io? `POST /api/token`
makes one for you.

### Class 2 — Tie it together: the movies API, secured

`class2/mflix-api/` is a copy of `week06/class1/movies-api/` with everything from class 1 added.
Compare the two folders side by side: the routes inside are the same; what's new is the
middleware in front of them.

| What | Type | Command |
|---|---|---|
| **Movies API, week 7 edition** (validation, logging, JWT + roles, helmet, rate limit, logout) | server | `docker compose exec node node week07/class2/mflix-api/server.js` |
| Same, with debug logging | server | `docker compose exec -e LOG_LEVEL=debug node node week07/class2/mflix-api/server.js` |
| Requests, top to bottom (login saves the tokens) | VS Code | Open `week07/class2/mflix-api/requests.http`, click **Send Request** |
| Postman | Postman | Import `week07/class2/mflix-api/mflix-api.postman_collection.json` |
| All 36 Postman requests (59 tests), from the terminal | 2nd terminal | `docker compose exec node npx -y newman run week07/class2/mflix-api/mflix-api.postman_collection.json` |
| The log files | VS Code | `week07/class2/mflix-api/logs/combined.log` and `error.log` |
| What's still not done | read | [`mflix-api/BEFORE_YOU_PUSH.md`](class2/mflix-api/BEFORE_YOU_PUSH.md) |
| A complete prompt that rebuilds all of it | read | [`class2/PROMPT.md`](class2/PROMPT.md) |

Demo logins (`POST /api/auth/login`):

| User | Password | Role | Can |
|---|---|---|---|
| alice | password123 | admin | read, create, update, **delete** |
| bob | letmein | editor | read, create, update |
| carol | hunter2 | viewer | read only (every write is `403`) |

While it runs:

| URL | What |
|---|---|
| http://localhost:3001 | The week 6 front end, unchanged. Reading is still public |
| http://localhost:3001/api-docs | Swagger UI: log in with `POST /api/auth/login`, click **Authorize**, paste the token |
| http://localhost:3001/api/movies?year=nineteen | `400` from the validation middleware |

Three security additions on top of class 1:

| What | Where | Try it |
|---|---|---|
| **helmet**: security headers, including a Content-Security-Policy that blocks inline scripts (so the front end's script moved to `public/app.js`) | `server.js` | `requests.http` section 9: read the response headers |
| **Login rate limit**: 5 failed tries per username + IP per 15 min, then `429` | `middleware/rateLimit.js` | Section 7: send the `eve` login six times |
| **Logout** that kills the token, not just the client's copy (its `jti` goes in `revoked_tokens`) | `routes/auth.js`, `models/RevokedToken.js`, `middleware/auth.js` | Section 8: log out, then the same token gets `401` |

The rate limit counts in memory, so restarting the server resets it.

**Activity 7: The Token Lifecycle.** Build a [Bruno](https://www.usebruno.com/downloads)
collection that logs in, uses the token, gets refused (403), logs out, and shows the same
token refused (401). Then predict-and-send the bad cases and explain what happened.
Instructions: [`class2/activity7/README.md`](class2/activity7/README.md).

| What | Type | Command |
|---|---|---|
| Activity 7 starter collection (one example request) | Bruno | Open Collection > `week07/class2/activity7/mflix-bruno/`, environment **local** |
| Run a collection from the terminal (API running) | 2nd terminal | `docker compose exec node sh -c "cd week07/class2/activity7/mflix-bruno && npx -y @usebruno/cli run --env local"` |

Optional practice: pick one item from the "Still loose" tables in `BEFORE_YOU_PUSH.md`
(a `/health` route, graceful shutdown, a request id on every log line) and tie it up.

### Answer keys

| For | Command |
|---|---|
| Activity 6: Bookmarks API | `docker compose exec node node week07/class1/_solution/activity6_bookmarks_api.js` |
| Activity 7: Token Lifecycle (15 requests, 20 tests) | Open `week07/class2/_solution/activity7-bruno/` in Bruno, or `docker compose exec node sh -c "cd week07/class2/_solution/activity7-bruno && npx -y @usebruno/cli run --env local"` |

## How this connects

- **Logging**: `01_what_is_middleware.js` hand-rolls a request logger; `04` replaces it with
  morgan (the same middleware, already written) and `05` adds winston for the app's own messages.
  The class 2 API uses both: morgan for every request, winston for logins, rejections and changes.
- **Validation**: `03` validates one product by hand. `mflix-api/middleware/validate.js` does the
  same for movies with a table of rules, one per field, and `validateMovie()` *returns* a middleware
  so POST, PUT and PATCH share it.
- **JWT**: `06_jwt_inspect.js` verifies a token but hands one to anyone (`POST /api/token`).
  `mflix-api/routes/auth.js` checks a bcrypt password first, and `requireRole` adds the
  difference between `401` (who are you?) and `403` (not allowed).
- **Middleware** isn't new: you used `express.json()` and `express.static` in week 6. Class 1
  names the pattern; class 2 puts four of them in front of a single route.
- **Next week**: EJS and sessions. A session answers the same question as a JWT (who is
  this?) with a cookie instead of a token, and `requireLogin` has the same shape as `requireJwt`.

## Files

```
week07/
├── class1/
│   ├── 01_what_is_middleware.js   server  logger, timing, next(), a route guard
│   ├── 02_router_basics.js        server  express.Router mounted at /api/tasks
│   ├── taskRouter.js              the /api/tasks router that 02 require()s
│   ├── 03_errors_and_validation.js server validation middleware + 404 + error handler
│   ├── 03_requests.http           REST Client requests for 03
│   ├── 04_logging_morgan.js       server  morgan: 'dev' format, custom token, access log file
│   ├── 05_logging_winston.js      server  winston levels + transports, morgan -> winston
│   ├── 05_requests.http           REST Client requests for 05
│   ├── 06_jwt_inspect.js          server  Bearer token: decode by hand, then jwt.verify() guard
│   ├── 06_requests.http           REST Client requests for 06, with ready-made tokens
│   ├── logger.js                  the winston logger that 05 require()s
│   ├── logs/                      written by 04 and 05 (git-ignored)
│   ├── activity6/                 Activity 6 starter: bookmarks_api.js, bookmarks.http
│   └── _solution/                 Activity 6 answer key
└── class2/
    ├── PROMPT.md                  a complete AI prompt that rebuilds mflix-api from scratch
    ├── activity7/                 Activity 7: README.md (the activity) + mflix-bruno/ (starter collection)
    ├── _solution/activity7-bruno/ Activity 7 answer key (Bruno collection)
    └── mflix-api/                 week06/class1/movies-api + everything from class 1
        ├── server.js              helmet, morgan -> winston, 10 kB body limit, 404, error handler
        ├── config.js              settings + JWT_SECRET from .env (refuses to start in production without one)
        ├── logger.js              winston: console + logs/error.log + logs/combined.log
        ├── middleware/validate.js validateMovie, validateId, validateMovieQuery, validateLogin
        ├── middleware/auth.js     requireJwt (401, incl. logged-out tokens), requireRole (403)
        ├── middleware/rateLimit.js 5 failed logins / 15 min -> 429
        ├── routes/auth.js         POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout
        ├── routes/movies.js       the week 6 CRUD routes, with middleware in front of each
        ├── models/Movie.js        unchanged from week 6
        ├── models/RevokedToken.js logged-out token ids, deleted by a TTL index when they expire
        ├── public/index.html      week 6's page, with its script moved out to...
        ├── public/app.js          ...here, because helmet's CSP blocks inline scripts
        ├── openapi.yaml           + bearerAuth, login, logout, 401/403/429 (Swagger's Authorize button)
        ├── requests.http          VS Code REST Client requests
        ├── mflix-api.postman_collection.json
        ├── .env.example
        ├── BEFORE_YOU_PUSH.md     loose ends: what's done, what's still to do
        └── logs/                  written by winston (git-ignored)
```
