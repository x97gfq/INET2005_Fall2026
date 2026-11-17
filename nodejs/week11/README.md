# Week 11: Full-Stack MERN

| | Topic | You build |
|---|---|---|
| **Class 1** | **The API and the app**: the pattern you know (fetch, then show), the MERN stack, API and APP as two projects. The API in `week11/api` is done; you scaffold a new React app and show its movies | A new React app in `react/app` that fetches `GET /api/movies` and lists the movies |
| **Class 2** | **Search, delete, add**: UML diagrams of where we start and what we add, a search form (`GET ?title=`), a `DELETE` route in the API and a Delete button in the app, and an Add modal (Bootstrap, the code is given). Then what's still missing: a login and a bearer token, next class | The same `react/app`, now with search, delete and add |

Builds on [week 10](../week10/README.md). The same pattern as `fetch()` last year and PHP / EJS this year: ask for
data, then build the page from it. Now the two halves are two projects: the API in `nodejs/week11/api`, the app in `react/app`.
Slides: `slides/nodejs_week11.pptx`.

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d
docker compose ps
```

Nothing new to install: the API uses `express`, `mongodb` and `dotenv`, which the node container already has.

## Class 1: the API, then a new app

Two terminals, both from the repo root. Stop anything else on port 3001 first (week 9's warm-up, for example),
and any other Vite server on 5173 (week 10's `mflix-react`).

```bash
# Terminal 1: the API, port 3001. Check http://localhost:3001/api/movies shows JSON
docker compose exec node node week11/api/server.js

# Terminal 2: scaffold the app (once). react/ on Windows is /app in the react container
docker compose exec -w /app react npm create vite@9 app -- --template react --no-immediate
docker compose exec -w /app/app react npm install
```

Then edit two files (copy them from the answer key, [`react/_solution/week11_app`](../../react/_solution/week11_app), if you're stuck):

- `react/app/vite.config.js`: add the `server` block (`host: true`, `watch: { usePolling: true }`, and the `/api` proxy)
- `react/app/src/App.jsx`: `useEffect` + `fetch('/api/movies')`, then `movies.map(...)` into a list

```bash
docker compose exec -w /app/app react npm run dev    # terminal 2: the app, http://localhost:5173
```

Check: http://localhost:5173 lists 20 movies. Stop the API and reload: "The API answered 502".
`react/app` is git-ignored: it's yours.

## The API contract

| Request | Body | Answer |
|---|---|---|
| `GET /api/movies?title=star` | - | `200` `[ { _id, title, year, genres, imdb } ]` (20 at most, newest first) |
| `POST /api/movies` | `{ title, year, genres }` | `201` the new movie, with its `_id` |
| `POST /api/movies`, rules broken | `{ "title": "   ", "year": 1700 }` | `400` `{ errors: { title, year } }` |
| `POST`, body isn't JSON | `{ title: oops }` | `400` `{ error: "The body is not valid JSON." }` |
| `DELETE /api/movies/:id` (class 2) | - | `204`, no body |
| `DELETE /api/movies/banana` | - | `400` `{ error: "That is not a valid movie id." }` |
| `DELETE`, valid id but no such movie | - | `404` `{ error: "No movie with that id." }` |
| anything else under `/api` | - | `404` `{ error: "Not found" }` |

Rules: `title` required (200 characters max); `year` a whole number from 1888 to five years from now; `genres`
optional, up to 5 short words. Send `Content-Type: application/json`, or Express won't read the body (you get the 400).
Try every row with [`api/requests.http`](api/requests.http) (VS Code REST Client).

## Class 2: search, delete, add

Same two terminals as class 1. Work in **your** `react/app`; the answer key is
[`react/_solution/week11_class2`](../../react/_solution/week11_class2).

1. **Bootstrap**: add Bootstrap's CSS `<link>` to `react/app/index.html`, delete `import './index.css'` from `src/main.jsx`.
2. **Search**: `query` (the box) and `search` (the request) in state, `fetch('/api/movies?title=' + encodeURIComponent(search))`,
   `useEffect(..., [search])`, and a `<form onSubmit>`. No API change.
3. **DELETE route**: replace the TODO in `api/server.js` (`ObjectId.isValid`, `deleteOne`, 204/400/404), then
   **restart the API** (Ctrl+C, run it again). Test with `requests.http` requests 7-9.
4. **Delete button**: `handleDelete(movie)` with `fetch(..., { method: 'DELETE' })`, then `movies.filter(...)`.
5. **Add modal (given)**: copy `AddMovieModal.jsx` into `react/app/src`, then wire it into `App.jsx`:

```powershell
Copy-Item react\_solution\week11_class2\src\AddMovieModal.jsx react\app\src\
```

Delete really removes the movie from your `sample_mflix`. Practise on movies you added (they're on top).

## Files

```
nodejs/week11/
├── api/                    the API half: GET and POST complete, DELETE is class 2's TODO
│   ├── package.json        what it needs on its own: express, mongodb, dotenv
│   ├── .env.example        copy to .env (git-ignored)
│   ├── requests.http       the contract, runnable
│   └── server.js
└── _solution/api/          answer key (with DELETE)
react/app/                  class 1: the app you scaffold (git-ignored)
react/_solution/week11_app/ class 1's answer key: vite.config.js + src/App.jsx
react/_solution/week11_class2/ class 2's answer key: search, Delete, AddMovieModal.jsx (given)
```

Fell behind? Copy `react/_solution/week11_app/vite.config.js` and `src/App.jsx` into `react/app` (class 1), or
`index.html` and `src/` from `react/_solution/week11_class2` (class 2). For the API, copy `_solution/api/server.js`
over `api/server.js`.

## What happens when you click Save (the Add modal)

| What happened | `fetch()` gives | The form shows |
|---|---|---|
| Saved | status 201, the movie | the modal closes, a new row on top |
| Rules broken | status 400, `{ errors }` | each message under its field |
| The API isn't running | status 502 from Vite's proxy, empty body | "The server answered 502. Is the API running?" |
| No answer at all | `fetch()` throws | "Could not reach the server." |

## Clean up your test movies

Everything the API inserts is labelled `addedBy: 'week11'`:

```bash
docker compose exec mongo mongosh sample_mflix --eval "db.movies.deleteMany({ addedBy: 'week11' })"
```

## Next class: log in, then a bearer token

Right now anyone who can reach the API can add or delete any movie (`requests.http` does it with no app at all).
Next class: a `users` collection with hashed passwords, `POST /api/login` that answers with a signed token, and
`requireAuth` middleware that checks `Authorization: Bearer <token>` before `POST` and `DELETE` and answers `401`
without one. `GET` stays public. The CSRF demo in `class1/01_csrf/` is still there if we compare tokens with cookies.
