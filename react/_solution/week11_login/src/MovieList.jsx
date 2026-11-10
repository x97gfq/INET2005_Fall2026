import { useEffect, useState } from 'react'
import { api } from './api.js'
import MovieTable from './MovieTable.jsx'

// The real movies, from /api/movies (mflix-bff -> mflix-api, with the JWT from the session).
export default function MovieList({ onExpired }) {
  const [search, setSearch] = useState('') // what's in the box
  const [query, setQuery] = useState('')   // what we last searched for
  const [data, setData] = useState(null)   // the API's { total, results, ... }
  const [error, setError] = useState(null)

  // Runs after the first render, and again whenever query changes. Not on every keystroke:
  // query only changes when the form is submitted.
  useEffect(() => {
    setData(null) // "Loading..." instead of the last search's rows
    setError(null)
    api('/movies?' + new URLSearchParams({ title: query }))
      .then(setData)
      .catch((err) => (err.status === 401 ? onExpired() : setError(err.message)))
  }, [query])

  function handleSearch(e) {
    e.preventDefault()
    setQuery(search.trim())
  }

  return (
    <>
      <h1 className="mb-3">Movies</h1>
      <form className="d-flex gap-2 mb-3" onSubmit={handleSearch}>
        <input className="form-control" placeholder="Search titles" value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-primary">Search</button>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <p className="text-muted">Loading...</p>}
      {data && (
        <>
          <p className="text-muted">{data.total} movies{query && ` matching "${query}"`}. Showing the first {data.results.length}.</p>
          <MovieTable movies={data.results} />
        </>
      )}
    </>
  )
}
