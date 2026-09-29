// Solution for week04/practice/rock_paper_scissors.js
// Run:  docker compose exec node node week04/practice/_solution/rock_paper_scissors.js
// Open: http://localhost:3001   (Ctrl+C in the terminal to stop it)

const http = require('http');

const port = 3001;

const moves = ['rock', 'paper', 'scissors'];
const icons = { rock: '✊', paper: '✋', scissors: '✌️' };

// Each move beats exactly one other move: rock beats scissors, and so on
const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

// The game state lives in the server's memory, outside createServer, so it
// survives between requests. Restart the server and it's all gone.
let score = { wins: 0, losses: 0, ties: 0 };
let history = []; // the most recent rounds, newest first

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

function scoreboard() {
  const rows = history
    .map((h) => `<li class="list-group-item">${icons[h.you]} vs ${icons[h.server]}: ${h.result}</li>`)
    .join('');
  return `
    <p class="fs-5 mt-4">
      <span class="text-success">Wins ${score.wins}</span> &middot;
      <span class="text-danger">Losses ${score.losses}</span> &middot;
      <span class="text-muted">Ties ${score.ties}</span>
    </p>
    <ul class="list-group mb-3">${rows}</ul>
    <a href="/reset" class="btn btn-sm btn-link">Reset the score</a>`;
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // new URL() splits "/play?move=rock" into a pathname ("/play") and
  // searchParams (move = "rock"). It needs a base, but the base doesn't matter.
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page(`<p class="lead">Pick your move:</p>${moveButtons()}${scoreboard()}`));
  } else if (url.pathname === '/play') {
    const you = url.searchParams.get('move');

    // Never trust what arrives in a URL: anyone can type /play?move=banana
    if (!moves.includes(you)) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(page(`<p class="text-danger">"${String(you).replace(/</g, '&lt;')}" isn't a move.</p><a href="/">Back</a>`));
      return;
    }

    const serverMove = moves[Math.floor(Math.random() * moves.length)];

    let result;
    if (you === serverMove) {
      result = 'Tie';
      score.ties++;
    } else if (beats[you] === serverMove) {
      result = 'You win!';
      score.wins++;
    } else {
      result = 'Server wins';
      score.losses++;
    }

    // Keep the last 5 rounds: add to the front, then cut the array down
    history.unshift({ you, server: serverMove, result });
    history = history.slice(0, 5);

    console.log(`  you: ${you}, server: ${serverMove} -> ${result}`);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page(`
      <p class="display-1">${icons[you]} vs ${icons[serverMove]}</p>
      <h2>${result}</h2>
      <p class="lead mt-4">Play again:</p>
      ${moveButtons()}
      ${scoreboard()}`));
  } else if (url.pathname === '/reset') {
    score = { wins: 0, losses: 0, ties: 0 };
    history = [];
    // 302 redirect: tell the browser to go to / instead
    res.writeHead(302, { Location: '/' });
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(page('<p>Nothing here.</p><a href="/">Back to the game</a>'));
  }
});

server.listen(port, () => {
  console.log(`Rock Paper Scissors on http://localhost:${port}`);
});

// Stretch ideas:
//  - A cheating server: 1 time in 4, pick whatever beats the player's move (use the beats object backwards)
//  - A "smart" server: count the player's moves and throw whatever beats their favourite
//  - Win percentage on the scoreboard
