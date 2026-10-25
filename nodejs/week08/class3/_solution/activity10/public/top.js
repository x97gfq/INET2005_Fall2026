// LEVEL 4: build the Top rated table in the browser from /api/top.
// textContent, never innerHTML with data: it's the browser's version of EJS's <%= %>.
async function loadTop() {
  const rows = document.getElementById('rows');
  const res = await fetch('/api/top');
  const movies = await res.json();

  rows.replaceChildren(); // remove "Loading..."
  movies.forEach((m, i) => {
    const tr = document.createElement('tr');
    const link = document.createElement('a');
    link.href = `/movies/${m._id}`;
    link.textContent = m.title;

    const cells = [String(i + 1), link, String(m.year), (m.genres || []).join(', '), String(m.imdb.rating)];
    cells.forEach((value) => {
      const td = document.createElement('td');
      if (typeof value === 'string') td.textContent = value;
      else td.appendChild(value);
      tr.appendChild(td);
    });
    rows.appendChild(tr);
  });
}

loadTop().catch((err) => {
  document.getElementById('rows').textContent = 'Could not load the movies: ' + err.message;
});
