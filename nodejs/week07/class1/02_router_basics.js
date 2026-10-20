// Middleware 2: express.Router - splitting routes into their own file
// Run:  docker compose exec node node week07/class1/02_router_basics.js
// Open http://localhost:3001/  and  http://localhost:3001/api/tasks
//
// The week 6 movies API kept its routes in routes/movies.js and mounted them with
// app.use('/api/movies', moviesRouter). This is that idea, small enough to read in
// one screen. A Router is a mini-app: it collects related routes so server.js
// doesn't become one giant file.
//
// The router lives in its own file (taskRouter.js, right next to this one) and we
// require() it. In a bigger project it would usually go in a routes/ folder.

const express = require('express');
const tasksRouter = require('./taskRouter');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

// A home page, handled by the main app
app.get('/', (req, res) => {
  res.send('Try /api/tasks (GET), /api/tasks/1, POST /api/tasks, DELETE /api/tasks/2');
});

// Mount the router. Every route it defines now lives under /api/tasks.
app.use('/api/tasks', tasksRouter);

app.listen(PORT, () => {
  console.log(`Router demo on http://localhost:${PORT}`);
});
