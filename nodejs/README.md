# Node.js + MongoDB examples

Everything in this folder runs inside the `inet-node` container (Node 22), which
`docker compose up -d` starts alongside Apache, MySQL and MongoDB.

| URL | What |
|---|---|
| http://localhost:3000 | Landing page (`server.js`): checks MySQL + MongoDB |
| http://localhost:3001 | Whichever example server is running |
| mongodb://localhost:27017 | MongoDB, for Compass or the VS Code extension (no username/password) |

## How Node runs in Docker

PHP and Node work differently, and that changes how you "view" an example.

- **PHP:** Apache is always running. Drop a `.php` file in `www/` and browse to it; Apache runs
  the file fresh on every request.
- **Node:** there is no Apache. A Node program *is* the server: `node file.js` starts a process
  that keeps running until you stop it. A file with no `.listen()` (a script) just runs, prints to
  the terminal, and exits.

So you can't browse to `week04/class1/01_hello_http.js` the way you would a PHP page. Something
has to *run* it. The `node` service in `docker-compose.yml`:

1. starts from the official `node:22-alpine` image,
2. mounts this `nodejs/` folder at `/app` in the container (edits on Windows appear there immediately),
3. runs `npm install && npm start`, and `npm start` runs `server.js`, a landing page on port 3000,
4. publishes ports 3000 and 3001 to your machine.

`server.js` is the one program the container starts by itself. Every example is a separate
program that you start with `docker compose exec`, and it runs until you stop it.

## Running the examples

Every example is its own program, started from a terminal in the repo folder:

```bash
docker compose exec node node week04/class1/01_hello_http.js
```

That command means "inside the `node` container, run `node` on this file". What happens next
depends on the file:

- **A server** (anything that calls `.listen()`: 01-06, example 0, Activities 0 and 1,
  `04_express_mongo.js`) keeps running. Open http://localhost:3001, watch the terminal for its
  `console.log` output, and press **Ctrl+C** to stop it. Only one can use port 3001 at a time.
- **A script** (00, 07-09, the `class2` Mongo scripts 01-03) runs, prints its output, and exits by itself.

The full list of commands for week 4 is in the [week 4 cheat sheet](week04/README.md#cheat-sheet).

### Without Docker

If Node is installed on your machine:

```bash
cd nodejs
npm install
node week04/class1/01_hello_http.js
```

`config.js` falls back to `localhost:13306` (MySQL) and `localhost:27017` (MongoDB), the ports
Docker publishes, so the database examples still work as long as the containers are up.

## Do I need to restart after a change?

A running server has already read its code, so it keeps using the old version until you stop it.

| You changed... | What to do |
|---|---|
| A server that is running (01-06, example 0, an activity...) | **Ctrl+C**, then run the same command again (up arrow + Enter) |
| A script (00, 07-09) or a data file | Nothing. Run it again. |
| `server.js` or `config.js` | `docker compose restart node` |
| `package.json` (added a package) | `docker compose restart node` (it runs `npm install` on start) |
| `docker-compose.yml` | `docker compose up -d` |

Why not auto-reload with `node --watch`? It relies on file-change notifications, and on Windows
those don't reach the container through the bind mount. The new file contents do; only the
notification is lost. We tested it: `--watch` never restarts.

## Weeks

| Folder | Contents |
|---|---|
| [`week04/`](week04/README.md) | Node.js and MongoDB: examples, Activities 0-2, extra practice, answer keys, and a **cheat sheet of every run command** in slide order |
| `week05/` | `mysql_example.js`: the Rolodex page (`www/index.php`) rewritten in Node + Express, for Assignment 2 |

Each activity's answer key is in a `_solution` folder next to it.

The MongoDB sample data (`inet.sales`) is loaded from `mongo-init/sales.json` the first time the
mongo container starts.

## Troubleshooting

- **`EADDRINUSE: address already in use :::3001`**: another example is still running. Press
  Ctrl+C in the terminal that started it (or, if you lost that terminal, `docker compose restart node`).
- **Browser says "can't be reached" on 3001**: no example is running. Start one first.
- **Docker Desktop shows the node container as port 3001 (or `3000-3001`)**: it merges the two
  ports into one range and links only one of them. The landing page is always
  http://localhost:3000; 3001 only answers while an example is running.
- **Landing page shows a MongoDB/MySQL error**: the database container is still starting. Wait a
  few seconds and refresh.
- **`inet.sales` is empty or missing**: the seed script only runs on a brand-new volume.
  `docker compose down -v` then `docker compose up -d` (this also resets MySQL).
- **http://localhost:3000 doesn't load right after `up`**: the first start runs `npm install`.
  Watch it with `docker compose logs -f node`.
