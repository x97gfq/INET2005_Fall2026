import LikeButton from './LikeButton.jsx'

// One component = one function that returns JSX. Its inputs are "props".
// Week 9's home.ejs had this same table, with <% movies.forEach(...) %> around the <tr>.
export default function MovieTable({ movies }) {
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
        </tr>
      </thead>
      <tbody>
        {movies.map((m) => (
          // key: tells React which row is which when the list changes
          <tr key={m._id}>
            <td>{m.title}</td>
            <td>{m.year}</td>
            <td>{m.genres?.join(', ')}</td>
            <td>{m.imdb?.rating ?? '-'}</td>
            <td><LikeButton /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
