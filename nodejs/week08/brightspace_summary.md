# Week 8: EJS Server-Side Templates and Sessions

Last week we finished the Express backend: middleware, validation, logging and a JWT
login on the movies API. This week we build the front end on the server. **EJS**
(Embedded JavaScript) templates let you build HTML with plain JavaScript: loop over data,
render conditionally, and drop values in with `<%= %>` (escaped) and `<% %>` (logic) tags,
with partials for the markup that repeats on every page. It's the Node counterpart to
writing `<?php ?>` inside a `.php` file from Week 2. We wire it into Express with
`app.set('view engine', 'ejs')` and `res.render()`, rebuild the Week 6 movies page so the
**server** renders the HTML (instead of the browser building it from JSON), and finish with
a login that uses **sessions** via `express-session`, the Node version of the PHP sessions
from Week 2 and the cookie-based cousin of last week's JWT.

In the second class we use the same "input in, rendered response out" shape to build a
ChatGPT page: a form posts, the server does something with the input, and EJS renders the
answer.

## What we'll cover

- What EJS is, and why server-side templating beats concatenating HTML strings
- `<%= %>` for escaped output vs. `<%- %>` and `<% %>`, and `include` for partials
- Wiring EJS into Express: `app.set('view engine', 'ejs')` and `res.render()`
- Server-side rendering vs. the client-side `fetch()` rendering from Week 6
- Sessions in Express with `express-session`, compared with PHP sessions and with JWTs
- A page that collects input and renders a response: the ChatGPT page

## Before class

- Pull the latest course code and start Docker: `git pull`, then `docker compose up -d`.
- Have MongoDB's `sample_mflix` loaded from Week 6 (the movies page uses it).
