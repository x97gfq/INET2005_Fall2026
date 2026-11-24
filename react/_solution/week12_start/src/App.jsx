import { useEffect, useState } from 'react'

// Week 12 START: where week 11 class 2 stopped (pop quiz #7). Copy this into react/app if you fell behind.
//   Search  -> GET    /api/movies?title=star   (the API searches MongoDB; the app only changes the URL)
//   Delete  -> DELETE /api/movies/:id          (204, then remove it from state with filter)
// Week 12 class 1 adds the Add modal (POST): the answer key is react/_solution/week11_class2.
export default function App() {
  const [movies, setMovies] = useState([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')   // what's typed in the box (changes on every key)
  const [search, setSearch] = useState('') // what we last searched for (changes on Search)

  // ONE effect: after the first render, and again whenever search changes. One GET each time.
  // (Class 1's useEffect(..., []) is gone: with both, the page sends two GETs and the slower answer wins.)
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

  return (
    <main className="container py-4" style={{ maxWidth: 760 }}>
      <h1 className="h2 mb-3">Movies</h1>

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
    </main>
  )
}
