# React front end

Everything in this folder runs in the `inet-react` container (Node 22 + Vite), which
`docker compose up -d` starts alongside the others. It starts idle; you run `npm` inside it.

| Folder | What |
|---|---|
| `mflix-react/` | **Your** app, scaffolded in week 10 (Friday). Not in git (it's yours, in `.gitignore`). Docker creates it, empty, the first time the container starts |
| `_solution/week10/` | Answer key: end of week 10 (Welcome, MovieTable, LikeButton, search, `fetch('/api/movies')`) |
| `_solution/week11/` | Answer key: end of week 11 (week 10's app + `AddMovieForm`: POST to our own API) |

## The commands

Run these from the **repo root**, where `docker-compose.yml` lives. The container's working
folder is `react/mflix-react`, so every command runs there:

```bash
docker compose exec react npm create vite@9 . -- --template react --no-immediate   # once: scaffold
docker compose exec react npm install                                                # once, and after adding a package
docker compose exec react npm run dev                                                # the dev server: http://localhost:5173
```

The dev server keeps running, like our Node examples. **Ctrl+C** stops it. Unlike them, you
**don't** restart it after a change: save a file and the browser updates by itself.

The app calls `/api/...` on its own address (5173), and Vite passes those requests to
whichever Express server is on port 3001 in the node container. Start that first.

Week 10: week 9 class 1's warm-up (`GET /api/movies`):

```bash
docker compose exec node node week09/class1/_solution/00_warmup/app.js   # terminal 1
docker compose exec react npm run dev                                     # terminal 2
```

Week 11: our own API (`nodejs/week11/api`, GET and POST `/api/movies`):

```bash
docker compose exec node node week11/api/server.js   # terminal 1
docker compose exec react npm run dev                # terminal 2
```

## Run an answer key instead

```powershell
docker compose exec -w /app/_solution/week11 react npm install
docker compose exec -w /app/_solution/week11 react npm run dev
```

(Git Bash rewrites `/app/...` into a Windows path. Use PowerShell, or put `MSYS_NO_PATHCONV=1 ` in
front.) Only one dev server can have port 5173: Ctrl+C yours first.

**Fell behind in class?** Copy an answer key's `src` folder, `index.html` and `vite.config.js` over
your own in VS Code. Same packages, so no new `npm install`.

## Troubleshooting

| Problem | Fix |
|---|---|
| Saving a file doesn't update the page | `vite.config.js` needs `watch: { usePolling: true }`: Windows doesn't tell the container that a file changed |
| http://localhost:5173 can't be reached, but the terminal says ready | `vite.config.js` needs `host: true`, so Vite listens for Docker, not just inside the container |
| The page loads, `/api/...` gives a 500 or 502, or a proxy error in the Vite terminal | The server on 3001 isn't running (week 9's warm-up in week 10, `week11/api/server.js` in week 11), or the `proxy` line is missing from `vite.config.js` |
| `OCI runtime exec failed ... no such file or directory` | You deleted `react/mflix-react`. Recreate it: `docker compose up -d --force-recreate react` |
| `Cannot find native binding` / `Cannot find module @rolldown/binding-...` | `node_modules` was installed on Windows, not in the container. Delete `react/mflix-react/node_modules`, then `docker compose exec react npm install` |
| `npm create` says the folder is not empty | Scaffold only into the empty folder Docker made. To start over, delete `react/mflix-react` and recreate the container (above) |
| On Linux, files created in the container belong to root | Run `sudo chown -R $USER react/` once |
