# Week 10: Assignment 4, Then React

| | Topic | You build |
|---|---|---|
| **Class 1** | **Assignment 4 work session**: what it asks for, a first Chat Completions call from the terminal, then thinking it through: one round of the game, what lives where, parsing the reply, the last 100, fair answers, the score, validation. Then work time | Your trivia game, checkpoint by checkpoint |
| **Class 2** (Friday) | **React, from the ground up**: the big picture of our API, React in its own container, JSX, a first component, props, `useState`, `useEffect` | `react/mflix-react`: hard-coded movies, a like button per row, a live search, one real request |

Builds on [week 9](../week09/README.md): its Open-Meteo route is the shape of Assignment 4's AI call, and its
class 2 warm-up (the JWT kept in the session) is the server behind React (`mflix-bff`).
Slides: `slides/nodejs_week10.pptx`.

**Assignment 4 (trivia) due Sunday, November 15, 11:59 pm.**

**Week 11:** the React app logs in through our API (register, log in, log out, the real movies), CSRF, an AI call
from React, then Socket.IO. The CSRF demo is already in [`../week11/`](../week11/).

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d
docker compose ps
```

`up -d` creates a **new container this week, `inet-react`**, for Friday's React class (port 5173). It also
creates an empty `react/mflix-react` folder: that's where we scaffold the app. `docker compose ps` should show
`inet-react` as running.

## Class 1: Assignment 4 work session

### Step 1: one call from the terminal

```bash
docker compose exec node cp week10/class1/00_trivia_start/.env.example week10/class1/00_trivia_start/.env
docker compose exec node node week10/class1/00_trivia_start/ask.js
```

Put your provider's three `AI_` values in `week10/class1/00_trivia_start/.env` first.
[`ask.js`](class1/00_trivia_start/ask.js) is week 9's Open-Meteo `fetch()` with a POST, a JSON body and the key
in a header. A working key prints a question and its answer:

```
-> POST https://.../chat/completions  (model: ...)
<- Question: ... Answer: ...
```

| You see | Check |
|---|---|
| `The provider replied 401` | `AI_API_KEY` |
| `replied 404` or `400` | `AI_BASE_URL` and `AI_MODEL` |
| `replied 429` | Rate limit: wait a minute |
| `Could not reach the provider` | The host in `AI_BASE_URL`, or your Wi-Fi |

**No key yet?** Run the fake provider in another terminal and use the fake lines in `.env.example`. It speaks the
same format and answers trivia in the assignment's `Question: ... Answer: ...` format:

```bash
docker compose exec node node week10/class1/fake-ai/fake-ai.js
```

### Step 2: think it through

One round of the game:

| | The page (browser) | Your server (Express) |
|---|---|---|
| 1 | Start Game: `GET /question` | Ask the AI, parse the reply, store `{ id, question, answer }`. Send back `{ id, question }` only |
| 2 | Show the question. Player types. Validate: not empty | Waits |
| 3 | `POST /answer { id, answer }` | Find the question by id, compare, update the score. Reply `{ correct, correctAnswer, score }` |
| 4 | Show the result and the score. Next: back to 1 | Keeps the last 100 questions; `GET /score` any time |

What lives where: the **key** in `.env`; the **correct answer**, the **last 100 questions** and the **score** in
the server's memory; the player's typed answer in the page until it's sent. Anything the browser has, the player
can read in DevTools.

The slides have small, tested snippets to start from:

- **Parsing**: `parseTrivia(text)` pulls the question and answer out of the reply, copes with `**bold**` and
  chatty extras, and returns `null` when the model ignores the format (ask again).
- **The last 100**: `push()` the new question, `shift()` the oldest when there are more than 100. Give each one an
  id (`crypto.randomUUID()`) and send the page only `{ id, question }`.
- **Repeats**: put the last ~10 questions in the prompt ("don't repeat any of these"), and/or check the array and
  ask again.
- **Fair answers**: `normalize()` both sides (lowercase, no punctuation, trimmed). Decide, and write in your
  README, whether `six` counts for `6`.
- **POST /answer**: unknown id gives 404, a second answer gives 409 (no double points), then compare, score and reply.
- **The page**: validate before `fetch()` (not empty, `required`, `maxlength`), show feedback next to the box, and
  show the score the server sends back.

### Step 3: work time, with checkpoints

Starting from scratch? [`00_trivia_start/server.js`](class1/00_trivia_start/server.js) has every endpoint
stubbed out (each answers `501 Not built yet`), with numbered TODOs, plus a page
(`views/index.ejs`) and a script (`public/game.js`) to fill in. It reads the same `.env` as `ask.js`:

```bash
docker compose exec node node week10/class1/00_trivia_start/server.js    # http://localhost:3001
```


| # | Checkpoint | Proof it works |
|---|---|---|
| 1 | `ask.js` prints a question | Your key, base URL and model are right |
| 2 | `GET /question` returns `{ id, question }` | Open it in the browser: no answer anywhere in it |
| 3 | `POST /answer`: right, wrong, unknown id, twice | REST Client or Postman: 200, 200, 404, 409 |
| 4 | `GET /score` changes after a right answer | `{ correct: 1, answered: 1 }` |
| 5 | The page: Start, question, validation, feedback, score | Submit an empty answer: a message, and no request in Network |
| 6 | Ready to hand in | README (provider + model), `.env.example`, screenshots, 3-5 slides, a ZIP without `node_modules` or `.env` |

## Class 2 (Friday): React from the terminal

Code along. The container's working folder is `react/mflix-react`, so every `npm` command runs there:

```bash
docker compose exec react npm create vite@9 . -- --template react --no-immediate
docker compose exec react npm install
```

Edit `react/mflix-react/vite.config.js` (on the slides) so it listens for Docker, notices your saves, and
passes `/api` to our server. Then:

```bash
docker compose exec react npm run dev                       # Terminal 1: React, http://localhost:5173
docker compose exec node node week10/mflix-bff/server.js    # Terminal 2 (for the last step): mflix-bff, 3001
```

In order: `Welcome` (a first component with a prop), `MovieTable` (props, a list, keys), `LikeButton`
(`useState`, one per row), a live search (`useState` again), and a `useEffect` that asks `/api/session` who we
are ("Not logged in": logging in is week 11).

- **The React app**: just save. The page updates by itself (hot reload). Ctrl+C only to stop it.
- **mflix-bff**: a Node server like the others: Ctrl+C and run again after a change.

Answer key: [`react/_solution/week10`](../../react/_solution/week10/). How to run an answer key, and fixes for
common problems, are in [`react/README.md`](../../react/README.md).

## How this connects

- **Assignment 4 is week 9's weather call, plus a key.** `fetch()` from the server, a timeout, check `res.ok`.
  The AI call adds a POST, a JSON body and `Authorization: Bearer <key>`, with the key in `.env`.
- **The server keeps the secrets and the truth**: the key, the correct answers, the score. The page shows things
  and validates input. Same rule as week 7's API and week 9's sessions.
- **React draws the page in the browser** (client-side rendering), like week 6's `fetch.html`. EJS and PHP draw it
  on the server. View Source tells you which one a page uses.
- **Components and props are EJS's partials and their data.** `<MovieTable movies={...} />` is
  `include('row', { m })` in a new form. State and effects are the React-only parts.
- **The same API as week 9's EJS pages.** React (5173) talks to mflix-bff (3001), which talks to mflix-api (3002),
  which talks to MongoDB. In week 11 React logs in through it.

## Files

```
docker-compose.yml               + the react service (inet-react, port 5173, mounts ./react)
react/
├── README.md                    the commands, running an answer key, troubleshooting
├── mflix-react/                 YOURS: created empty by Docker, scaffolded on Friday (git-ignored)
└── _solution/
    ├── week10/                  Welcome, MovieTable, LikeButton, sampleMovies, search, /api/session
    ├── week11_login/            week 11: + api.js, AuthForm, MovieList (the real movies), Log out
    └── week11_ai/               week 11: + the More like this AI button
nodejs/week10/
├── class1/
│   ├── 00_trivia_start/         ask.js + .env.example: the first AI call; server.js, views/, public/: the game, stubbed out
│   └── fake-ai/fake-ai.js       a pretend AI provider on 3003: answers trivia in the assignment's format
├── mflix-bff/                   the server behind React (port 3001)
│   ├── server.js                week 9's warm-up as JSON (React logs in through it in week 11)
│   ├── requests.http            the same conversation as the React app, from VS Code
│   └── .env.example             SESSION_SECRET (and the AI_ values, week 11)
├── _solution/mflix-bff/         server.js with the AI route written (week 11's answer key)
└── brightspace_summary.html     the week's description for Brightspace
nodejs/week11/class1/01_csrf/    the CSRF demo (week 11), with its answer key in week11/class1/_solution/
```
