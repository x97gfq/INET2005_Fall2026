# Week 10 class 2: instructor walkthrough

The code for **React, from the ground up** (deck `slides/nodejs_week10.pptx`, slides 26-58), in the
order you type it with the class. Each step lists its slide number and the code students should have
at the end of that step. This folder holds the final state (end of step 8).

All commands run from the **repo root**. Students' app lives in `react/mflix-react` (the
`inet-react` container's working folder).

---

## Before class

```bash
git pull
docker compose up -d
docker compose ps        # inet-react must be Up; react/mflix-react exists and is empty
```

To demo the answer key instead of your own copy, use PowerShell (Git Bash mangles `/app/...`):

```powershell
docker compose exec -w /app/_solution/week10 react npm install
docker compose exec -w /app/_solution/week10 react npm run dev
```

---

## Step 1: Scaffold it (slide 34)

```bash
docker compose exec react npm create vite@9 . -- --template react --no-immediate
docker compose exec react npm install
```

- `.` scaffolds into the folder Docker already made. If create-vite asks anything, Enter takes the default.
- Install **in the container**, never on Windows: Rolldown ships a native binary per OS ("Cannot find native binding").
- `npm install` takes about 20 seconds.

**Slide 35:** walk through the file tree. The only HTML file is a nearly empty `index.html`. **Don't run `npm run dev` yet.**

---

## Step 2: vite.config.js for Docker, then run it (slides 36-37)

`react/mflix-react/vite.config.js`, replace everything:

```js
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,                  // listen on every address, so Docker can forward 5173
    watch: { usePolling: true }, // Windows doesn't tell the container a file changed
    proxy: {
      '/api': process.env.API_TARGET || 'http://localhost:3001',
    },
  },
})
```

```bash
docker compose exec react npm run dev     # leave it running: http://localhost:5173
```

Demo: click the counter a few times, change "Get started" to "Hello mflix" in `src/App.jsx`, and save.
The page updates with no reload and keeps the count (hot module replacement). This is the "up and
running" checkpoint: make sure everyone gets here before you move on.

> Pop quiz #6 (slides 38-39): answer **C**, `usePolling`.
> Slide 40: JSX refresher. Pop quiz #7 (41-42): answer **C**, `onClick={save}`.

---

## Step 3: A clean slate (slide 43)

`index.html`: in `<head>`, change the title and add Bootstrap:

```html
<title>mflix</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
```

`src/main.jsx`: delete the `import './index.css'` line. The result:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.jsx`, replace everything:

```jsx
function App() {
  return (
    <div className="container my-4">
      <h1 className="mb-3">Movies</h1>
    </div>
  )
}

export default App
```

Then delete `src/App.css`, `src/index.css` and `src/assets/`. The page shows one heading in Bootstrap's font.
**If the page goes blank,** a file still imports `App.css` or the logo. Check the Console or Vite's error overlay.

---

## Step 4: Your first component (slide 44)

`src/Welcome.jsx` (new):

```jsx
export default function Welcome({ name }) {
  return <p className="lead">Welcome to {name}.</p>
}
```

`src/App.jsx`:

```jsx
import Welcome from './Welcome.jsx'

function App() {
  return (
    <div className="container my-4">
      <h1 className="mb-3">Movies</h1>
      <Welcome name="mflix" />
    </div>
  )
}

export default App
```

Try: add a second `<Welcome name="INET 2005" />`, see two paragraphs, then delete it.
Bridge to week 8: `include('partials/header', { title: 'Register' })`.

---

## Step 5: Components and props, the movie table (slide 45)

`src/sampleMovies.js`: students **copy** this file from `react/_solution/week10/src/sampleMovies.js` rather than typing it:

```js
export const sampleMovies = [
  { _id: '573a139bf29313caabcf4dd0', title: 'Fight Club', year: 1999, genres: ['Drama'], imdb: { rating: 8.9 } },
  { _id: '573a139bf29313caabcf3d23', title: 'The Matrix', year: 1999, genres: ['Action', 'Sci-Fi'], imdb: { rating: 8.7 } },
  { _id: '573a139af29313caabcf0eae', title: 'The Green Mile', year: 1999, genres: ['Crime', 'Drama', 'Fantasy'], imdb: { rating: 8.5 } },
  { _id: '573a139ef29313caabcfc5d8', title: 'American Beauty', year: 1999, genres: ['Drama', 'Romance'], imdb: { rating: 8.4 } },
  { _id: '573a139ef29313caabcfbdfe', title: 'The Sixth Sense', year: 1999, genres: ['Drama', 'Mystery', 'Thriller'], imdb: { rating: 8.2 } },
  { _id: '573a139af29313caabcf0d8b', title: 'Toy Story 2', year: 1999, genres: ['Animation', 'Adventure', 'Comedy'], imdb: { rating: 7.9 } },
]
```

`src/MovieTable.jsx` (new):

```jsx
export default function MovieTable({ movies }) {
  if (movies.length === 0) {
    return <p className="text-muted">No movies match.</p>
  }

  return (
    <table className="table table-striped align-middle">
      <thead>
        <tr>
          <th>Title</th>
          <th>Year</th>
          <th>Genres</th>
          <th>IMDb</th>
        </tr>
      </thead>
      <tbody>
        {movies.map((m) => (
          <tr key={m._id}>
            <td>{m.title}</td>
            <td>{m.year}</td>
            <td>{m.genres?.join(', ')}</td>
            <td>{m.imdb?.rating ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

`src/App.jsx`:

```jsx
import Welcome from './Welcome.jsx'
import MovieTable from './MovieTable.jsx'
import { sampleMovies } from './sampleMovies.js'

function App() {
  return (
    <div className="container my-4">
      <h1 className="mb-3">Movies</h1>
      <Welcome name="mflix" />
      <MovieTable movies={sampleMovies} />
    </div>
  )
}

export default App
```

`?.` and `??` are there for real API rows that are missing genres or a rating. The sample data has both on every row.

> Pop quiz #8 (slides 46-47): answer **A**, `function MovieTable({ movies })`.

---

## Step 6: useState, a like button (slide 48)

Before typing, ask: "What happens with `let likes = 0` and `likes++`?"

`src/LikeButton.jsx` (new):

```jsx
import { useState } from 'react'

export default function LikeButton() {
  const [likes, setLikes] = useState(0)

  return (
    <button className="btn btn-sm btn-outline-danger" onClick={() => setLikes(likes + 1)}>
      &#9829; {likes}
    </button>
  )
}
```

`src/MovieTable.jsx`: add a fifth column:

```jsx
import LikeButton from './LikeButton.jsx'
// ...
<th>Likes</th>                 {/* in <thead>, after IMDb */}
// ...
<td><LikeButton /></td>        {/* in each row, after the rating */}
```

Tested: click Fight Club twice and The Green Mile once, and the counts read 2, 0, 1, 0, 0, 0. Each row has its own state.

---

## Step 7: useState, a live search (slide 49)

`src/App.jsx`:

```jsx
import { useState } from 'react'
import Welcome from './Welcome.jsx'
import MovieTable from './MovieTable.jsx'
import { sampleMovies } from './sampleMovies.js'

function App() {
  const [search, setSearch] = useState('')

  // Not state: worked out from state on every render
  const shown = sampleMovies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container my-4">
      <h1 className="mb-3">Movies</h1>
      <Welcome name="mflix" />
      <input
        className="form-control mb-3"
        placeholder="Search titles"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <MovieTable movies={shown} />
    </div>
  )
}

export default App
```

(The slide leaves out `<Welcome />` to save space. Students keep it.)
Tested: "the" gives 3 rows, and "zzz" shows the empty message.

> Pop quiz #9 (slides 50-51): answer **B**: only a setter redraws, and state survives the redraw.

---

## Step 8: useEffect, ask the server (slide 52)

Start week 9's warm-up in a **second terminal**. Vite keeps running in the first.

```bash
docker compose exec node node week09/class1/_solution/00_warmup/app.js     # :3001
```

What it serves (already written, just show it):

```js
app.get('/api/movies', async (req, res) => {
  const results = await movies.find({ year: 1999 }).limit(10).toArray();
  res.json(results);
});
```

`src/App.jsx`: the final version, the same as [src/App.jsx](src/App.jsx). Delete the `sampleMovies` import:

```jsx
import { useEffect, useState } from 'react'
import Welcome from './Welcome.jsx'
import MovieTable from './MovieTable.jsx'

function App() {
  const [search, setSearch] = useState('')
  const [movies, setMovies] = useState(null) // null = not here yet

  useEffect(() => {
    fetch('/api/movies')
      .then((res) => res.json())
      .then((data) => setMovies(data))
  }, []) // [] = once, after the first render

  // Hooks first, then any early return
  if (movies === null) {
    return <p className="container my-4 text-muted">Loading...</p>
  }

  const shown = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container my-4">
      <h1 className="mb-3">Movies</h1>
      <Welcome name="mflix" />
      <input
        className="form-control mb-3"
        placeholder="Search titles"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <MovieTable movies={shown} />
    </div>
  )
}

export default App
```

Points to make:
- **There's no login.** The warm-up reads MongoDB directly. Week 11 puts the logged-in mflix-bff behind React.
- 6 hand-typed movies become 10 real ones. Search "the" and you get The Autumn Heart, A Walk on the Moon and The Mummy.
- In DevTools > Network, the request goes to **5173**, not 3001. Vite's proxy forwards it, so there's no CORS.
- **Two requests** come from StrictMode in development, on purpose.
- Stop the server and reload: the proxy returns 502 and the page stays on "Loading..." for good. Week 11's `api.js` handles that.

> Slide 53: the rules of hooks and the dependency-array table.
> Pop quiz #10 (slides 54-55): answer **C**, once after the first render.

---

## Wrap-up (slides 56-57)

Slide 56 is the cheat sheet. Leave it up during the try-it.

Answers to the try-it on slide 57:

1. **Like Toy Story 2 twice, search "the", then clear the box:** the count is back to **0**. The filter removed the row, so its LikeButton and its state went with it. (Keeping the likes means lifting state up into App: a week 11 question.)
2. **Remove `key={m._id}`:** the Console warns "Each child in a list should have a unique key prop." The page still works, but React matches rows by position.
3. **Delete `host: true` and restart Vite:** the terminal says ready, but the browser can't connect. Put it back.
4. **Give Welcome a second prop:** `function Welcome({ name, year })` and `<Welcome name="mflix" year={2026} />`. Numbers go in braces.
5. **View Source (Ctrl+U):** you see an empty `<div id="root">` and a script tag. The rows exist only in the DOM (Elements tab). On a week 9 page, they're in the source.

**Fell behind?** Copy `src/`, `index.html` and `vite.config.js` from this folder over `react/mflix-react`. The packages are the same, so there's no new `npm install`. Week 11 starts from this exact state.
