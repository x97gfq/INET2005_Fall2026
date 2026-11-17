import { useEffect, useState } from 'react'

// The APP half: ask the API for movies, then show them.
// The same pattern as fetch() + innerHTML last year, and PHP / EJS pages this year:
// get the data, build the page from it. Here the browser builds it, from JSX.
export default function App() {
  const [movies, setMovies] = useState([]) // empty until the API answers
  const [error, setError] = useState('')

  // Runs once, after the first render: one GET to the API (through Vite's /api proxy)
  useEffect(() => {
    fetch('/api/movies')
      .then((res) => {
        if (!res.ok) throw new Error(`The API answered ${res.status}`) // fetch() doesn't throw on a 502
        return res.json()
      })
      .then((data) => setMovies(data)) // new state: React renders again, with the list
      .catch((err) => setError(err.message))
  }, [])

  return (
    <main>
      <h1>Movies</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <ul>
        {movies.map((movie) => (
          <li key={movie._id}>{movie.title} ({movie.year})</li>
        ))}
      </ul>
    </main>
  )
}
