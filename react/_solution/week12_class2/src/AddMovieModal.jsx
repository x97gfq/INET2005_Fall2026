import { useState } from 'react'

// Week 11's given modal, plus week 12 class 2's three changes (marked WEEK 12): POST /api/movies with the token.
// A Bootstrap modal with the "add a movie" form. Bootstrap's CSS only: App renders it while showAdd is true.
//
// Props:
//   token                - WEEK 12: the login token, sent as Authorization: Bearer <token>
//   onClose()            - Cancel, the X, or a click on the dark backdrop
//   onAdded(movie)       - the API answered 201: here is the saved movie, with its _id
//   onLoggedOut(message) - WEEK 12: the API answered 401: App logs out and shows why

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

export default function AddMovieModal({ token, onClose, onAdded, onLoggedOut }) {
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // WEEK 12: without it, requireAuth answers 401
        },
        body: JSON.stringify(movie),
      })

      // 3. Handle whatever comes back
      if (res.status === 201) {
        onAdded(await res.json()) // the new movie, with the _id MongoDB gave it. App closes the modal.
        return
      } else if (res.status === 401) {
        onLoggedOut((await res.json()).error) // WEEK 12: the token expired, or the secret changed
        return
      } else if (res.status === 400) {
        const data = await res.json()
        setErrors(data.errors || { form: data.error }) // the server's messages, under the same fields
      } else {
        setErrors({ form: `The server answered ${res.status}. Is the API running?` })
      }
    } catch {
      setErrors({ form: 'Could not reach the server.' }) // fetch() only throws when no answer came at all
    }
    setSaving(false)
  }

  return (
    <>
      {/* .modal is display:none until Bootstrap's JS shows it. d-block shows it: React already decided. */}
      <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="add-title" onClick={onClose}>
        {/* A click inside the box must not reach the backdrop's onClick */}
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <form className="modal-content" onSubmit={handleSubmit} noValidate>
            <div className="modal-header">
              <h2 className="modal-title fs-5" id="add-title">Add a movie</h2>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {errors.form && <div className="alert alert-danger py-2">{errors.form}</div>}

              <div className="mb-3">
                <label className="form-label" htmlFor="add-movie-title">Title</label>
                <input
                  id="add-movie-title"
                  className={'form-control' + (errors.title ? ' is-invalid' : '')}
                  maxLength={200}
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="invalid-feedback">{errors.title}</div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="add-movie-year">Year</label>
                <input
                  id="add-movie-year"
                  type="number"
                  className={'form-control' + (errors.year ? ' is-invalid' : '')}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
                <div className="invalid-feedback">{errors.year}</div>
              </div>

              <div>
                <label className="form-label" htmlFor="add-movie-genres">Genres</label>
                <input
                  id="add-movie-genres"
                  className={'form-control' + (errors.genres ? ' is-invalid' : '')}
                  placeholder="Comedy, Drama"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                />
                <div className="form-text">Comma separated, up to 5. Only the API checks this one.</div>
                <div className="invalid-feedback">{errors.genres}</div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
      {/* The dark layer behind the modal */}
      <div className="modal-backdrop show" />
    </>
  )
}
