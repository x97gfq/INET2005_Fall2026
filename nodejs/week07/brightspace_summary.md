# Week 7: Middleware, EJS Server-Side Templates and Sessions

This week we slow down on the Express backend before adding the front end. We started
with servers, MongoDB, MySQL and a CRUD API fast; now we name the pieces that have been
quietly doing the work. **Middleware** is any function that runs on a request on its way
to your route — you've already used `express.json()` and `express.static`. We'll write our
own (a request logger, a route guard), organize routes with `express.Router`, add one
central **error handler**, and **validate input** so bad data is turned away with a clear
`400` instead of crashing the server. We'll also review **Assignment 3** — what the MongoDB
queries were meant to do and where they commonly went wrong.

In the second class we add **EJS** (Embedded JavaScript), server-side templates that let you
build HTML with plain JavaScript: loop over data, render conditionally, and drop values in
with `<%= %>` (escaped) and `<% %>` (logic) tags, with partials for the markup that repeats
on every page. It's the Node counterpart to writing `<?php ?>` inside a `.php` file from
Week 2. We wire it into Express with `app.set('view engine', 'ejs')` and `res.render()`,
rebuild the Week 6 movies page so the **server** renders the HTML (instead of the browser
building it from JSON), and finish with a login that uses **sessions** via `express-session`
— the Node version of the PHP sessions from Week 2. The EJS form that takes input and renders
a response is the exact shape of next week's ChatGPT page; only the function in the middle
changes.

## What we'll cover

- Assignment 3 review — the MongoDB queries, and the mistakes worth not repeating
- What middleware is: functions that run on every request, `next()`, and order
- Organizing routes with `express.Router`
- One central error handler, and why it has four parameters `(err, req, res, next)`
- Validating request input and responding with the right status code
- What EJS is, and why server-side templating beats concatenating HTML strings
- `<%= %>` for escaped output vs. `<% %>` for logic, and `include` for partials
- Wiring EJS into Express: `app.set('view engine', 'ejs')` and `res.render()`
- Server-side rendering vs. the client-side `fetch()` rendering from Week 6
- Sessions in Express with `express-session`, compared with PHP sessions
- A page that collects input and renders a response — groundwork for Week 8

## College dates this week

- **Wednesday, October 21** — Assessment & Evaluation day · College open / no classes

## Before class

- Pull the latest course code and start Docker: `git pull`, then `docker compose up -d`
  (this installs the new packages: `ejs`, `express-session`, `bcryptjs`).
- Have MongoDB's `sample_mflix` loaded from Week 6 (the movies page uses it).
- Install the **REST Client** extension in VS Code if you haven't already.
