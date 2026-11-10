import LikeButton from './LikeButton.jsx'

// Week 10's table, plus a button per row. The parent decides what the button does.
export default function MovieTable({ movies, onSimilar }) {
  if (movies.length === 0) {
    return <p className="text-muted">No movies match.</p>
  }

  return (
    <table className="table table-striped align-middle">
      <thead>
        <tr>
          <th>Title</th>
          <th>Year</th>
          <th>Genres</th>
          <th>IMDb</th>
          <th>Likes</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {movies.map((m) => (
          <tr key={m._id}>
            <td>{m.title}</td>
            <td>{m.year}</td>
            <td>{m.genres?.join(', ')}</td>
            <td>{m.imdb?.rating ?? '-'}</td>
            <td><LikeButton /></td>
            <td>
              <button className="btn btn-sm btn-outline-primary" onClick={() => onSimilar(m)}>
                More like this
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
