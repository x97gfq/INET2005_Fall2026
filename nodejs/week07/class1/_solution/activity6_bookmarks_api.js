// Activity 6 ANSWER KEY: Bookmarks API
// Run:  docker compose exec node node week07/class1/_solution/activity6_bookmarks_api.js

const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

let bookmarks = [
  { id: 1, title: 'Express docs', url: 'https://expressjs.com', tags: ['node'] },
];
let nextId = 2;

// TODO 1
function validateBookmark(req, res, next) {
  const { title, url } = req.body || {};
  const errors = [];
  if (typeof title !== 'string' || title.trim() === '') errors.push('title is required');
  if (typeof url !== 'string' || !url.startsWith('http')) errors.push('url must start with http');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
}

const router = express.Router();

router.get('/', (req, res) => {
  res.json(bookmarks);
});

// TODO 2
router.get('/:id', (req, res) => {
  const bookmark = bookmarks.find((b) => b.id === Number(req.params.id));
  if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
  res.json(bookmark);
});

// TODO 3
router.post('/', validateBookmark, (req, res) => {
  const { title, url, tags } = req.body;
  const bookmark = { id: nextId++, title: title.trim(), url, tags: tags || [] };
  bookmarks.push(bookmark);
  res.status(201).json(bookmark);
});

// TODO 4
router.delete('/:id', (req, res) => {
  bookmarks = bookmarks.filter((b) => b.id !== Number(req.params.id));
  res.status(204).end();
});

app.use('/api/bookmarks', router);

// TODO 5
app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// TODO 6
app.use((err, req, res, next) => {
  console.error('Caught by error handler:', err.message);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Bookmarks API (solution) on http://localhost:${PORT}`);
});
