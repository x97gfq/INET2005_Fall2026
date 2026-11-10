import { useEffect, useState } from 'react'
import { api } from './api.js'
import MovieTable from './MovieTable.jsx'
import AiPanel from './AiPanel.jsx'

// The real movies, from /api/movies (mflix-bff -> mflix-api, with the JWT from the session).
export default function MovieList({ onExpired }) {
  const [search, setSearch] = useState('') // what's in the box
  const [query, setQuery] = useState('')   // what we last searched for
  const [data, setData] = useState(null)   // the API's { total, results, ... }
  const [error, setError] = useState(null)
  const [ai, setAi] = useState(null)       // { movie, text, error, loading }

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

  // A click is an event, not an effect: one click, one AI call (it costs money).
  async function askSimilar(movie) {
    setAi({ movie, loading: true })
    try {
      const result = await api(`/movies/${movie._id}/similar`, { method: 'POST' })
      setAi({ movie, text: result.text })
    } catch (err) {
      if (err.status === 401) return onExpired()
      setAi({ movie, error: err.message })
    }
  }

  return (
    <>
      <h1 className="mb-3">Movies</h1>
      <form className="d-flex gap-2 mb-3" onSubmit={handleSearch}>
        <input className="form-control" placeholder="Search titles" value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-primary">Search</button>
      </form>

      {ai && <AiPanel {...ai} onClose={() => setAi(null)} />}
      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <p className="text-muted">Loading...</p>}
      {data && (
        <>
          <p className="text-muted">{data.total} movies{query && ` matching "${query}"`}. Showing the first {data.results.length}.</p>
          <MovieTable movies={data.results} onSimilar={askSimilar} />
        </>
      )}
    </>
  )
}
