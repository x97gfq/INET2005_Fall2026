# Week 7: Middleware, EJS and Sessions

| | Topic | Activities |
|---|---|---|
| **Class 1** | Assignment 3 review, then the Express backend properly: what **middleware** is, `express.Router`, a central **error handler**, **input validation**, **logging** with morgan + winston, and reading a **JWT** bearer token | Activity 6: Bookmarks API |
| **Class 2** | **EJS** server-side templates (`<%= %>` / `<% %>` / partials), a page rendered from MongoDB, and **sessions** with `express-session` (the Node version of Week 2's PHP login) | Activity 7: Session Notepad |

Slides: `slides/nodejs_week7.pptx` (built by `slides/build_week7_deck.js`).

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d        # installs new packages: ejs, express-session, bcryptjs, morgan, winston, jsonwebtoken
```

`package.json` adds **ejs**, **express-session**, **bcryptjs**, **morgan**, **winston** and **jsonwebtoken**; the node container
installs them when it starts. If an example reports `Cannot find module 'ejs'` (or
`express-session`, `morgan`, `winston`, `jsonwebtoken`), run `docker compose restart node` to re-run `npm install`.

Class 2's movies page needs MongoDB's `sample_mflix` (already loaded in week 6). If you
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

### Class 2 — EJS and sessions

| What | Type | Command |
|---|---|---|
| EJS basics: partials, loop, escaped vs. unescaped, a form that renders a response | server | `docker compose exec node node week07/class2/01_ejs_intro.js` |
| Movies rendered from MongoDB (server-side rendering) | server | `docker compose exec node node week07/class2/02_movies_web.js` |
| Login with `express-session` + bcrypt | server | `docker compose exec node node week07/class2/03_sessions_login.js` |
| **Activity 7**: Session Notepad (starter with TODOs) | server | `docker compose exec node node week07/class2/activity7/notes_app.js` |

Demo logins for `03_sessions_login.js`: `alice`/`password123`, `bob`/`letmein`, `carol`/`hunter2`.
Open the dashboard in a private window to see the session cookie is per-browser.

### Answer keys

| For | Command |
|---|---|
| Activity 6: Bookmarks API | `docker compose exec node node week07/class1/_solution/activity6_bookmarks_api.js` |
| Activity 7: Session Notepad | `docker compose exec node node week07/class2/_solution/activity7_notes_app.js` |

## How this connects

- **Logging**: `01_what_is_middleware.js` hand-rolls a request logger; `04` replaces it with
  morgan (the same middleware, already written) and `05` adds winston for the app's own messages.
- **JWT vs. sessions**: `06_jwt_inspect.js` sends who-you-are in a token on every request
  (`Authorization: Bearer ...`); class 2's sessions keep it on the server and send a cookie.
  Both are checked by a guard middleware, the same shape as `requireKey` in `01`.
- **Middleware** isn't new — you used `express.json()` and `express.static` in week 6. Class 1
  names the pattern, and `express-session` in class 2 is just more middleware.
- **EJS** is the Node answer to week 2's PHP: `<?= ?>` → `<%= %>`, `<?php ?>` → `<% %>`.
- **Server-side vs. client-side rendering**: the week 6 movies API sent JSON and the browser
  built the table (`fetch`). `02_movies_web.js` renders the table on the server. Same data,
  different place.
- **Sessions**: `03_sessions_login.js` is `www/login_example4/` (PHP) rebuilt in Node —
  `session_start()` → `app.use(session(...))`, `$_SESSION` → `req.session`,
  `session_destroy()` → `req.session.destroy()`.
- The EJS "input in, response out" form in `01_ejs_intro.js` is the shape of **Week 8**'s
  ChatGPT page — only the function in the middle changes.

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
    ├── 01_ejs_intro.js            server  EJS tags, partials, a form
    ├── 02_movies_web.js           server  server-rendered movies over sample_mflix
    ├── 03_sessions_login.js       server  express-session + bcrypt login
    ├── views/                     shared .ejs templates + partials/
    ├── activity7/                 Activity 7 starter: notes_app.js, views/notes.ejs
    └── _solution/                 Activity 7 answer key + views/
```
