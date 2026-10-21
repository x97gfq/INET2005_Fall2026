# Week 8: EJS Templates and Sessions

| | Topic | Activities |
|---|---|---|
| **Class 1** | **EJS** server-side templates (`<%= %>` / `<% %>` / partials), a page rendered from MongoDB, and **sessions** with `express-session` (the Node version of Week 2's PHP login) | Activity 8: Session Notepad |
| **Class 2** | The ChatGPT page: a form in, a rendered response out (the shape of `01_ejs_intro.js`'s form) | |

Class 1 moved here from week 7, class 2. The code moved from `week07/class2/` to `week08/class1/`.

Slides: `slides/nodejs_week8.pptx` (built by `slides/build_week8_deck.js`).

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d
```

No new packages: **ejs**, **express-session** and **bcryptjs** were added to `package.json` in
week 7. If an example reports `Cannot find module 'ejs'` (or `express-session`), run
`docker compose restart node` to re-run `npm install`.

The movies page needs MongoDB's `sample_mflix` (loaded in week 6). If you skipped it:

```bash
docker compose exec node node week06/class1/00_seed_mflix.js
```

## Cheat sheet

- **server** = keeps running. Open the URL, watch the terminal, **Ctrl+C** to stop it. One server per port.

Every example runs on **port 3001**, so run one at a time (Ctrl+C before starting the next).

### Class 1 — EJS and sessions

| What | Type | Command |
|---|---|---|
| EJS basics: partials, loop, escaped vs. unescaped, a form that renders a response | server | `docker compose exec node node week08/class1/01_ejs_intro.js` |
| Movies rendered from MongoDB (server-side rendering) | server | `docker compose exec node node week08/class1/02_movies_web.js` |
| Login with `express-session` + bcrypt | server | `docker compose exec node node week08/class1/03_sessions_login.js` |
| **Activity 8**: Session Notepad (starter with TODOs) | server | `docker compose exec node node week08/class1/activity8/notes_app.js` |

Demo logins for `03_sessions_login.js`: `alice`/`password123`, `bob`/`letmein`, `carol`/`hunter2`
(the same users as week 7's movies API). Open the dashboard in a private window to see that the
session cookie is per-browser.

### Answer keys

| For | Command |
|---|---|
| Activity 8: Session Notepad | `docker compose exec node node week08/class1/_solution/activity8_notes_app.js` |

## How this connects

- **Sessions vs. JWT**: week 7's movies API sends who-you-are in a token on every request
  (`Authorization: Bearer ...`); sessions keep it on the server and send a cookie. Both are
  checked by a guard middleware: `requireLogin` here, `requireJwt` in week 7, `requireKey` in
  week 7's `01_what_is_middleware.js`.
- **`express-session` is just more middleware**, the same `app.use(...)` as morgan and `express.json()`.
- **EJS** is the Node answer to week 2's PHP: `<?= ?>` → `<%= %>`, `<?php ?>` → `<% %>`.
- **Server-side vs. client-side rendering**: the week 6 movies API sent JSON and the browser
  built the table (`fetch`). `02_movies_web.js` renders the table on the server. Same data,
  same Mongoose model, different place.
- **Sessions**: `03_sessions_login.js` is `www/login_example4/` (PHP) rebuilt in Node:
  `session_start()` → `app.use(session(...))`, `$_SESSION` → `req.session`,
  `session_destroy()` → `req.session.destroy()`.
- The EJS "input in, response out" form in `01_ejs_intro.js` is the shape of **class 2**'s
  ChatGPT page. Only the function in the middle changes.

## Files

```
week08/
└── class1/
    ├── 01_ejs_intro.js            server  EJS tags, partials, a form
    ├── 02_movies_web.js           server  server-rendered movies over sample_mflix
    ├── 03_sessions_login.js       server  express-session + bcrypt login
    ├── views/                     shared .ejs templates + partials/
    ├── activity8/                 Activity 8 starter: notes_app.js, views/notes.ejs
    └── _solution/                 Activity 8 answer key + views/
```
