# Week 8: Put a Face on the API (EJS)

Last week we finished the movies API: validation, logging, a JWT login with roles, and the
security loose ends. It works, but the only way to use it is Postman or Swagger. This week
we learn how to give it a face. **EJS** (Embedded JavaScript) templates let the server build
HTML pages: you write ordinary HTML and drop data into it with `<%= %>`, loop with `<% %>`, and
share a header and footer with partials. It's the Node version of the `<?php ?>` pages from the
start of the term, and like PHP, **EJS runs on the server**. The browser only ever gets finished
HTML. We'll also look at where that sits in the stack, and why a browser framework like
**React** (which builds the page in the browser from the same JSON API) is just as valid a
choice for a different kind of app.

We start from an empty folder and build up in five small steps we write together: a
hello-world page in under ten minutes, then data and escaping, loops, partials and forms. Each
step has a short Try It exercise, and Activity 8 (Movie Night) puts them all together in one
page. Next week we put these templates on the movies API itself.

## What we'll cover

- What a template engine is, and why it beats gluing HTML strings together
- `res.render()`, the `views` folder, and passing data to a template
- `<%= %>` (escaped) vs `<%- %>` (raw) vs `<% %>` (logic), and why escaping stops XSS
- Loops, conditions and empty states
- Partials for a shared header and footer, and a static CSS file
- GET forms (search) vs POST forms (changes), `req.query` vs `req.body`
- Validating a form and showing it again with the errors; Post/Redirect/Get
- Server-side rendering (EJS, PHP) vs client-side rendering (fetch, React): where each fits

## Before class

- Pull the latest course code and start Docker: `git pull`, then `docker compose up -d`.
  No new packages this week.
- Bring last week's movies API to mind: the templates are how we'll put a face on it.
