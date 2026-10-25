# Week 8: Put a Face on the API (EJS)

Last week we finished the movies API: validation, logging, a JWT login with roles, and the
security loose ends. It works, but the only way to use it is Postman or Swagger. This week
we give it a face. **EJS** (Embedded JavaScript) templates let the server build HTML pages:
you write ordinary HTML and drop data into it with `<%= %>`, loop with `<% %>`, and share a
header and footer with partials. It's the Node version of the `<?php ?>` pages from the start of
the term, and like PHP, **EJS runs on the server**. The browser only ever gets finished HTML. We'll
also look at where that sits in the stack, and why a browser framework like **React** (which
builds the page in the browser from the same JSON API) is just as valid a choice for a
different kind of app.

In the first class we start from an empty folder and build up in small steps we write
together: a hello-world page in under ten minutes, then data and escaping, loops, partials
and forms. In the second class we put it all on the week 7 movies API: a searchable,
paged movie list rendered from MongoDB, a detail page, add/edit/delete forms that use the
API's own validation rules, and a login that uses a **session cookie** instead of a token, with
roles and protection against cross-site request forgery. The third class is a wrap-up: a
review game, a debate on server- vs client-side rendering, the weekly quiz, and a levelled lab
where you build your own movie pages with comments.

## What we'll cover

- What a template engine is, and why it beats gluing HTML strings together
- `res.render()`, the `views` folder, and passing data to a template
- `<%= %>` (escaped) vs `<%- %>` (raw) vs `<% %>` (logic), and why escaping stops XSS
- Loops, conditions and empty states; partials for a shared header and footer
- GET forms (search) vs POST forms (changes), and Post/Redirect/Get
- The same Express app answering with JSON for the API and HTML for the pages
- Re-using validation rules so a form and the API can't disagree
- Sessions with `express-session`: cookies vs JWTs, and when to use each
- Roles on pages, `res.locals`, flash messages, and CSRF tokens
- Server-side rendering (EJS, PHP) vs client-side rendering (fetch, React): trade-offs
- Lab: paging, comments from a second collection, and a reusable partial

## Before class

- Pull the latest course code and start Docker: `git pull`, then `docker compose up -d`.
  No new packages this week.
- Have MongoDB's `sample_mflix` loaded from Week 6 (classes 2 and 3 use it).
- Bring last week's movies API to mind: we build directly on it.
