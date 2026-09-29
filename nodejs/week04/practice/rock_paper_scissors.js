// Extra practice: Rock Paper Scissors vs. the server
// Run:  docker compose exec node node week04/practice/rock_paper_scissors.js
// Open: http://localhost:3001   (Ctrl+C in the terminal to stop it)
//
// You've seen the finished game in example 0 - now write the game logic yourself.
// The server part already works: run it, and the home page shows three move buttons.
// Your job is the game logic in the /play route. /play doesn't play yet.
// Remember: after every change, Ctrl+C and run it again (up arrow + Enter).
//
// TODO list:
//   1. /play: read the player's move from the URL (?move=rock)
//   2. Reject anything that isn't rock, paper or scissors (status 400)
//   3. Pick a random move for the server
//   4. Work out who won, using the beats object
//   5. Keep score (wins, losses, ties) and show it on every page
//   6. Stretch: show the last 5 rounds, and add a /reset route

const http = require('http');

const port = 3001;

const moves = ['rock', 'paper', 'scissors'];
const icons = { rock: '✊', paper: '✋', scissors: '✌️' };

// Each move beats exactly one other move. beats['rock'] is 'scissors'.
const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

// TODO 5: the score. Where does this variable have to live so it survives between requests?

function page(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rock Paper Scissors</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container py-4 text-center" style="max-width: 36rem">
    <h1>Rock Paper Scissors</h1>
    ${content}
  </div>
</body>
</html>`;
}

// The three move buttons are plain links: /play?move=rock etc.
function moveButtons() {
  return moves
    .map((m) => `<a class="btn btn-outline-dark btn-lg m-1" href="/play?move=${m}">${icons[m]} ${m}</a>`)
    .join('');
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // new URL() splits "/play?move=rock" into a pathname ("/play") and
  // searchParams. Read a value with url.searchParams.get('move').
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page(`<p class="lead">Pick your move:</p>${moveButtons()}`));
  } else if (url.pathname === '/play') {
    // TODO 1: const you = url.searchParams.get('move');
    // TODO 2: if moves doesn't include it (moves.includes(...)), send status 400 and return
    // TODO 3: pick a random index with Math.floor(Math.random() * moves.length)
    // TODO 4: same move = tie; beats[you] === serverMove means you win; otherwise the server wins
    // TODO 5: update the score, then show both moves (icons[you]) and the result in the page below
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page(`<p>TODO: play a round</p>${moveButtons()}`));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(page('<p>Nothing here.</p><a href="/">Back to the game</a>'));
  }
});

server.listen(port, () => {
  console.log(`Rock Paper Scissors on http://localhost:${port}`);
});
