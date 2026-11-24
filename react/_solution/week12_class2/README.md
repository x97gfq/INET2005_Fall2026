# Week 12 class 2: answer key

Week 11's app (`../week11_class2`: search, Delete, the Add modal) plus a login:

- `src/LoginForm.jsx`: `POST /api/login`, then `onLogin({ token, name })`
- `src/App.jsx`: `user` in state (`{ token, name }`, or `null`), `Authorization: Bearer <token>` on DELETE,
  a 401 logs you out, the Add and Delete buttons only show when you're logged in, and a Log out button
- `src/AddMovieModal.jsx`: three changes marked `WEEK 12`: a `token` prop, the header, and a 401 branch

The API is `nodejs/week12/_solution/class2` (login + `requireAuth`). Run both (stop your own servers first):

```bash
docker compose exec node node week12/_solution/class2/server.js
docker compose exec -w /app/_solution/week12_class2 react npm install
docker compose exec -w /app/_solution/week12_class2 react npm run dev
```

Log in as the user you added with `node week12/api/add-user.js`.
