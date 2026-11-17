import { useEffect, useState } from 'react'
import Welcome from './Welcome.jsx'
import MovieTable from './MovieTable.jsx'
import AddMovieForm from './AddMovieForm.jsx'

// Week 11: week 10's app, now one half of a MERN app. The movies come from OUR API
// (nodejs/week11/api, on 3001), and AddMovieForm POSTs new ones to it.
function App() {
  // State: values React remembers between renders. Change one and the page redraws itself.
  const [search, setSearch] = useState('')
  const [movies, setMovies] = useState(null) // null = not here yet

  // Once, after the first render (the empty [] at the end): ask our server for the movies.
  // '/api/movies' is on THIS origin (5173). Vite's proxy passes it to Express on 3001:
  // week 11's API (GET /api/movies: the 20 newest).
  useEffect(() => {
    fetch('/api/movies')
      .then((res) => res.json())
      .then((data) => setMovies(data))
  }, [])

  // Hooks first, then any early return (the rules of hooks).
  if (movies === null) {
    return <p className="container my-4 text-muted">Loading...</p>
  }

  // Worked out fresh on every render, from the state. No need to store it.
  const shown = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container my-4">
      <h1 className="mb-3">Movies</h1>
      <Welcome name="mflix" />
      {/* A new movie goes on top of the list: a NEW array, so React sees the change */}
      <AddMovieForm onAdded={(movie) => setMovies([movie, ...movies])} />
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
