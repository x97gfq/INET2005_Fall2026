import { useEffect, useState } from 'react'
import Welcome from './Welcome.jsx'
import MovieTable from './MovieTable.jsx'

// End of week 10: a first component, props, a like button on each row, a live search box,
// and one real request: the movies come from week 9's warm-up server instead of sampleMovies.js.
function App() {
  // State: values React remembers between renders. Change one and the page redraws itself.
  const [search, setSearch] = useState('')
  const [movies, setMovies] = useState(null) // null = not here yet

  // Once, after the first render (the empty [] at the end): ask our server for the movies.
  // '/api/movies' is on THIS origin (5173). Vite's proxy passes it to Express on 3001:
  // week 9 class 1's warm-up, the one we typed from a blank file.
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
