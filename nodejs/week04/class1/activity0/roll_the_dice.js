// Activity 0: Roll the Dice
// Run:  docker compose exec node node week04/class1/activity0/roll_the_dice.js
// Open: http://localhost:3001   (Ctrl+C in the terminal to stop it)
//
// Roll two dice. If they match (doubles), you win!
// The server part already works - you only change the parts marked TODO.
// After every change: Ctrl+C, then up arrow + Enter to run it again.

const http = require('http');

const port = 3001;

// TODO 1: this "die" always rolls a 1, so you win every time. Fix it!
// It should return a random whole number from 1 to 6.
// Hint: Math.random() gives a number from 0 up to (not including) 1.
//       Math.floor() chops off the decimals.
function rollDie() {
  return 1;
}

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

    // TODO 2: if die1 and die2 are the same, the message should be 'Doubles! You win!'
    //         otherwise 'No match. Roll again!'   (use if / else)
    let message = 'TODO';

    // TODO 3: console.log the two dice and the message, so you can see every roll in the terminal

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page(`<p class="display-1">${die1} &nbsp; ${die2}</p><h2>${message}</h2>`));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(page('<p>Nothing here.</p>'));
  }
});

server.listen(port, () => {
  console.log(`Roll the Dice on http://localhost:${port}`);
});

// Finished? Try one of these:
//  - Show real dice faces: const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']; then faces[die1 - 1]
//  - Count rolls and wins (like the score in example 0) and show them on the page
//  - Show a different message when you roll double sixes
