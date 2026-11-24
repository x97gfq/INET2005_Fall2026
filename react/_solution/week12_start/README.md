# Week 12: the starting point

Where week 11 class 2 stopped: class 1's app (`../week11_app`) plus

- Bootstrap's CSS from a CDN in `index.html`; `main.jsx` no longer imports the template's `index.css`
- a search form: `GET /api/movies?title=...`
- a Delete button on each movie: `DELETE /api/movies/:id`

No Add modal yet: that's week 12 class 1 (answer key `../week11_class2`).

Fell behind? Copy this into your own app, from the repo root (PowerShell):

```powershell
Copy-Item react\_solution\week12_start\index.html react\app\
Copy-Item react\_solution\week12_start\src\App.jsx, react\_solution\week12_start\src\main.jsx react\app\src\
```

Or run it as it is (the API must be running on 3001; stop your own dev server first, since only 5173 is forwarded):

```bash
docker compose exec -w /app/_solution/week12_start react npm install
docker compose exec -w /app/_solution/week12_start react npm run dev
```
