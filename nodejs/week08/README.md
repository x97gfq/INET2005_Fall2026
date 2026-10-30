# Week 8: Put a Face on the API (EJS)

| | Topic | Activities |
|---|---|---|
| **Class 1** | **EJS from zero**, in five small steps we write together: hello world, data + escaping, loops, partials, forms. Where EJS sits in the stack (still server-side!) and where React fits | Try It exercises · Activity 8: Movie Night |

Slides: `slides/nodejs_week8.pptx` (built by `slides/build_week8_deck.js`), the class 1 section.
The deck's mflix-web and wrap-up sections now belong to [week 9](../week09/README.md). The pop quiz and
trivia questions are in the deck: a question slide, then the answer on the next click.

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d
```

No new packages: **ejs** came in with week 7. If an example reports
`Cannot find module 'ejs'`, run
`docker compose restart node` to re-run `npm install`.

Class 1 doesn't touch the database: every example keeps its data in memory.

## Cheat sheet

- **server** = keeps running. Open the URL, watch the terminal, **Ctrl+C** to stop it. One server per port.
- Changed an **`.ejs`** file? Just refresh the browser. Changed a **`.js`** file? Ctrl+C and run it again.

Every example runs on **port 3001**, so run one at a time (Ctrl+C before starting the next).

### Class 1: EJS from zero (follow along)

Each step is its own folder: an `app.js` and a `views/` folder. We type them together. If
you fall behind, the finished version is right there to run. The quick exercises after each
step are in [`class1/TRY_IT.md`](class1/TRY_IT.md).

| Step | What | Command | Open |
|---|---|---|---|
| 01 | **Hello, EJS**: `view engine`, `res.render`, `<%= %>` (< 10 min) | `docker compose exec node node week08/class1/01_hello/app.js` | http://localhost:3001 · `/hello/Sam` |
| 02 | One movie object: fields, `if`/`else`, **escaped vs raw** | `docker compose exec node node week08/class1/02_data/app.js` | http://localhost:3001 |
| 03 | A list: `forEach` over an array, the empty state | `docker compose exec node node week08/class1/03_loops/app.js` | `/` · `/empty` |
| 04 | **Partials**: one header and footer for every page, plus a static CSS file | `docker compose exec node node week08/class1/04_partials/app.js` | `/` · `/about` |
| 05 | **Forms**: a GET search, and a POST that adds a movie (validation, Post/Redirect/Get) | `docker compose exec node node week08/class1/05_forms/app.js` | http://localhost:3001 |
| A8 | **Activity 8: Movie Night** (starter with TODOs) | `docker compose exec node node week08/class1/activity8/app.js` | http://localhost:3001 |

Starting from an empty folder yourself? This is all of step 01:

```
my-first-ejs/
├── app.js            const app = express(); app.set('view engine', 'ejs'); ... res.render('hello', { name })
└── views/
    └── hello.ejs     <h1>Hello, <%= name %>!</h1>
```

### Answer keys

| For | Command |
|---|---|
| Try It (class 1) | the `<details>` under each exercise in `class1/TRY_IT.md` |
| Activity 8: Movie Night | `docker compose exec node node week08/class1/_solution/activity8/app.js` |

## How this connects

- **Last week we built the API; this week we learn how to give it a face.** Class 1 practises
  EJS on small in-memory examples, so nothing new gets in the way of the templates themselves.
- **`res.json()` → `res.render()`.** The route is the same Express route as weeks 6 and 7; only
  the last line changes. Every key in the object you pass becomes a variable in the template.
- **EJS is server-side**, like week 2's PHP: `<?= ?>` → `<%= %>`, `<?php ?>` → `<% %>`,
  `include 'header.php'` → `<%- include('partials/header') %>`. Week 6's `fetch()` page and a
  React app are **client-side**: they get JSON and build the page in the browser.
- **Week 7's habits carry over**: escape output (`<%= %>`) so a `<script>` someone typed shows
  as text, and validate at the door (step 05 checks the form the same way `validateMovie` checked JSON).
- **Next week: a face on mflix.** The same templates, rendered from MongoDB on top of the week 7
  movies API, with a session login and add/edit/delete forms. See [week 9](../week09/README.md).
- **Later in the term: React.** It would call `/api/movies` with `fetch()` and a JWT, and the API
  wouldn't change.

## Files

```
week08/
├── class1/                          EJS from zero
│   ├── 01_hello/                    app.js + views/hello.ejs           the hello world
│   ├── 02_data/                     app.js + views/movie.ejs           one object, if/else, escaping
│   ├── 03_loops/                    app.js + views/movies.ejs          forEach + empty state
│   ├── 04_partials/                 app.js + views/ (+ partials/) + public/style.css
│   ├── 05_forms/                    app.js + views/movies.ejs          GET search, POST add
│   ├── TRY_IT.md                    a short exercise after each step, with answers
│   ├── activity8/                   Activity 8 starter: Movie Night
│   └── _solution/activity8/         Activity 8 answer key
├── brightspace_summary.md           the week's description for Brightspace
└── wk08-quiz-ejs-front-end.csv      10-question quiz, Brightspace import format
```
