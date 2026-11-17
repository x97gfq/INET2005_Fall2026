# Week 11 class 2: answer key

Class 1's app (`../week11_app`) plus:

- a search form: `GET /api/movies?title=...`
- a Delete button on each movie: `DELETE /api/movies/:id` (the route is in `nodejs/week11/_solution/api`)
- `AddMovieModal.jsx`, a Bootstrap modal for `POST /api/movies` (given to students, not typed)
- Bootstrap's CSS from a CDN in `index.html`; `main.jsx` no longer imports the template's `index.css`

Run it (the API must be running on 3001):

```bash
docker compose exec -w /app/_solution/week11_class2 react npm install
docker compose exec -w /app/_solution/week11_class2 react npm run dev
```
