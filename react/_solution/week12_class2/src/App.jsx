import { useEffect, useState } from 'react'
import AddMovieModal from './AddMovieModal.jsx'
import LoginForm from './LoginForm.jsx'

// Week 12 class 2: week 11's app (search, delete, add), now with a login.
//   Log in  -> POST   /api/login               (LoginForm.jsx: 200 { token, name })
//   Search  -> GET    /api/movies?title=star   (public: no token)
//   Delete  -> DELETE /api/movies/:id          (Authorization: Bearer <token>, or the API answers 401)
//   Add     -> POST   /api/movies              (AddMovieModal.jsx, also with the token)
export default function App() {
  const [movies, setMovies] = useState([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')         // what's typed in the box (changes on every key)
  const [search, setSearch] = useState('')       // what we last searched for (changes on Search)
  const [showAdd, setShowAdd] = useState(false)  // is the Add modal open?
  const [user, setUser] = useState(null)         // { token, name } after a login. null: logged out.
  // In state only (memory): a reload logs you out. That's the safe default; try-it 3 asks about localStorage.

  // Runs after the first render, and again whenever search changes: one GET each time
  useEffect(() => {
    fetch(`/api/movies?title=${encodeURIComponent(search)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`The API answered ${res.status}`)
        return res.json()
      })
      .then((data) => setMovies(data))
      .catch((err) => setError(err.message))
  }, [search])

  function handleSearch(e) {
    e.preventDefault()
    setError('')
    setSearch(query.trim())
  }

  // LoginForm calls this with the API's answer: keep it, and the form disappears
  function handleLogin(login) {
    setUser(login)
    setError('')
  }

  // The Log out button, or the API said 401 (the token expired, or the secret changed)
  function logOut(message = '') {
    setUser(null)
    setShowAdd(false)
    setError(message)
  }

  async function handleDelete(movie) {
    if (!window.confirm(`Delete "${movie.title}"?`)) return
    setError('')
    try {
      const res = await fetch(`/api/movies/${movie._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }, // who's asking: the API checks it first
      })
      if (res.status === 204) {
        setMovies(movies.filter((m) => m._id !== movie._id))
      } else if (res.status === 401) {
        logOut((await res.json()).error) // the API doesn't accept our token any more: log in again
      } else if (res.status === 404 || res.status === 400) {
        setError((await res.json()).error)
      } else {
        setError(`The API answered ${res.status}. Is it running?`)
      }
    } catch {
      setError('Could not reach the server.')
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
        {/* Hiding the buttons is for the user. The API's 401 is what protects the movies. */}
        {user && (
          <div className="d-flex gap-2 align-items-center">
            <span className="text-muted">Hi, {user.name}</span>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add a movie</button>
            <button className="btn btn-outline-secondary" onClick={() => logOut()}>Log out</button>
          </div>
        )}
      </div>

      {!user && <LoginForm onLogin={handleLogin} />}

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
            {user && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(movie)}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {showAdd && (
        <AddMovieModal token={user.token} onClose={() => setShowAdd(false)} onAdded={handleAdded} onLoggedOut={logOut} />
      )}
    </main>
  )
}
