// The page's script: stubbed out. It runs in the BROWSER, so it never sees your key or the answers.
// The class 1 slide "The Page: Validate, Then fetch()" has a sketch of the submit handler.

const startBtn = document.getElementById('start');
const game = document.getElementById('game');
const questionEl = document.getElementById('question');
const form = document.getElementById('answer-form');
const input = document.getElementById('answer');
const message = document.getElementById('message');
const scoreEl = document.getElementById('score');

let currentId = null; // the id GET /question sent: POST /answer sends it back

async function nextQuestion() {
  // TODO: fetch('/question'), check res.ok, then show data.question and keep data.id in currentId
  game.hidden = false;
  questionEl.textContent = '(GET /question is not built yet)';
}

startBtn.addEventListener('click', nextQuestion);

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // no page reload
  // TODO 1: validate: trim the input; empty? show a message and stop (don't send it)
  // TODO 2: POST /answer with JSON { id: currentId, answer }
  // TODO 3: show Correct! or the right answer, and the score the server sent back
  // TODO 4: next question (a button, or after a short pause)
  message.textContent = '(POST /answer is not built yet)';
});

