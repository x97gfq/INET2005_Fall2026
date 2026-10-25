// EJS 1: Hello, EJS - the smallest Express + EJS app. We write this one together.
// Run:  docker compose exec node node week08/class1/01_hello/app.js
// Open http://localhost:3001   and   http://localhost:3001/hello/Sam
//
// Two files, that's all:
//   app.js            the server (this file)
//   views/hello.ejs   the template: an HTML page with a hole in it for the name
//
// Three steps:
//   1. app.set('view engine', 'ejs')   res.render('hello') now means "run views/hello.ejs"
//   2. res.render('hello', { name })   every key in the object becomes a variable in the template
//   3. <%= name %> in hello.ejs        print that variable into the HTML
//
// EJS runs HERE, on the server. The browser only ever sees the finished HTML -
// View Page Source and there is no <%= %> left.

const path = require('path');
const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set('view engine', 'ejs');
// Where the .ejs files are. Without this line Express looks in ./views of the folder you
// RAN node from (/app in Docker) - not the folder this file is in.
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('hello', { name: 'INET2005' }); // instead of res.send() or res.json()
});

// The same template, a different value: /hello/Sam -> "Hello, Sam!"
app.get('/hello/:name', (req, res) => {
  res.render('hello', { name: req.params.name });
});

app.listen(PORT, () => {
  console.log(`Hello EJS on http://localhost:${PORT}`);
});
