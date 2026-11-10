# Week 11 (in progress)

Draft plan: the React app from week 10 **logs in** through mflix-bff (register, log in, log out, the real movies),
**CSRF** (why mflix-bff insists on the `X-Requested-With` header), a **More like this** button (an AI call from
our server, with the key in `.env`), and **Socket.IO**. React answer keys: `react/_solution/week11_login` and
`react/_solution/week11_ai`.

More to come before the week starts. Already here:

| What | Command |
|---|---|
| CSRF demo, the victim (port 3001) | `docker compose exec node node week11/class1/01_csrf/app.js` |
| CSRF demo, the attacker (port 3002) | `docker compose exec node node week11/class1/01_csrf/evil.js` |
| CSRF demo, the fix (answer key) | `docker compose exec node node week11/class1/_solution/01_csrf/app.js` |

Log in at http://localhost:3001 as **alice / password123**, then open http://localhost:3002 in the same
browser, and then http://127.0.0.1:3002. The AI route is the TODO in `week10/mflix-bff/server.js`
(answer key: `week10/_solution/mflix-bff/server.js`); the React button is in `react/_solution/week11_ai`.
