// Router for everything under /api/tasks - used by 02_router_basics.js
//
// A Router is a mini-app: it collects related routes so server.js doesn't become
// one giant file. This file builds the router and exports it; the main app
// require()s it and decides WHERE to mount it.

const express = require('express');

const tasksRouter = express.Router();

// in-memory "database" so this example needs no MongoDB or MySQL
let tasks = [
  { id: 1, title: 'Learn middleware', done: true },
  { id: 2, title: 'Learn routers', done: false },
];
let nextId = 3;

// Paths here are RELATIVE to where the router is mounted.
// '/' below becomes GET /api/tasks because of app.use('/api/tasks', ...) in 02_router_basics.js.
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

module.exports = tasksRouter;
