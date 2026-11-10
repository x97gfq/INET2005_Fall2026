// Shows the AI's suggestions. Nothing here knows about keys or providers: it got plain
// text from OUR server. {text} is escaped like EJS's <%= %>, so even if the AI answers
// with <script>, it shows up as text. (Never use dangerouslySetInnerHTML for AI output.)
export default function AiPanel({ movie, text, error, loading, onClose }) {
  return (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <strong>More like {movie.title}</strong>
        <button className="btn-close" aria-label="Close" onClick={onClose}></button>
      </div>
      <div className="card-body">
        {loading && <p className="text-muted mb-0">Asking the AI...</p>}
        {error && <p className="text-danger mb-0">{error}</p>}
        {text && <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{text}</p>}
      </div>
    </div>
  )
}
