// Example 0: Rock Paper Scissors vs. the server
// Run:  docker compose exec node node week04/class1/example0_rock_paper_scissors.js
// Open: http://localhost:3001   (Ctrl+C in the terminal to stop it)
//
// Nothing to write here: run it, play a few rounds, and watch the terminal.
// Every console.log below prints a numbered step, so you can follow the code
// line by line as each request comes in.

const http = require('http');

const port = 3001;

const moves = ['rock', 'paper', 'scissors'];
const icons = { rock: '✊', paper: '✋', scissors: '✌️' };

// Each move beats exactly one other move: beats['rock'] is 'scissors'
const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

// The score lives OUTSIDE createServer, so it survives between requests.
// Stop the server (Ctrl+C), start it again, and watch it go back to 0.
let score = { wins: 0, losses: 0, ties: 0 };

console.log('[start] the code at the top of the file runs once, when the server starts');

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
    <p class="fs-5 mt-4">
      <span class="text-success">Wins ${score.wins}</span> &middot;
      <span class="text-danger">Losses ${score.losses}</span> &middot;
      <span class="text-muted">Ties ${score.ties}</span>
    </p>
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

// This arrow function runs once for EVERY request
const server = http.createServer((req, res) => {
  console.log('\n[1] request arrived:', req.method, req.url);

  // Split "/play?move=rock" into the path ("/play") and the ?key=value part
  const url = new URL(req.url, 'http://localhost');
  console.log('[2] path is', url.pathname);

  if (url.pathname === '/') {
    console.log('[3] home page: sending the move buttons');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page(`<p class="lead">Pick your move:</p>${moveButtons()}`));
  } else if (url.pathname === '/play') {
    const you = url.searchParams.get('move');
    console.log('[3] you picked', you);

    // Anyone can type /play?move=banana in the address bar, so check it
    if (!moves.includes(you)) {
      console.log('[4] not a real move - sending status 400');
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(page('<p class="text-danger">That isn\'t a move.</p><a href="/">Back</a>'));
      return;
    }

    const serverMove = moves[Math.floor(Math.random() * moves.length)];
    console.log('[4] server picked', serverMove);

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
    console.log('[5] result:', result);
    console.log('[6] score is now', score);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page(`
      <p class="display-1">${icons[you]} vs ${icons[serverMove]}</p>
      <h2>${result}</h2>
      <p class="lead mt-4">Play again:</p>
      ${moveButtons()}`));
    console.log('[7] page sent');
  } else {
    // The browser asks for /favicon.ico by itself - this is where it ends up
    console.log('[3] no page here - sending 404');
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(page('<p>Nothing here.</p><a href="/">Back to the game</a>'));
  }
});

server.listen(port, () => {
  console.log(`[start] listening - open http://localhost:${port}`);
});
