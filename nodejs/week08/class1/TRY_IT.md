# Class 1: Try It

A small exercise after each step, 2-5 minutes each. We do them together. Change the step's
files, **Ctrl+C** and re-run the server, then refresh the browser.

> **Tip:** Node doesn't reload by itself. Changed an `.ejs` file? Just refresh: Express
> re-reads templates when they change (as long as `NODE_ENV` isn't `production`). Changed `app.js`? Restart the server.

---

## After 01_hello

1. Make `/` say hello to **you**.
2. Pass a second variable, `course: 'INET2005'`, and print it in a `<p>`.
3. Visit `http://localhost:3001/hello/<b>Sam</b>`. What do you see, and why isn't Sam bold?

<details><summary>Answers</summary>

```js
res.render('hello', { name: 'Jordan', course: 'INET2005' });
```
```html
<p>Welcome to <%= course %></p>
```
3. You see the tags as text: `<%= %>` escaped the `<b>` into `&lt;b&gt;`. That's the
   safety net that stops a user's input from becoming HTML.

**Watch out:** if you add `course` to the template but only pass it from `/`, the
`/hello/:name` route crashes with `course is not defined`. Every variable the template
uses must be passed by every route that renders it (or check with `locals.course`).
</details>

---

## After 02_data

1. Change the rating to `7.5`. Which branch of the `if` shows now?
2. Add `cast: ['Keanu Reeves', 'Carrie-Anne Moss']` to the movie and print it as a comma list.
3. Add a "Classic" line that shows only when `movie.year < 2000`.

<details><summary>Answers</summary>

1. The `else`: just "IMDb 7.5".
2. `<p>Starring <%= movie.cast.join(', ') %></p>`
3. `<% if (movie.year < 2000) { %><p>Classic</p><% } %>`
</details>

---

## After 03_loops

1. Add a **Classic** column that says "yes" for movies before 1980.
2. Show the list best-rated first. Do it in `app.js`, not in the template.

<details><summary>Answers</summary>

```html
<td><%= m.year < 1980 ? 'yes' : '' %></td>
```
```js
// copy first ([...movies]) so the original array keeps its order
res.render('movies', { movies: [...movies].sort((a, b) => b.rating - a.rating) });
```
Sorting, filtering and anything else that's logic belong in the route. The template only
displays what it's given.
</details>

---

## After 04_partials

1. Add a **Contact** page at `/contact` with its own nav link. Time yourself: it should take
   under 3 minutes, because the header and footer are already done.

<details><summary>Answer</summary>

```js
app.get('/contact', (req, res) => res.render('contact', { title: 'Contact', page: 'contact' }));
```
`views/contact.ejs`:
```html
<%- include('partials/header') %>
<p>Email us at movies@example.com</p>
<%- include('partials/footer') %>
```
`partials/header.ejs`, one more link:
```html
<a href="/contact" class="<%= page === 'contact' ? 'active' : '' %>">Contact</a>
```
</details>

---

## After 05_forms

1. Add a **rating** field (0 to 10, decimals allowed) to the add form, validate it, and show
   it in the list.
2. Submit a movie, then press **F5**. Why don't you get a "resubmit form?" warning?

<details><summary>Answers</summary>

```js
const rating = Number(req.body.rating);
if (req.body.rating === '' || Number.isNaN(rating) || rating < 0 || rating > 10) {
  errors.rating = 'Rating must be a number from 0 to 10';
}
// ...
movies.push({ title, year, rating });
```
```html
<p>
  <label>Rating <input name="rating" value="<%= form.rating || '' %>"></label>
  <% if (errors.rating) { %><span class="error"><%= errors.rating %></span><% } %>
</p>
```
2. Because the POST answered with a **redirect**. The page you're on was loaded by a GET, so
   F5 repeats the GET, not the POST (Post/Redirect/Get).
</details>
