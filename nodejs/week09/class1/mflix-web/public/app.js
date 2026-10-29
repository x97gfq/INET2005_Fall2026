// The front end's JavaScript - moved out of index.html in week 7.
// helmet's Content-Security-Policy (server.js) only runs scripts from this server's own
// files ('self'). An inline <script> is exactly what an XSS attack injects, so the CSP
// blocks ALL inline scripts - including ours. Same code as week 6, now in its own file.

const MOVIES_API = '/api/movies';                    // same server that sent this page
const COMMENTS_API = 'http://localhost:3002/api';    // another service: needs CORS

let page = 1;
let totalPages = 1;

// Database text must never become HTML unescaped - same rule as in PHP
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

// GET /api/movies?title=...&genre=...&year=...&page=...
async function loadMovies() {
  const form = new FormData(document.getElementById('search'));
  const params = new URLSearchParams({ page, limit: 15 });
  for (const [key, value] of form) if (value) params.set(key, value);

  const res = await fetch(`${MOVIES_API}?${params}`);
  const data = await res.json();
  if (!res.ok) {
    document.getElementById('movies').innerHTML = `<tr><td colspan="4" class="text-danger">${esc(data.error)}</td></tr>`;
    return;
  }

  totalPages = data.totalPages;
  document.getElementById('movies').innerHTML = data.results.length
    ? data.results.map((m) => `
        <tr data-id="${m._id}">
          <td>${esc(m.title)}</td>
          <td>${esc(m.year)}</td>
          <td class="small">${esc((m.genres || []).join(', '))}</td>
          <td class="text-end">${esc(m.imdb?.rating)}</td>
        </tr>`).join('')
    : '<tr><td colspan="4">No movies found.</td></tr>';

  document.getElementById('pageInfo').textContent =
    `Page ${data.page} of ${data.totalPages || 1} (${data.total} movies)`;
  document.getElementById('prev').disabled = page <= 1;
  document.getElementById('next').disabled = page >= totalPages;
}

// GET /api/movies/:id
async function showMovie(id) {
  const res = await fetch(`${MOVIES_API}/${id}`);
  const m = await res.json();
  document.getElementById('details').innerHTML = `
    <h2 class="h4">${esc(m.title)} <small class="text-muted">${esc(m.year)}</small></h2>
    <p class="small text-muted">${esc(m.rated)} &middot; ${esc(m.runtime)} min &middot; ${esc((m.genres || []).join(', '))}</p>
    <p>${esc(m.plot)}</p>
    <p class="small"><strong>Directed by</strong> ${esc((m.directors || []).join(', '))}<br>
       <strong>Cast</strong> ${esc((m.cast || []).join(', '))}</p>`;
  loadComments(id);
}

// A second microservice. If it's down, the movies still work.
async function loadComments(id) {
  const box = document.getElementById('comments');
  try {
    const res = await fetch(`${COMMENTS_API}/movies/${id}/comments?limit=5`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.results; // before / after the pagination TODO
    box.innerHTML = `<h3 class="h6">Comments</h3>` + (list.length
      ? list.map((c) => `<div class="border-start ps-2 mb-2 small">
          <strong>${esc(c.name)}</strong> <span class="text-muted">${esc(new Date(c.date).toLocaleDateString())}</span><br>${esc(c.text)}</div>`).join('')
      : '<p class="small text-muted">No comments yet.</p>');
  } catch {
    box.innerHTML = `<div class="alert alert-secondary small">
      The comments service (port 3002) isn't running. The movies still work:
      that's the point of separate services.</div>`;
  }
}

document.getElementById('search').addEventListener('submit', (e) => {
  e.preventDefault();
  page = 1;
  loadMovies();
});
document.getElementById('prev').addEventListener('click', () => { page--; loadMovies(); });
document.getElementById('next').addEventListener('click', () => { page++; loadMovies(); });
document.getElementById('movies').addEventListener('click', (e) => {
  const row = e.target.closest('tr[data-id]');
  if (!row) return;
  document.querySelectorAll('#movies tr').forEach((r) => r.classList.remove('table-active'));
  row.classList.add('table-active');
  showMovie(row.dataset.id);
});

loadMovies();
