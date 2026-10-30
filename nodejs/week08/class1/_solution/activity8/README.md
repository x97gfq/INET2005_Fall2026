# Activity 8: Movie Night, step by step

This is the answer key worked through one TODO at a time. Try the activity first
(`week08/class1/activity8/`), then use this guide to check your work or get unstuck.

Run the finished version from the **repo root**:

```bash
docker compose exec node node week08/class1/_solution/activity8/app.js
```

Open http://localhost:3001. Every step below changes either `app.js` (restart the server with
**Ctrl+C** and run it again) or a `.ejs` file (just refresh the browser).

## What you start with

- `app.js`: the `movies` array, and `allGenres` (every genre once, A-Z).
- `views/partials/header.ejs` and `footer.ejs`: the top and bottom of every page, with Bootstrap.
  The header prints `<%= title %>`, so **every page you render must pass a `title`**.
- `views/movies.ejs`: the includes, the heading and an empty `<ul>`.

---

## Step 1 (TODO 1): wire EJS in

Tell Express which template engine to use and where the templates are. Same two lines as
`01_hello`.

```js
// app.js
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
```

- `view engine`: `res.render('movies')` now means `views/movies.ejs`, so you leave off the `.ejs`.
- `views`: `path.join(__dirname, 'views')` is the `views` folder **next to `app.js`**. Leave it out
  and Express looks in the folder you ran `node` from, which is the repo root in Docker. Then you
  get `Failed to lookup view "movies"`.

Nothing to see yet. The page still says `Cannot GET /`, because there is no route.

## Step 2 (TODO 2): the route

```js
// app.js
app.get('/', (req, res) => {
  res.render('movies', { title: 'Movie Night', movies });
});
```

Each key in the object becomes a variable in the template. `movies` is shorthand for
`movies: movies`.

**Check:** restart and refresh. You see the navbar, the **Movie Night** heading and the footer,
but no movies yet.

## Step 3 (TODO 3): the list, with genre badges

In `views/movies.ejs`, replace `<!-- your loop here -->` with a loop. Each movie has its own
`genres` array, so there's a second loop inside the first.

```ejs
<ul class="list-group">
  <% movies.forEach((m) => { %>
    <li class="list-group-item">
      <strong><%= m.title %></strong> (<%= m.year %>)
      <% m.genres.forEach((g) => { %>
        <span class="badge text-bg-secondary"><%= g %></span>
      <% }); %>
    </li>
  <% }); %>
</ul>
```

- `<% %>` runs JavaScript and prints nothing. Use it for the `forEach` lines.
- `<%= %>` prints a value, HTML-escaped. Use it for anything that came from data.
- Every `{` opened in one tag is closed in a later one: `<% }); %>`. Count them if the page errors
  with `Unexpected token`.

**Check:** refresh. You see ten movies, each with grey genre badges.

## Step 4 (TODO 4): flag the best ones

Inside the `<li>`, after the genre loop, add an `if`:

```ejs
      <% if (m.rating >= 8.5) { %>
        <span class="badge text-bg-warning">Must watch</span>
      <% } %>
```

**Check:** refresh. Casablanca, The Godfather, Alien, Back to the Future, The Matrix and Spirited
Away get a yellow **Must watch** badge. Casablanca, Alien and Back to the Future are exactly 8.5,
so `>=` matters.

## Step 5 (TODO 5): filter by genre

There are two halves: the route reads the choice, and the template shows the dropdown.

### 5a. The route

```js
// app.js
app.get('/', (req, res) => {
  const genre = req.query.genre || '';
  const shown = genre ? movies.filter((m) => m.genres.includes(genre)) : movies;
  res.render('movies', { title: 'Movie Night', movies: shown, genres: allGenres, genre });
});
```

- A GET form puts its values in the URL (`/?genre=Comedy`), so they arrive in `req.query`.
- `|| ''` handles the first visit, when there is no `?genre=` yet.
- `filter` + `includes`: keep the movies whose `genres` array contains the chosen genre. An empty
  string means "no filter", so every movie stays.
- The template now needs `genres` (to build the options) and `genre` (to know which is selected).

### 5b. The form

Put this above the `<ul>` in `views/movies.ejs`:

```ejs
<form method="GET" action="/" class="row g-2 mb-4">
  <div class="col-auto">
    <select name="genre" class="form-select">
      <option value="">All genres</option>
      <% genres.forEach((g) => { %>
        <option value="<%= g %>" <%= g === genre ? 'selected' : '' %>><%= g %></option>
      <% }); %>
    </select>
  </div>
  <div class="col-auto"><button class="btn btn-primary">Filter</button></div>
</form>
```

- `name="genre"` is what makes it `req.query.genre`. The name in the form and the name in the
  route must match.
- Without `selected`, the dropdown would jump back to "All genres" after every filter even though
  the list is filtered. The ternary prints `selected` on the one option that matches.
- `method="GET"`, not POST: a filter only reads data, and it gives you a URL you can bookmark.

### 5c. (Optional) a count under the list

```ejs
<p class="text-muted mt-2"><%= movies.length %> movie<%= movies.length === 1 ? '' : 's' %><%= genre ? ' in ' + genre : '' %>.</p>
```

**Check:** restart, pick **Comedy**, click **Filter**. The URL is `/?genre=Comedy`, four movies
show, the dropdown still says Comedy, and the count reads "4 movies in Comedy". Pick **Musical**
and it reads "1 movie in Musical".

## Step 6 (TODO 6, stretch): a detail page

### 6a. The route

```js
// app.js
app.get('/movies/:id', (req, res) => {
  const movie = movies.find((m) => m.id === Number(req.params.id));
  if (!movie) return res.status(404).render('movie', { title: 'Not found', movie: null });
  res.render('movie', { title: movie.title, movie });
});
```

- `req.params.id` is a **string** (`'3'`), and the ids in the array are numbers. `'3' === 3` is
  false, so convert it with `Number()`.
- `find` returns `undefined` when nothing matches. That gives a 404, and the page still renders,
  so it still needs a `title` for the header.
- `return` stops the function so it doesn't try to render twice.

### 6b. The view: `views/movie.ejs` (a new file)

```ejs
<%- include('partials/header') %>

<a href="/" class="btn btn-sm btn-outline-secondary mb-3">&larr; All movies</a>

<% if (!movie) { %>
  <div class="alert alert-warning">No movie with that id.</div>
<% } else { %>
  <h1><%= movie.title %> <small class="text-muted"><%= movie.year %></small></h1>
  <p>IMDb <strong><%= movie.rating %></strong></p>
  <p><%= movie.genres.join(', ') %></p>
<% } %>

<%- include('partials/footer') %>
```

`<%- include(...) %>` uses the **raw** tag on purpose: the partial is HTML you wrote, so it must
not be escaped. The partial sees the same variables as the page, which is how the header gets
`title`.

### 6c. Link the titles

In `movies.ejs`, wrap the title from Step 3 in a link:

```ejs
<a href="/movies/<%= m.id %>"><strong><%= m.title %></strong></a> (<%= m.year %>)
```

**Check:** click **The Godfather** to get `/movies/3` with its rating and genres. Then try
http://localhost:3001/movies/99. You get the "No movie with that id" page, and DevTools →
Network shows a **404**.

---

## Common mistakes

| You see | Usually means |
|---|---|
| `Cannot GET /` | No `app.get('/')` yet (Step 2), or you didn't restart after editing `app.js` |
| `Failed to lookup view "movies"` | The `views` setting is missing or wrong (Step 1) |
| `title is not defined` | A `res.render` call didn't pass `title`, and the header needs it |
| `genres is not defined` | The form is in the template but the route doesn't pass `genres`/`genre` yet (Step 5a) |
| `Unexpected token` / `missing ) after argument list` | An unclosed `{` or `)` across `<% %>` tags. Match every `forEach((x) => {` with `});` |
| The filter works but the dropdown resets | The `selected` ternary is missing (Step 5b) |
| Every detail page says "No movie" | You compared `req.params.id` without `Number()` (Step 6a) |
| Tags like `<strong>` show as text | You printed HTML with `<%= %>`. That's correct for data. Only `include` uses `<%- %>` |
