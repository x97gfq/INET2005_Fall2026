# Week 12: A Secure Login

| | Topic | You build |
|---|---|---|
| **Class 1** | **Finish the app, then: who are you?** We pick up where week 11 stopped: the Add modal (given), then test it all. Then the API half of a login: passwords stored as bcrypt hashes, what a JWT is, and `POST /api/login` | Your `react/app` with search, Delete and Add; `POST /api/login` in `week12/api` |
| **Class 2** | **The bearer token.** `requireAuth` middleware: `POST` and `DELETE` answer `401` without a good token. A login form in React, the token on every change, a `401` logs you out. Then what's still not tight | `LoginForm.jsx`, and the token sent as `Authorization: Bearer` |

Builds on [week 11](../week11/README.md). The API moves to a new folder, `nodejs/week12/api` (week 11's API with
`DELETE` done), so `git pull` never collides with what you typed in `week11/api`. The app is still **your**
`react/app`. Slides: `slides/nodejs_week12.pptx`.

## Before class

Run these from the **repo root**, where `docker-compose.yml` lives:

```bash
git pull
docker compose up -d
docker compose ps
```

Nothing new to install: the API uses `express`, `mongodb`, `dotenv`, `bcryptjs` and `jsonwebtoken`, which the node
container already has.

## Class 1: start here

Two terminals, from the repo root. Stop the week 11 API first (Ctrl+C): only one program can have port 3001.

```bash
# Terminal 1: the API, port 3001
docker compose exec node node week12/api/server.js

# Terminal 2: the app, as last week
docker compose exec -w /app/app react npm run dev    # http://localhost:5173
```

**Fell behind last class?** (no search, or no Delete button) Copy the starting point into your app:

```powershell
Copy-Item react\_solution\week12_start\index.html react\app\
Copy-Item react\_solution\week12_start\src\App.jsx, react\_solution\week12_start\src\main.jsx react\app\src\
```

No `react/app` at all? Scaffold it first (week 11's two commands), then copy the files above in:

```bash
docker compose exec -w /app react npm create vite@9 app -- --template react --no-immediate
docker compose exec -w /app/app react npm install
```

Then copy `react/_solution/week11_app/vite.config.js` into `react/app` too.

### The Add modal (given)

```powershell
Copy-Item react\_solution\week11_class2\src\AddMovieModal.jsx react\app\src\
```

Then wire it into `App.jsx` (the slides show the five bits). Answer key: `react/_solution/week11_class2`.

### Add a user, make a secret

```bash
# a user you can log in as (any email: it never leaves your laptop). Run it again to change the password.
docker compose exec node node week12/api/add-user.js student@example.com "movies-2026" "Student"

# the secret that signs login tokens: copy .env.example, then paste a new secret after JWT_SECRET=
docker compose exec node cp week12/api/.env.example week12/api/.env
docker compose exec node node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`week12/api/.env` is git-ignored: your secret stays yours. Never commit it. Used another email or password? Change
`@email` and `@password` at the top of [`api/requests.http`](api/requests.http).

## The API contract

| Request | Body / header | Answer |
|---|---|---|
| `POST /api/login` | `{ email, password }` | `200` `{ token, name }` |
| `POST /api/login`, wrong password or no such email | | `401` `{ error: "Wrong email or password." }` (the same for both) |
| `POST /api/login`, a field missing | | `400` `{ error: "Email and password are required." }` |
| `GET /api/movies?title=star` | - | `200` `[ { _id, title, year, genres, imdb } ]` (20 at most, newest first). Public |
| `POST /api/movies` | `{ title, year, genres }` + `Authorization: Bearer <token>` | `201` the new movie · `400` `{ errors }` |
| `DELETE /api/movies/:id` | `Authorization: Bearer <token>` | `204` · `400` not an ObjectId · `404` `{ error: "No movie with that id." }` |
| `POST` or `DELETE` with no token (class 2) | | `401` `{ error: "Log in first." }` |
| `POST` or `DELETE`, a token that fails (changed, expired, another secret) | | `401` `{ error: "Your login has expired or is not valid. Log in again." }` |
| anything else under `/api` | - | `404` `{ error: "Not found" }` |

In class 1, `POST` and `DELETE` still work without a token. Class 2 adds `requireAuth`, and then they don't. Try every
row with `api/requests.http` (VS Code REST Client): send request 3 (the login) first, since the others reuse its token.

## Class 2: the bearer token

Same two terminals. `--watch` restarts the API whenever you save `server.js` (not when you change `.env`):

```bash
docker compose exec node node --watch week12/api/server.js
```

1. **API**: replace the `TODO (class 2)` in `api/server.js` with `requireAuth`, and add it to `POST` and `DELETE`.
   Test with `requests.http` 7-12.
2. **App**: a new `src/LoginForm.jsx`; `user` (`{ token, name }` or `null`) in `App.jsx`; `Authorization: Bearer` on
   `DELETE` and in `AddMovieModal.jsx`; a `401` logs you out.

Answer keys: `nodejs/week12/_solution/class2/server.js`, `react/_solution/week12_class2`.

## Files

```
nodejs/week12/
├── api/                      the API: GET, POST, DELETE done; TODOs: login (class 1), requireAuth (class 2)
│   ├── package.json          express, mongodb, dotenv, bcryptjs, jsonwebtoken
│   ├── .env.example          copy to .env (git-ignored), then add JWT_SECRET
│   ├── add-user.js           given: adds a user with a bcrypt-hashed password
│   ├── requests.http         the contract, runnable
│   └── server.js
└── _solution/
    ├── class1/server.js      + POST /api/login
    └── class2/server.js      + requireAuth on POST and DELETE
react/app/                    your app (git-ignored)
react/_solution/week12_start/ where week 11 class 2 stopped: search + Delete, no modal
react/_solution/week11_class2/ end of class 1 for the app: + the Add modal
react/_solution/week12_class2/ end of class 2: + LoginForm, the token, Bearer, 401
```

Fell behind on the API? Copy `_solution/class1/server.js` (or `class2`) over `api/server.js`. It reads the same
`api/.env`, so keep yours. To run an answer key as it is: `docker compose exec node node week12/_solution/class2/server.js`.

## Clean up your test movies

Everything the week 12 API inserts is labelled `addedBy: 'week12'`:

```bash
docker compose exec mongo mongosh sample_mflix --eval "db.movies.deleteMany({ addedBy: 'week12' })"
```
