// Assignment 4, getting started: ONE Chat Completions call from Node, printed in the terminal.
// Before you build GET /question, prove your key, base URL and model work. That's all this does.
//
// 1. Copy the template and put in your provider's three values (the assignment lists free ones):
//      docker compose exec node cp week10/class1/00_trivia_start/.env.example week10/class1/00_trivia_start/.env
// 2. Run it (it's a script: it prints and exits):
//      docker compose exec node node week10/class1/00_trivia_start/ask.js
//
// Same shape as week 9's weather demo (01_weather.js): fetch(), a timeout, check res.ok.
// The differences: it's a POST with a JSON body, and the key goes in the Authorization header.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const { AI_BASE_URL, AI_API_KEY, AI_MODEL } = process.env;
if (!AI_BASE_URL || !AI_API_KEY || !AI_MODEL) {
  console.error('Copy .env.example to .env (same folder) and fill in AI_BASE_URL, AI_API_KEY and AI_MODEL.');
  process.exit(1);
}

async function main() {
  const url = `${AI_BASE_URL.replace(/\/+$/, '')}/chat/completions`; // no double slash
  console.log(`-> POST ${url}  (model: ${AI_MODEL})`);               // never log the key

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`, // the key, from .env
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'user', content: 'Generate a trivia question and its answer. Format: Question: ... Answer: ...' },
      ],
    }),
    signal: AbortSignal.timeout(20000), // don't wait forever
  });

  // fetch() does NOT throw on a 401 or 429: a wrong key is still "a response". Check it yourself.
  if (!res.ok) {
    console.error(`The provider replied ${res.status}:`, (await res.text()).slice(0, 300));
    process.exit(1);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  console.log('<-', text);
  // Next, in your own project: split text into the question and the answer, and keep them on the server.
}

// fetch() DOES throw when no answer arrives at all: offline, a wrong host, or the timeout
main().catch((err) => {
  console.error('Could not reach the provider:', err.message);
  process.exit(1);
});
