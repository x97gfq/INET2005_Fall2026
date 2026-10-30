# Week 9: A Face on mflix (EJS + sessions)

| | Topic | Activities |
|---|---|---|
| **Class 1** | **mflix-web**: the week 7 movies API with a face. A server-rendered movie list, then sessions, then the full app: search, paging, detail, add/edit/delete forms using the API's own validation, a session login with roles, CSRF tokens | Activity 9: Session Notepad |
| **Class 2** | **Wrap-up, review and lab**: a review game, the stack debate (EJS vs React vs PHP), the weekly quiz, and a levelled lab | Activity 10: mflix-lite (lab) |

Builds on [week 8](../week08/README.md) (EJS from zero). The slides for these two classes are
still in `slides/nodejs_week8.pptx`.

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d
```

No new packages: **ejs**, **express-session** and **bcryptjs** came in with week 7. If an
example reports `Cannot find module 'ejs'` (or `express-session`), run
`docker compose restart node` to re-run `npm install`.

Both classes need MongoDB's `sample_mflix` (loaded in week 6). If you skipped it:

```bash
docker compose exec node node week06/class1/00_seed_mflix.js
```

## Cheat sheet

- **server** = keeps running. Open the URL, watch the terminal, **Ctrl+C** to stop it. One server per port.
- Changed an **`.ejs`** file? Just refresh the browser. Changed a **`.js`** file? Ctrl+C and run it again.

Every example runs on **port 3001**, so run one at a time (Ctrl+C before starting the next).

### Class 1: A face on mflix

Start small, then the whole thing:

| What | Type | Command |
|---|---|---|
| **Step 1**: the movie list as a server-rendered page (`res.render` instead of `res.json`) | server | `docker compose exec node node week09/class1/01_movies_page.js` → http://localhost:3001/movies |
| **Step 2**: sessions with `express-session` + bcrypt (week 2's PHP login, in Node) | server | `docker compose exec node node week09/class1/02_sessions_login.js` |
| **Activity 9**: Session Notepad (starter with TODOs) | server | `docker compose exec node node week09/class1/activity9/notes_app.js` |
| **mflix-web**: the week 7 API + EJS pages, login, forms | server | `docker compose exec node node week09/class1/mflix-web/server.js` |
| Same, with debug logging | server | `docker compose exec -e LOG_LEVEL=debug node node week09/class1/mflix-web/server.js` |
| The API is unchanged: all 59 week 7 Postman tests, from the terminal | 2nd terminal | `docker compose exec node npx -y newman run week09/class1/mflix-web/mflix-api.postman_collection.json` |
| The new loose ends (sessions, cookies, CSRF) | read | [`mflix-web/BEFORE_YOU_PUSH.md`](class1/mflix-web/BEFORE_YOU_PUSH.md) |

Demo logins for `02_sessions_login.js` and mflix-web (the same users as week 7's API):

| User | Password | Role | On the mflix-web pages |
|---|---|---|---|
| alice | password123 | admin | add, edit, **delete** |
| bob | letmein | editor | add, edit |
| carol | hunter2 | viewer | read only (Add/Edit give a 403 page) |

While mflix-web runs:

| URL | What |
|---|---|
| http://localhost:3001/movies | The EJS list: search, genre, paging. **View Page Source**: the rows are in the HTML |
| http://localhost:3001/fetch.html | Week 6's page, same server: the rows are built in the browser. View Source: no rows |
| http://localhost:3001/api/movies | The same data as JSON |
| http://localhost:3001/login | Log in as bob, add a movie, edit it; log in as alice and delete it |
| http://localhost:3001/api-docs | Swagger: the JSON API, still JWT-only |

Try these on purpose:

- Add a movie with year `abc` and rating `12`: the form comes back with the **API's** error messages.
- Log in as carol and open http://localhost:3001/movies/new: a 403 page. Hiding the button wasn't the security, the route check was.
- Open a private window: you're logged out there. The session cookie belongs to one browser.

### Class 2: Wrap-up, review and lab

| What | Type | Command / file |
|---|---|---|
| Review sheet: the whole stack, EJS vs React, ten things to explain | read | [`class2/REVIEW.md`](class2/REVIEW.md) |
| **Activity 10: mflix-lite** (the lab, in four levels) | read | [`class2/LAB.md`](class2/LAB.md) |
| Activity 10 starter | server | `docker compose exec node node week09/class2/activity10/app.js` |

### Answer keys

| For | Command |
|---|---|
| Activity 9: Session Notepad | `docker compose exec node node week09/class1/_solution/activity9_notes_app.js` |
| Activity 10: mflix-lite (all four levels) | `docker compose exec node node week09/class2/_solution/activity10/app.js` |

## How this connects

- **Week 7 built the API, week 8 taught EJS; now the API gets a face.** `mflix-web` is a copy of
  `week07/class2/mflix-api`: the API routes, middleware, logging and Postman tests are the same.
  What's new sits beside them: `routes/pages.js` + `views/`.
- **`res.json()` → `res.render()`.** Compare `routes/movies.js` with `routes/pages.js`: the same
  `listMovies()` query (now in `services/movies.js`) and the same validation rules (`movieProblems()`),
  with a different last line.
- **EJS is server-side**, like week 2's PHP: `<?= ?>` → `<%= %>`, `<?php ?>` → `<% %>`,
  `include 'header.php'` → `<%- include('partials/header') %>`. Week 6's `fetch()` page and a
  React app are **client-side**: they get JSON and build the page in the browser. All three can
  sit on the same API, and `mflix-web` serves two of them at once (`/movies` and `/fetch.html`).
- **Sessions vs. JWT**: the API keeps its bearer tokens (week 7); the pages use a session
  cookie, because browsers send cookies by themselves. `requireLogin` / `requirePageRole` have the
  same shape as `requireJwt` / `requireRole`.
- **Forms only speak GET and POST**, so the pages use `POST /movies/:id/edit` and
  `POST /movies/:id/delete` where the API uses PUT/PATCH and DELETE.
- **Week 7's security habits carry over**: escape output (`<%= %>`) like helmet's CSP blocks
  scripts, validate at the door, check roles in the route. Cookies bring one new risk, **CSRF**,
  so the pages add `sameSite` cookies and a form token.
- **Later in the term: React.** It would call `/api/movies` with `fetch()` and a JWT, the same as
  `fetch.html`, and the API wouldn't change.

## Files

```
week09/
├── class1/                          a face on mflix
│   ├── 01_movies_page.js            step 1: list + detail, rendered from MongoDB
│   ├── 02_sessions_login.js         step 2: express-session + bcrypt login
│   ├── views/                       the .ejs files for steps 1-2 (+ partials/)
│   ├── activity9/                   Activity 9 starter: Session Notepad
│   ├── _solution/                   Activity 9 answer key
│   └── mflix-web/                   week07/class2/mflix-api + pages
│       ├── server.js                + view engine, urlencoded, express-session, 404 + error pages
│       ├── routes/pages.js          NEW  list, detail, add/edit/delete, login, logout
│       ├── views/                   NEW  movies, movie, movie-form, login, error + partials/ (header, footer, csrf)
│       ├── middleware/pages.js      NEW  res.locals (user, flash), CSRF, requireLogin, requirePageRole
│       ├── services/movies.js       NEW  listMovies(), listGenres(): shared by the API and the pages
│       ├── users.js                 NEW  demo users + checkPassword(): shared by both logins
│       ├── middleware/validate.js   + movieProblems(): the API's rules, reusable by forms
│       ├── middleware/rateLimit.js  + pageLoginLimiter
│       ├── config.js                + SESSION_SECRET
│       ├── public/fetch.html        week 6's client-side page (was index.html)
│       ├── public/confirm.js        NEW  "Delete this movie?" (the CSP blocks inline JS)
│       └── ...                      routes/auth.js, routes/movies.js, models/, openapi.yaml, requests.http,
│                                    Postman collection, BEFORE_YOU_PUSH.md - as in week 7
├── class2/                          wrap-up, review, lab
│   ├── REVIEW.md                    the stack top to bottom, EJS vs React, ten things to explain
│   ├── LAB.md                       Activity 10 instructions (four levels)
│   ├── activity10/                  Activity 10 starter: mflix-lite (+ models/Comment.js)
│   └── _solution/activity10/        Activity 10 answer key
└── brightspace_summary.html         the week's description for Brightspace
```
