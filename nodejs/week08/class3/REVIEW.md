# Weeks 4-8 Review: One Request, Top to Bottom

Everything since week 4 is one stack. Follow a single click through it:

```
Browser  ──GET /movies?title=matrix──▶  Express (Node)
                                          │ middleware: helmet, morgan, body parsers, session   (week 7, 8)
                                          │ router:     /api/movies  or  /movies                 (week 7)
                                          │ guard:      requireJwt / requireLogin                (week 7, 8)
                                          │ validate:   movieProblems()                          (week 7)
                                          │ query:      Movie.find() via Mongoose ──▶ MongoDB     (week 4, 6)
                                          ▼
                       res.json(data)  ─or─  res.render('movies', data)                          (week 6 / week 8)
Browser  ◀── JSON (the browser builds the page)  ─or─  finished HTML (the server built it)
```

## The stack, one row per layer

| Layer | What we used | Weeks | Alternatives you'll hear about |
|---|---|---|---|
| Database | MongoDB (documents) · MySQL (tables) | 4-6 | PostgreSQL, SQLite, Firebase |
| Data access | Mongoose models · `mysql2` | 5-6 | Prisma, Sequelize, the raw `mongodb` driver |
| Server | Node + Express: routes, `Router`, middleware | 4-7 | Fastify, NestJS · PHP, Django, Rails, ASP.NET |
| API | REST + JSON, OpenAPI/Swagger, Postman/Bruno | 5-7 | GraphQL, gRPC |
| Auth | JWT bearer tokens (API) · sessions + cookies (pages) | 7-8 | OAuth / "Sign in with Google", Passport, Auth0 |
| Views | **EJS on the server** · `fetch()` in the browser | 6, 8 | Handlebars, Pug, PHP · React, Vue, Svelte, Angular |

**MERN** = MongoDB, Express, React, Node. We have the M, E and N, and EJS stands where the R goes.
**LAMP** (Linux, Apache, MySQL, PHP) is the PHP stack we started the term with.

## EJS is still server-side

- EJS runs **on the server**. The browser never sees `<%= %>`: View Source shows plain HTML.
- That makes it the same family as PHP: the server builds the page, the browser displays it.
- A browser framework like **React** runs **in the browser**: it downloads JavaScript, calls an API
  with `fetch()`, and builds the page there. Our API (week 7) is exactly what it would call.
- Both are fine choices. They suit different jobs:

| | Server-rendered (EJS, PHP) | Client-rendered (React and friends) |
|---|---|---|
| First page load | Fast: HTML arrives ready | Slower: download JS, then fetch data |
| Search engines / no-JS | See everything | Need extra work (or server rendering) |
| Clicking around | A full page load each time | Instant, no reload |
| State (who's logged in, a cart) | On the server (session) | In the browser (memory, a token) |
| Good for | Content sites, admin pages, forms | Dashboards, app-like UIs, offline |
| Same API for a phone app? | You'd build the JSON API anyway | Already using it |

Modern frameworks blur the line: **Next.js** (React) and **Nuxt** (Vue) render on the server
first, then hand over to the browser.

## Ten things to be able to explain

1. `<%= %>` vs `<%- %>` vs `<% %>`, and which one goes around user input.
2. Where `res.render('movies')` looks for the template, and why we set `app.set('views', ...)`.
3. What a partial is, and how to pass data into one.
4. GET form vs POST form: where the data goes (`req.query` vs `req.body`) and when to use each.
5. Why a successful POST redirects (Post/Redirect/Get).
6. What `res.locals` is for (hint: the header shows the logged-in user on every page).
7. A session vs a JWT: where the data lives, and who sends what.
8. Why HTML forms can't send DELETE, and what we did instead.
9. CSRF: what it is, and the two locks we used (`sameSite` + a form token).
10. Server-side vs client-side rendering: how View Source tells you which one a page uses.
