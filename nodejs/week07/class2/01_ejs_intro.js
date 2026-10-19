// EJS 1: wiring EJS into Express, and the core tags
// Run:  docker compose exec node node week07/class2/01_ejs_intro.js
// Open http://localhost:3001
//
// EJS (Embedded JavaScript) is server-side templating: you write HTML with little
// islands of JavaScript in it, and the server turns it into finished HTML before
// sending it. It is the Node equivalent of writing <?php ?> inside a .php file.
//
// Three lines wire it in:
//   app.set('view engine', 'ejs')               -> res.render('x') looks for views/x.ejs
//   app.set('views', path.join(__dirname,...))   -> where the .ejs files live
//   res.render('index', { ...data })             -> run views/index.ejs with this data

const path = require('path');
const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Forms post url-encoded data by default; this fills req.body (like express.json for JSON)
app.use(express.urlencoded({ extended: true }));

const quotes = [
  { author: 'Grace Hopper', text: "The most dangerous phrase is 'we've always done it this way.'" },
  { author: 'Phil Karlton', text: 'There are only two hard things in computer science: cache invalidation and naming things.' },
  { author: 'Martin Fowler', text: 'Any fool can write code a computer understands. Good programmers write code humans understand.' },
  { author: 'Linus Torvalds', text: 'Talk is cheap. Show me the code.' },
];

app.get('/', (req, res) => {
  // Everything in this object becomes a variable inside index.ejs
  res.render('index', {
    quotes,
    danger: '<em>Hi!</em> <script>alert(1)</script>', // shows why escaping matters
    result: null,
    lastMessage: '',
  });
});

// The form posts here; we render the SAME page, now with a result to show.
app.post('/echo', (req, res) => {
  const message = (req.body.message || '').trim();
  const result = message
    ? { original: message, length: message.length, shouted: message.toUpperCase() + '!' }
    : null;
  res.render('index', { quotes, danger: '<em>Hi!</em> <script>alert(1)</script>', result, lastMessage: message });
});

app.listen(PORT, () => {
  console.log(`EJS intro on http://localhost:${PORT}`);
});
