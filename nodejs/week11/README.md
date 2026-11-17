# Week 11: Full-Stack MERN

| | Topic | You build |
|---|---|---|
| **Class 1** | **The API and the app, together**: the MERN stack end to end, API and APP as two projects, the API contract, then **POST**: a React form that validates, sends, and handles the reply | `AddMovieForm` in `react/mflix-react` (the API in `week11/api` is complete: GET and POST) |
| **Class 2** | **Finish the stack**: every answer the API can give (201, 400, 502, none), validating twice, `.env` across two projects, the contract between the halves. Then the **open floor**: you pick the topics | Your final project's shape: `api/` and `app/` |

Builds on [week 10](../week10/README.md): the React app in `react/mflix-react` keeps fetching `/api/movies`; this
week the server behind it is our own API, and the app learns to send data, not just read it.
Slides: `slides/nodejs_week11.pptx`.

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d
docker compose ps
```

Nothing new to install: the API uses `express`, `mongodb` and `dotenv`, which the node container already has.

## Start both halves

Two terminals, both from the repo root. Stop anything else on port 3001 first (week 9's warm-up, for example).

```bash
docker compose exec node cp week11/api/.env.example week11/api/.env   # once (optional)
docker compose exec node node week11/api/server.js                    # terminal 1: the API, port 3001
docker compose exec react npm run dev                                 # terminal 2: the app, http://localhost:5173
```

Check: http://localhost:3001/api/movies shows JSON, and http://localhost:5173 lists 20 movies.

## The API contract

| Request | Body | Answer |
|---|---|---|
| `GET /api/movies?title=star` | - | `200` `[ { _id, title, year, genres, imdb } ]` (20 at most, newest first) |
| `POST /api/movies` | `{ title, year, genres }` | `201` the new movie, with its `_id` |
| `POST /api/movies`, rules broken | `{ "title": "   ", "year": 1700 }` | `400` `{ errors: { title, year } }` |
| `POST`, body isn't JSON | `{ title: oops }` | `400` `{ error: "The body is not valid JSON." }` |
| anything else under `/api` | - | `404` `{ error: "Not found" }` |

Rules: `title` required (200 characters max); `year` a whole number from 1888 to five years from now; `genres`
optional, up to 5 short words. Send `Content-Type: application/json`, or Express won't read the body (you get the 400).
Try every row with [`api/requests.http`](api/requests.http) (VS Code REST Client).

## Files

```
nodejs/week11/
├── api/                    the API half, complete (GET and POST): class 1 reads it, then builds the React form
│   ├── package.json        what it needs on its own: express, mongodb, dotenv
│   ├── .env.example        copy to .env (git-ignored)
│   ├── requests.http       the contract, runnable
│   └── server.js
└── _solution/api/          answer key
react/_solution/week11/     the app half's answer key: week 10's app + AddMovieForm.jsx
```

Fell behind? Copy `react/_solution/week11/src` over `react/mflix-react/src`. The API needs nothing:
`week11/api/server.js` is already the finished one.

## What happens when you click Add

| What happened | `fetch()` gives | The form shows |
|---|---|---|
| Saved | status 201, the movie | a new row on top |
| Rules broken | status 400, `{ errors }` | each message under its field |
| The API isn't running | status 502 from Vite's proxy, empty body | "The server answered 502. Is the API running?" |
| No answer at all | `fetch()` throws | "Could not reach the server." |

## Clean up your test movies

Everything the API inserts is labelled `addedBy: 'week11'`:

```bash
docker compose exec mongo mongosh sample_mflix --eval "db.movies.deleteMany({ addedBy: 'week11' })"
```

## Open floor (class 2)

Vote in the Teams chat: edit and delete (PUT/DELETE), deploying both halves, logging in to a MERN app, more pages
(React Router), testing the API, or your final project. Prepared for "logging in": the CSRF demo in
`class1/01_csrf/` (victim `docker compose exec node node week11/class1/01_csrf/app.js`, attacker `.../evil.js`;
both use ports 3001/3002, so stop the API first).
