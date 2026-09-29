// ANSWER KEY - Activity 0: Roll the Dice (TODOs 1-3, plus all three "Finished?" extras)
// Run:  docker compose exec node node week04/class1/_solution/activity0_roll_the_dice.js
// Open: http://localhost:3001   (Ctrl+C in the terminal to stop it)

const http = require('http');

const port = 3001;

// TODO 1: Math.random() * 6 gives 0 to 5.999..., Math.floor makes it 0-5, + 1 makes it 1-6
function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

// Extra: dice faces. The array starts at index 0, so a roll of 1 is faces[0]
const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// Extra: counters live outside createServer so they survive between requests
let rolls = 0;
let wins = 0;

function page(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Roll the Dice</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container py-4 text-center">
    <h1>Roll the Dice</h1>
    ${content}
    <a class="btn btn-dark btn-lg mt-3" href="/roll">Roll!</a>
    <p class="text-muted mt-3">${wins} win${wins === 1 ? '' : 's'} in ${rolls} roll${rolls === 1 ? '' : 's'}</p>
  </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page('<p class="lead">Roll doubles to win.</p>'));
  } else if (req.url === '/roll') {
    const die1 = rollDie();
    const die2 = rollDie();
    rolls++;

    // TODO 2 (plus the double-sixes extra, checked first because it's also doubles)
    let message;
    if (die1 === 6 && die2 === 6) {
      message = 'Double sixes! Jackpot!';
      wins++;
    } else if (die1 === die2) {
      message = 'Doubles! You win!';
      wins++;
    } else {
      message = 'No match. Roll again!';
    }

    // TODO 3
    console.log(`Rolled ${die1} and ${die2}: ${message}`);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page(`<p class="display-1">${faces[die1 - 1]} &nbsp; ${faces[die2 - 1]}</p><h2>${message}</h2>`));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(page('<p>Nothing here.</p>'));
  }
});

server.listen(port, () => {
  console.log(`Roll the Dice on http://localhost:${port}`);
});
