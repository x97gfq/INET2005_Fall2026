# Activity 7: The Token Lifecycle

Follow one JWT from birth to death: **log in, get a token, use it, get refused, log out,
and watch the same token stop working**. You'll build the requests yourself in **Bruno**,
an open-source API client like Postman that saves every request as a plain-text file you
can commit to Git.

**Time:** about 40 minutes · **Hand in:** your collection folder (zipped) + the answers in Part C

## Before you start

1. Start the API (and leave that terminal open; the log lines are part of the activity):
   ```bash
   docker compose exec node node week07/class2/mflix-api/server.js
   ```
2. Install Bruno from **https://www.usebruno.com/downloads** (free, no account needed).
3. In Bruno: **Open Collection** and pick `week07/class2/activity7/mflix-bruno/`.
4. Top right, choose the environment **local**. It sets `{{baseUrl}}` to
   `http://localhost:3001/api`.
5. Send the one request that's already there, **01 Login as bob**. Then look at its tabs:
   - **Body**: the JSON sent to the server
   - **Script > Post Response**: `bru.setVar("token_bob", res.getBody().token);` saves the
     token in a variable called `token_bob`
   - **Tests**: checks the status is 200
   - **Docs**: notes for whoever reads the collection next

Every request you add follows the same pattern. For a request that needs a token, open its
**Auth** tab, choose **Bearer Token**, and type `{{token_bob}}` (or whichever user's token).
Bruno then sends `Authorization: Bearer <token>` for you.

Users: `alice` / `password123` (admin) · `bob` / `letmein` (editor) · `carol` / `hunter2` (viewer)

## Part A: one token's life (build these in order)

Add each request with **New Request** (right-click the collection). Give each one a **test**
for the status code you expect, like the example's.

| # | Request | Auth | Expect | Also |
|---|---|---|---|---|
| 1 | `POST /auth/login` as bob | none | 200 | ✅ already done |
| 2 | `GET /auth/me` | `{{token_bob}}` | 200 | test that `role` is `editor` |
| 3 | `POST /movies` with a title, year, runtime | `{{token_bob}}` | 201 | save the new `_id` with `bru.setVar("movieId", ...)` |
| 4 | `PATCH /movies/{{movieId}}` with `{ "runtime": 95 }` | `{{token_bob}}` | 200 | test the runtime changed |
| 5 | `DELETE /movies/{{movieId}}` | `{{token_bob}}` | **?** | why that code and not 401? |
| 6 | `POST /auth/login` as alice | none | 200 | save `token_alice` |
| 7 | `DELETE /movies/{{movieId}}` | `{{token_alice}}` | 204 | |
| 8 | `GET /movies/{{movieId}}` | none | 404 | |
| 9 | `POST /auth/logout` | `{{token_bob}}` | 204 | |
| 10 | `GET /auth/me`, exactly like request 2 | `{{token_bob}}` | **?** | same token as request 2 - what changed? |

When all ten are built, run the whole collection: right-click the collection > **Run**.
Every test should be green. Run it a second time: does it still pass? (It should: request
1 gets bob a fresh token.)

## Part B: predict, then send

For each one, **write your prediction first** (status code and the `error` message), then
add the request and send it. Watch the API's terminal each time.

| # | Request | Your prediction | What you got |
|---|---|---|---|
| B1 | Log in as carol and save `token_carol` | | |
| B2 | `POST /movies` with `{{token_carol}}` | | |
| B3 | `POST /movies` with **no** auth | | |
| B4 | `GET /auth/me` with the expired token from `mflix-api/requests.http` section 6 | | |
| B5 | `GET /auth/me` with `{{token_carol}}x` (one extra character on the end) | | |
| B6 | `POST /auth/login` as `eve` / `guess`. Send it **six times** in a row | | |

For B6, open the response **Headers** after each send and watch `RateLimit` count down.
(It's per username, so it won't lock out bob. Restarting the API resets it.)

## Part C: explain it (hand in)

1. Paste bob's token from request 1 into **https://jwt.io**. Write down `sub`, `role`, `iat`,
   `exp` and `jti`. How long is the token valid for? Is anything in there secret?
2. Request 5 got 403 but request 10 got 401. In one sentence each, why?
3. After request 9, `jwt.verify()` would *still* say bob's token is valid. So how did the
   server know to refuse it in request 10? Name the file and the collection involved.
4. Using the festival-wristband analogy from the slides: what is the box office, what is the
   hologram, and what is the guards' banned list?
5. Open `mflix-api/logs/combined.log`. Find the lines for your login, your movie being
   created and deleted, and your logout. Does your token or password appear anywhere?

## Stretch

- Move the `Authorization` setup to the **collection** level (collection settings > Auth >
  Bearer `{{token_bob}}`) and set the requests that use bob's token to **inherit**. Which
  requests must keep their own auth setting (or none), and why?
- Run your collection from the terminal with the Bruno CLI:
  ```bash
  docker compose exec node sh -c "cd week07/class2/activity7/mflix-bruno && npx -y @usebruno/cli run --env local"
  ```
- Prefer Postman? Build the same ten requests there. Use `pm.collectionVariables.set(...)`
  instead of `bru.setVar(...)`.

The answer key is in `week07/class2/_solution/activity7-bruno/`. Open it in Bruno and compare
it with yours **after** you've tried.
