import { useEffect, useState } from 'react'
import NavBar from './NavBar.jsx'
import Welcome from './Welcome.jsx'
import MovieTable from './MovieTable.jsx'
import { sampleMovies } from './sampleMovies.js'

// End of week 10: a first component, props, hard-coded movies with a like button each,
// a live search box, and one real request to our server.
function App() {
  // State: values React remembers between renders. Change one and the page redraws itself.
  const [search, setSearch] = useState('')
  const [username, setUsername] = useState(null)

  // Once, after the first render (the empty [] at the end): ask our server who we are.
  // '/api/session' is on THIS origin (5173). Vite's proxy passes it to mflix-bff on 3001.
  useEffect(() => {
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => setUsername(data.username))
  }, [])

  // Worked out fresh on every render, from the state. No need to store it.
  const shown = sampleMovies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <NavBar username={username} />
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
    </>
  )
}

export default App
