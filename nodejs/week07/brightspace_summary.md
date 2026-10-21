# Week 7: Middleware, Logging and JWT

This week we slow down on the Express backend. We started with servers, MongoDB, MySQL
and a CRUD API fast; now we name the pieces that have been quietly doing the work.
**Middleware** is any function that runs on a request on its way to your route; you've
already used `express.json()` and `express.static`. We'll write our own (a request logger,
a route guard), organize routes with `express.Router`, add one central **error handler**,
and **validate input** so bad data is turned away with a clear `400` instead of crashing
the server. Then we add **logging** with morgan (every request) and winston (levels, log
files, structured data), and read a **JWT** bearer token: what's inside it, and why only
the signature makes it trustworthy. We'll also review **Assignment 3**: what the MongoDB
queries were meant to do and where they commonly went wrong.

In the second class we tie it all together on the **Week 6 movies API**. We take a copy
and add custom validation middleware, morgan + winston logging, a login that trades a
password for a JWT, and roles: anyone can read, editors can create and update, only admins
can delete. Then we harden it with **helmet** (security headers), a **rate limit** on the
login, and a **logout** that really invalidates the token. We test every case (`400`,
`401`, `403`, `404`) with an updated `requests.http` and Postman collection, then go
through the **loose ends** a developer should tie up before pushing code: HTTPS, refresh
tokens, secrets, log rotation, tests and more. Then we read a **complete AI prompt** that
rebuilds the whole API from scratch, including the security requirements, to see what a
good prompt has to spell out. We finish with where this API goes next: an EJS front end
next week, and React later in the term.

## What we'll cover

- Assignment 3 review: the MongoDB queries, and the mistakes worth not repeating
- What middleware is: functions that run on every request, `next()`, and order
- Organizing routes with `express.Router`
- One central error handler, and why it has four parameters `(err, req, res, next)`
- Validating request input and responding with the right status code
- Request logging with morgan, application logging with winston
- What's in a JWT, and verifying one in middleware
- Putting it together: validation, logging and JWT auth with roles on the movies API
- `401` vs. `403`, and why middleware order matters
- Security headers with helmet, rate limiting the login, and revoking a JWT on logout
- Loose ends to tie up before you push, and common security concerns
- Writing a complete prompt for an AI coding assistant
- Activity 7: follow one token's whole life in Bruno - log in, use it, log out, get refused

## College dates this week

- **Wednesday, October 21**: Assessment & Evaluation day · College open / no classes

## Before class

- Pull the latest course code and start Docker: `git pull`, then `docker compose up -d`
  (this installs the new packages: `morgan`, `winston`, `jsonwebtoken`, `bcryptjs`,
  `helmet`, `express-rate-limit`).
- Have MongoDB's `sample_mflix` loaded from Week 6 (the movies API uses it).
- Install the **REST Client** extension in VS Code if you haven't already.
- Install **Bruno** (free, no account) for Activity 7: https://www.usebruno.com/downloads
