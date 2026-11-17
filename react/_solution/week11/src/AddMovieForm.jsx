import { useState } from 'react'

// Week 11: the POST path, front half. React form -> POST /api/movies -> Express -> insertOne.
// The same rules as the API's validateMovie(). These checks are for the user (fast, friendly);
// the API's checks are the real ones, because anyone can POST without this form.
function validate(title, year) {
  const errors = {}
  const maxYear = new Date().getFullYear() + 5
  if (!title.trim()) errors.title = 'Title is required.'
  const y = Number(year)
  if (!Number.isInteger(y) || y < 1888 || y > maxYear) {
    errors.year = `Year must be a whole number from 1888 to ${maxYear}.`
  }
  return errors
}

export default function AddMovieForm({ onAdded }) {
  // Controlled inputs: the value lives in state, the input shows it
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [genres, setGenres] = useState('')
  const [errors, setErrors] = useState({}) // { title, year, genres, form }: one message per field
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault() // no page reload: React sends the request itself

    // 1. Validate first. Any problem: show it and send nothing.
    const found = validate(title, year)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    // 2. Send it: the right verb, a JSON body, and a header that says it's JSON
    const movie = {
      title: title.trim(),
      year: Number(year),
      genres: genres.split(',').map((g) => g.trim()).filter(Boolean), // "Comedy, Drama" -> ["Comedy", "Drama"]
    }
    setSaving(true)
    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movie),
      })

      // 3. Handle whatever comes back
      if (res.status === 201) {
        onAdded(await res.json()) // the new movie, with the _id MongoDB gave it
        setTitle('')
        setYear('')
        setGenres('')
      } else if (res.status === 400) {
        const data = await res.json()
        setErrors(data.errors || { form: data.error }) // the server's messages, under the same fields
      } else {
        setErrors({ form: `The server answered ${res.status}. Is the API running?` })
      }
    } catch {
      setErrors({ form: 'Could not reach the server.' }) // fetch() only throws when no answer came at all
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="card card-body mb-4" onSubmit={handleSubmit} noValidate>
      <h2 className="h5">Add a movie</h2>
      {errors.form && <div className="alert alert-danger py-2">{errors.form}</div>}
      <div className="row g-2">
        <div className="col-md-5">
          <input
            className={'form-control' + (errors.title ? ' is-invalid' : '')}
            placeholder="Title"
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="invalid-feedback">{errors.title}</div>
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className={'form-control' + (errors.year ? ' is-invalid' : '')}
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <div className="invalid-feedback">{errors.year}</div>
        </div>
        <div className="col-md-3">
          <input
            className={'form-control' + (errors.genres ? ' is-invalid' : '')}
            placeholder="Genres, comma separated"
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
          />
          <div className="invalid-feedback">{errors.genres}</div>
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Add'}
          </button>
        </div>
      </div>
    </form>
  )
}
