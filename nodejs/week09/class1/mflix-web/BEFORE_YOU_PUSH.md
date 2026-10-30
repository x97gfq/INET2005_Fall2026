# Before you push: loose ends

mflix-web is the week 7 movies API plus EJS pages. The API's checklist below still applies
unchanged. Adding a face to it with a cookie login brings a few new items, so those come first.

## Week 9: the pages

| ✔/☐ | What | Why it matters | Where / how |
|---|---|---|---|
| ✔ | Everything a user typed is printed with `<%= %>` (escaped) | A `<script>` in a movie title or plot is shown as text, not run (XSS) | every view; `<%- %>` only for `include` |
| ✔ | Forms are checked with the **API's own rules** | One set of rules: the pages can't accept what the API would refuse | `movieProblems()` in `middleware/validate.js` |
| ✔ | Roles are checked **in the route**, not just by hiding buttons | Anyone can POST to `/movies/:id/delete` without the button | `requirePageRole('admin')` |
| ✔ | Session cookie: `httpOnly`, `sameSite: 'lax'`, signed, 2-hour expiry, not called `connect.sid` | Script can't read it; other sites' forms don't send it; can't be forged | `session({...})` in `server.js` |
| ✔ | **CSRF token** on every POST form | The second lock on the door, after `sameSite` | `csrf` in `middleware/pages.js`, `views/partials/csrf.ejs` |
| ✔ | A **new session id at login** (`req.session.regenerate`) | A session id planted before login is worthless after (session fixation) | `POST /login` in `routes/pages.js` |
| ✔ | Logout **destroys** the session on the server | The old cookie points at nothing | `POST /logout` |
| ✔ | The login page is rate limited too, and answers with the form, not JSON | A second door needs the same lock | `pageLoginLimiter` |
| ✔ | Form bodies capped at 10 kB | Same reason as the JSON cap | `express.urlencoded({ limit })` |
| ✔ | The API never gets a session or cookie; the pages ignore bearer tokens | Each half has one way in, and CSRF can't reach the API | session middleware mounted after `/api` |
| ✔ | The one script (`confirm.js`) is a file, so the CSP still blocks inline JS | `onsubmit="..."` would be blocked, and should be | `public/confirm.js` |
| ☐ | **A real session store** | The default MemoryStore forgets everyone on restart and leaks memory over time - express-session says not to use it in production | `connect-mongo` (sessions in MongoDB) or Redis |
| ☐ | **`cookie.secure: true`** | Without it the session cookie travels over plain `http`, readable on shared Wi-Fi | Turn on with HTTPS (and `app.set('trust proxy', 1)` behind a proxy) |
| ☐ | **Sessions for anonymous visitors** | The CSRF token creates a session for everyone who loads a page; fine in class, wasteful at scale | Create the token only on pages with forms, or use a signed double-submit cookie |
| ☐ | **Accessible forms** | Error messages should be announced to screen readers | `aria-describedby` linking each input to its message |
| ☐ | **Page tests** | Postman tests the API; nothing tests the pages | Supertest: log in with an agent, POST a form, follow the redirect |

---

# The API (from week 7)

## Already tied up in this version

| ✔ | What | Where |
|---|---|---|
| ✔ | Bad input is refused with `400` + every problem listed, before the route runs | `middleware/validate.js` |
| ✔ | Unknown body fields (`isAdmin`, `$where`, `$set`) are refused, not quietly saved (mass assignment) | `validateMovie`, plus `pickFields` as a second lock |
| ✔ | Query values must be single strings (no `?title[$ne]=` or repeated keys); search text is regex-escaped and length-capped | `validateMovieQuery`, `escapeRegex` |
| ✔ | Writes need a token (`401`); deletes need the admin role (`403`) | `middleware/auth.js`, `routes/movies.js` |
| ✔ | `jwt.verify` only accepts `HS256`, so `alg: none` and algorithm-swap tokens fail | `requireJwt` |
| ✔ | Tokens expire (`JWT_EXPIRES_IN`, default 1 hour) | `routes/auth.js` |
| ✔ | Login gives one vague message and takes the same time for a wrong user or a wrong password | `routes/auth.js` (`DUMMY_HASH`) |
| ✔ | Passwords stored only as bcrypt hashes; the JWT payload holds no secrets | `routes/auth.js` |
| ✔ | The secret comes from `.env`; production refuses to start without one | `config.js`, `.env.example` |
| ✔ | Stack traces go to the log, never to the client | error handler in `server.js` |
| ✔ | Tokens and passwords are never logged; failed logins and rejected tokens are (`warn`) | `auth.js`, `routes/auth.js` |
| ✔ | An audit trail: who created, changed or deleted what | `logger.info(... by: req.user.sub)` |
| ✔ | Bodies capped at 10 kB (`413`), page size capped at 100 | `express.json({ limit })`, `validateMovieQuery` |
| ✔ | **Security headers** (Content-Security-Policy, `nosniff`, no framing, HSTS...), and `X-Powered-By` removed | `helmet()` in `server.js`; the front end's script moved to `public/app.js` so the CSP can block inline scripts |
| ✔ | **Login rate limit**: 5 failed tries per username + IP per 15 minutes, then `429` with `Retry-After` | `middleware/rateLimit.js` (express-rate-limit) |
| ✔ | **Logout that really logs out**: the token's id (`jti`) is revoked; a MongoDB TTL index cleans up when it would have expired | `POST /api/auth/logout`, `models/RevokedToken.js`, `requireJwt` |
| ✔ | `.env` and `logs/` are git-ignored; `.env.example` is committed | repo `.gitignore` |

## Still loose: security

| ☐ | What | Why it matters | How |
|---|---|---|---|
| ☐ | **Rate limits that survive a restart** | The limiter counts in memory: restart the server (or run two copies behind a load balancer) and the counts are gone or split | A shared store, e.g. `rate-limit-redis` or `rate-limit-mongo` |
| ☐ | **A per-IP limit as well** | Our limit is per username + IP, so one IP can still try 5 passwords against *each* of 10,000 usernames (credential stuffing) | A second, looser limiter keyed on IP alone (e.g. 50 failures / hour) |
| ☐ | **Re-enable `upgrade-insecure-requests`** | We turned it off because class runs on `http://localhost` | Delete that line from the helmet config once the site is on HTTPS |
| ☐ | **HTTPS** | Over plain `http` the token travels in the clear, so anyone on the café Wi-Fi can copy it | A reverse proxy (nginx, Caddy) or the host's TLS. Then `app.set('trust proxy', 1)` so `req.ip` in the logs is the real client |
| ☐ | **Real users** | Three users hard-coded in `routes/auth.js` can't sign up, change a password or be removed | A `users` collection (`sample_mflix` has one) with a bcrypt hash per document, plus a register route with password rules |
| ☐ | **Refresh tokens** | Logout works now, but every request with a token costs one database lookup, and a stolen token still works until someone logs it out | Short-lived access tokens (5-15 min) + a refresh token, so a stolen one dies fast. Changing `JWT_SECRET` logs *everyone* out (the emergency button) |
| ☐ | **CORS** | The front end is served by the same server, so no CORS is needed now. If another site needs the API, allow *that* origin, not `*` | `cors({ origin: ['https://my-front-end.example'] })` |
| ☐ | **MongoDB has no password** | The Docker `mongo` container accepts anyone (fine on your laptop, never on a server) | A database user with `readWrite` on `sample_mflix` only, credentials in `MONGO_URL` in `.env` |
| ☐ | **Dependencies** | A known hole in any package is a hole in your app | `npm audit`, keep `package-lock.json` committed, update regularly |
| ☐ | **Swagger in production** | `/api-docs` is a map of your API for anyone | Turn it off when `NODE_ENV=production`, or put it behind `requireJwt` |
| ☐ | **Remove the demo shortcuts** | The dev secret fallback and demo passwords are in the code (and in Git history) | Delete them before a real deployment; rotate anything that was ever committed |

## Still loose: running it for real

| ☐ | What | Why it matters | How |
|---|---|---|---|
| ☐ | **Log rotation** | `combined.log` grows forever until the disk is full | `winston-daily-rotate-file` (keep 14 days), or log to the console and let Docker / the host collect it |
| ☐ | **A request id on every log line** | When 50 requests a second are logged, you need to know which lines belong together | The `req.requestId` + morgan token from `week07/class1/04_logging_morgan.js`, passed into winston too |
| ☐ | **Health check** | Docker / a load balancer needs to ask "are you OK?" | `GET /health` → `200 { db: 'up' }` (check `mongoose.connection.readyState`) |
| ☐ | **Graceful shutdown** | `docker stop` sends `SIGTERM`; in-flight requests are cut off | `process.on('SIGTERM', ...)`: stop accepting, finish requests, `mongoose.disconnect()` |
| ☐ | **Crash logging** | An error outside a route (a rejected promise) kills the process without a log line | `process.on('unhandledRejection', ...)` → `logger.error`, then exit and let Docker restart it |
| ☐ | **Indexes** | `?title=` is a regex over 23,000 documents: a full scan every time | A text index, or an index on `genres` / `year` for the filters people use |

## Still loose: the code itself

| ☐ | What | How |
|---|---|---|
| ☐ | **Automated tests**: today "tested" means you clicked Send Request | Run the Postman collection with `npx newman run mflix-api.postman_collection.json`, or write Jest + Supertest tests. Run them before every push |
| ☐ | **Lint and format** | ESLint + Prettier, so the whole team's code looks the same and obvious bugs are flagged |
| ☐ | **Docs match the code** | Changed a route? Update `openapi.yaml`, `requests.http`, the Postman collection and the README in the **same** commit |
| ☐ | **`package.json` scripts** | `"start"`, `"test"`, `"lint"`, so nobody has to remember the commands |
| ☐ | **No leftovers** | No `console.log` debugging, commented-out code or `TODO`s you meant to finish |

## The 60-second check before every push

```bash
git status                  # anything here you didn't mean to change? .env? logs/?
git diff --staged           # read every line you're about to commit
git log -p -3 | grep -iE "secret|password|token"   # did a secret sneak into a recent commit?
docker compose exec node npm audit                   # known vulnerabilities in your packages
# with the API running in another terminal:
docker compose exec node npx -y newman run week09/class1/mflix-web/mflix-api.postman_collection.json   # all green?
```

If a secret ever reaches GitHub, deleting the file isn't enough because it stays in the
history. **Change the secret** (new `JWT_SECRET`, new database password), *then* clean up.
