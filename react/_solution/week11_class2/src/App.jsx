import { useEffect, useState } from 'react'
import AddMovieModal from './AddMovieModal.jsx'

// Week 11 class 2: class 1's list, plus the rest of the CRUD the API offers.
//   Search  -> GET    /api/movies?title=star   (the API searches MongoDB; the app only changes the URL)
//   Delete  -> DELETE /api/movies/:id          (204, then remove it from state with filter)
//   Add     -> POST   /api/movies              (AddMovieModal.jsx: given, not typed)
export default function App() {
  const [movies, setMovies] = useState([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')         // what's typed in the box (changes on every key)
  const [search, setSearch] = useState('')       // what we last searched for (changes on Search)
  const [showAdd, setShowAdd] = useState(false)  // is the Add modal open?

  // Runs after the first render, and again whenever search changes: one GET each time
  useEffect(() => {
    // encodeURIComponent: a space, & or # in the search can't break the URL. Empty means "no filter".
    fetch(`/api/movies?title=${encodeURIComponent(search)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`The API answered ${res.status}`) // fetch() doesn't throw on a 502
        return res.json()
      })
      .then((data) => setMovies(data))
      .catch((err) => setError(err.message))
  }, [search])

  // The search form: no page reload, then a new search value makes the effect run again
  function handleSearch(e) {
    e.preventDefault()
    setError('')
    setSearch(query.trim())
  }

  async function handleDelete(movie) {
    if (!window.confirm(`Delete "${movie.title}"?`)) return // it really leaves MongoDB
    setError('')
    try {
      const res = await fetch(`/api/movies/${movie._id}`, { method: 'DELETE' })
      if (res.status === 204) {
        // Deleted. 204 has no body, so no res.json(). A NEW array without that movie:
        setMovies(movies.filter((m) => m._id !== movie._id))
      } else if (res.status === 404 || res.status === 400) {
        setError((await res.json()).error) // e.g. "No movie with that id." (someone deleted it already)
      } else {
        setError(`The API answered ${res.status}. Is it running?`)
      }
    } catch {
      setError('Could not reach the server.') // no answer at all
    }
  }

  // AddMovieModal calls this with the movie the API saved (201): put it on top, close the modal
  function handleAdded(movie) {
    setMovies([movie, ...movies])
    setShowAdd(false)
  }

  return (
    <main className="container py-4" style={{ maxWidth: 760 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h2 m-0">Movies</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add a movie</button>
      </div>

      <form className="d-flex gap-2 mb-3" onSubmit={handleSearch} role="search">
        <input
          className="form-control"
          type="search"
          placeholder="Search titles, e.g. star"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-outline-secondary">Search</button>
      </form>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {search && <p className="text-muted">Titles containing "{search}": {movies.length} shown (20 at most)</p>}

      <ul className="list-group">
        {movies.map((movie) => (
          <li key={movie._id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{movie.title} ({movie.year})</span>
            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(movie)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Rendered only while open: closing it unmounts it, which also clears the form */}
      {showAdd && <AddMovieModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
    </main>
  )
}
