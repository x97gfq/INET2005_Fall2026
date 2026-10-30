# Activity 10: mflix-lite (Week 9 Lab)

A small face on `sample_mflix`, built in levels. The list page and the movie page already
work. Each level adds one thing you've seen this week. Do them in order and get each level
working before you start the next one.

```bash
docker compose exec node node week09/class2/activity10/app.js
```

Open http://localhost:3001. Answer key: `week09/class2/_solution/activity10/` (try first!).

| Level | You add | Skills | Who |
|---|---|---|---|
| **1** | Paging on the list · the movie's comments on its page | query strings, `skip`/`limit`, a second collection, a loop + empty state | everyone |
| **2** | A `movie-row` partial · a **Top rated** page that reuses it | partials with data, a sorted query | most |
| **3** | A form to add a comment | POST form, validation, re-render with errors, Post/Redirect/Get | some |
| **4** | Top rated again, built **in the browser** with `fetch()` | a JSON route, client-side rendering | stretch |

---

## Level 1: paging and comments

**1a. Paging** (`app.js` GET `/movies`, `views/movies.ejs`)

- Read `?page=` from the URL (at least 1), and `skip((page - 1) * PAGE_SIZE)`.
- Show "page 2 of 1178" with **Previous** / **Next** links.
- The links must keep the search: on page 2 of a search for "star", Next goes to
  `/movies?title=star&page=3`.

> **Hint:** build the link in the route and pass a *function* to the template:
> `const pageUrl = (n) => '/movies?' + new URLSearchParams({ title: search, page: n });`
> then `href="<%= pageUrl(page + 1) %>"`. `mflix-web/routes/pages.js` does this.

**1b. Comments** (`app.js` GET `/movies/:id`, `views/movie.ejs`)

- `sample_mflix.comments` has `{ name, email, movie_id, text, date }`. `movie_id` is
  the movie's `_id`.
- Show the newest 10 for the movie, with the total: **Comments (140)**.
- Show the name, date and text. **Never the email**: it's personal data.
- No comments? Say so.

> **Try:** The Matrix has plenty of comments. Search "matrix" and open it.

✔ **Check:** page through a search and back; a movie with comments and one without both look right.

## Level 2: a partial with data, and Top rated

**2a.** Move the `<tr>` for one movie out of `movies.ejs` into `views/partials/movie-row.ejs`.
Include it inside the loop and pass the movie in:

```ejs
<%- include('partials/movie-row', { m }) %>
```

**2b.** Add `GET /top`: the 20 best-rated **movies** (`type: 'movie'`) with at least 50,000 IMDb
votes, best first. Make `views/top.ejs` (copy `movies.ejs` as a start) using the same row
partial, plus a rank column (`#`).

> **Hint:** `{ type: 'movie', 'imdb.votes': { $gte: 50000 } }`, `.sort({ 'imdb.rating': -1 })`.
> For the rank, pass it in too, `{ m, rank: i + 1 }`, and in the partial use
> `<% if (locals.rank) { %>`. `locals.` stops the list page crashing when no rank is passed.

✔ **Check:** change the row partial once (e.g. make the year bold) and both pages change.

**Discuss:** The Shawshank Redemption shows up twice. Is that a bug in your code or in the
data? How would you find out? (Hint: compare the two `_id`s in Compass.)

## Level 3: add a comment

- On the movie page, a POST form to `/movies/:id/comments` with **name** and **text**.
- Both required (trimmed). Name up to 50 characters, text up to 1000.
- If there are problems, respond with **400** and the same page again: the messages under each box,
  and what they typed still in the boxes.
- Otherwise `Comment.create(...)` and **redirect** to `/movies/<id>#comments`. Then press F5:
  nothing is posted twice.

> **Hint:** the GET and the failed POST both need "find the movie + its comments + render".
> Put that in one function, e.g. `renderMovie(res, id, { form, errors })`.

✔ **Check:** post `<b>hi</b>` as a comment. It must show the tags as text, not bold.

## Level 4 (stretch): the same page, built in the browser

`public/top.html` is given: a plain HTML page with an empty table and `<script src="top.js">`.

- Add `GET /api/top` that sends `topRated()` as **JSON**.
- Write `public/top.js`: `fetch('/api/top')`, then build one `<tr>` per movie.
  Use `textContent`, never `innerHTML`, for the data.
- Open `/top` and `/top.html` side by side, then **View Page Source** on each.

**Discuss:** Which one has the movies in its source? Which would a search engine see? Which
one could you rebuild in React without touching the server?

---

## Done? Stretch ideas

- A genre dropdown on the list, kept in the paging links (Activity 8 + level 1).
- Show the poster on the movie page (`movie.poster`). Some of the URLs are dead, so what
  should the page do then?
- Add `helmet()` (week 7). Does `top.html` still work? What would break if `top.js` were
  pasted into a `<script>` tag inside `top.html` instead?
