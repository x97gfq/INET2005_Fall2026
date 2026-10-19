# Week 7: Middleware, EJS and Sessions

| | Topic | Activities |
|---|---|---|
| **Class 1** | Assignment 3 review, then the Express backend properly: what **middleware** is, `express.Router`, a central **error handler**, and **input validation** | Activity 6: Bookmarks API |
| **Class 2** | **EJS** server-side templates (`<%= %>` / `<% %>` / partials), a page rendered from MongoDB, and **sessions** with `express-session` (the Node version of Week 2's PHP login) | Activity 7: Session Notepad |

Slides: `slides/nodejs_week7.pptx` (built by `slides/build_week7_deck.js`).

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d        # installs new packages: ejs, express-session, bcryptjs
```

`package.json` adds **ejs**, **express-session** and **bcryptjs**; the node container
installs them when it starts. If an example reports `Cannot find module 'ejs'` (or
`express-session`), run `docker compose restart node` to re-run `npm install`.

Class 2's movies page needs MongoDB's `sample_mflix` (already loaded in week 6). If you
skipped it:

```bash
docker compose exec node node week06/class1/00_seed_mflix.js
```

## Cheat sheet

- **server** = keeps running. Open the URL, watch the terminal, **Ctrl+C** to stop it. One server per port.
- **script** = prints to the terminal and exits by itself.

Every example runs on **port 3001**, so run one at a time (Ctrl+C before starting the next).

### Class 1 — Middleware, Router, errors, validation

| What | Type | Command |
|---|---|---|
| What middleware is (logger, timing, `next()`, a route guard) | server | `docker compose exec node node week07/class1/01_what_is_middleware.js` |
| `express.Router` (a `/api/tasks` mini-app) | server | `docker compose exec node node week07/class1/02_router_basics.js` |
| Validation + a central error handler + 404 | server | `docker compose exec node node week07/class1/03_errors_and_validation.js` |
| Requests for the above | VS Code | Open `week07/class1/03_requests.http`, click **Send Request** |
| **Activity 6**: Bookmarks API (starter with TODOs) | server | `docker compose exec node node week07/class1/activity6/bookmarks_api.js` |
| Activity 6 requests | VS Code | `week07/class1/activity6/bookmarks.http` |

While `01_what_is_middleware.js` runs:

| URL | What |
|---|---|
| http://localhost:3001/ | A request id added by middleware |
| http://localhost:3001/slow | The logger times a slow response (~1s) |
| http://localhost:3001/admin | 401 — the route guard blocks it |
| http://localhost:3001/admin?key=secret | The guard calls `next()` and lets you through |

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
│   ├── 03_errors_and_validation.js server validation middleware + 404 + error handler
│   ├── 03_requests.http           REST Client requests for 03
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
