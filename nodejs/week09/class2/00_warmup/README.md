# Warm-up 00: log in through the API

We start from last class's warm-up and add register, log in and log out. The movies stop coming
from MongoDB: the page `fetch()`es them from the API, using the JWT we keep in the session.

## Run it

You need two terminals, so start the API first. Run these from the repo root:

```bash
docker compose exec node node week09/class2/mflix-api/server.js   # Terminal 1: the API, port 3002
docker compose exec node node week09/class2/00_warmup/app.js      # Terminal 2: this app, port 3001
```

Open http://localhost:3001. Changed `app.js`? Ctrl+C terminal 2 and run it again. Changed an `.ejs`
file? Just refresh.

## The TODOs

| Part | File | What to do |
|---|---|---|
| 1 | `app.js` | Replace the `MongoClient` require with `express-session`, and add the `API` constant |
| 1 | `app.js` | Add `express.urlencoded()` and the session middleware |
| 1 | `app.js` | Delete the client, the `movies` collection and the `/api/movies` route |
| 2 | `views/register.ejs` | Write the register form |
| 2 | `views/login.ejs` | Copy `register.ejs`, point it at `/login`, and add the green `notice` message |
| 3 | `app.js` | Add `GET /register`, `POST /register` and `GET /login` |
| 4 | `app.js` | Add `POST /login`, and keep the JWT in `req.session.token` |
| 5 | `app.js` | In `/`, send a visitor with no token to `/login`, then `fetch()` the movies with the token |
| 6 | `app.js` | Add `POST /logout`: revoke the token at the API, then destroy the session |
| 6 | `app.js` | Add the error middleware for when the API isn't running |
| 7 | `app.js` | Add middleware that copies `req.session.username` into `res.locals` |
| 7 | `views/partials/header.ejs` | Replace the JSON link: username + Log out when logged in, otherwise Log in + Register |

## Check your progress

- **After part 1:** `/` shows an error because `movies` no longer exists. That's expected until part 5.
- **After part 3:** at http://localhost:3001/register, try a short password, then `alice`, then your own name. The first two show an error, and the last one takes you to the login page.
- **After part 4:** a correct login sends you to `/`, which still shows that error. A wrong password shows a message on the form.
- **After part 5:** log in and the movie table is back.
- **After part 7:** register, log in, see the movies and log out, all from the nav bar.

## Fell behind?

The finished version is in [`../_solution/00_warmup/`](../_solution/00_warmup/), and every TODO is
marked there too. Open the same file, search for `TODO Part 4` (or whichever part you're on), and
copy the code under it. If you're lost, you can run the finished version in terminal 2:

```bash
docker compose exec node node week09/class2/_solution/00_warmup/app.js
```
