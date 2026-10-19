// Middleware 2: express.Router - splitting routes into their own file
// Run:  docker compose exec node node week07/class1/02_router_basics.js
// Open http://localhost:3001/  and  http://localhost:3001/api/tasks
//
// The week 6 movies API kept its routes in routes/movies.js and mounted them with
// app.use('/api/movies', moviesRouter). This is that idea, small enough to read in
// one screen. A Router is a mini-app: it collects related routes so server.js
// doesn't become one giant file.
//
// Normally the router lives in its own file (routes/tasks.js) and you require() it.
// It's inline here so the whole idea is on one page.

const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

// ---- a router for everything under /api/tasks -------------------------------
const tasksRouter = express.Router();

// in-memory "database" so this example needs no MongoDB or MySQL
let tasks = [
  { id: 1, title: 'Learn middleware', done: true },
  { id: 2, title: 'Learn routers', done: false },
];
let nextId = 3;

// Paths here are RELATIVE to where the router is mounted.
// '/' below becomes GET /api/tasks because of app.use('/api/tasks', ...) at the bottom.
tasksRouter.get('/', (req, res) => {
  res.json(tasks);
});

tasksRouter.get('/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

tasksRouter.post('/', (req, res) => {
  const task = { id: nextId++, title: req.body.title, done: false };
  tasks.push(task);
  res.status(201).json(task);
});

tasksRouter.delete('/:id', (req, res) => {
  tasks = tasks.filter((t) => t.id !== Number(req.params.id));
  res.status(204).end();
});
// -----------------------------------------------------------------------------

// A home page, handled by the main app
app.get('/', (req, res) => {
  res.send('Try /api/tasks (GET), /api/tasks/1, POST /api/tasks, DELETE /api/tasks/2');
});

// Mount the router. Every route it defines now lives under /api/tasks.
app.use('/api/tasks', tasksRouter);

app.listen(PORT, () => {
  console.log(`Router demo on http://localhost:${PORT}`);
});
