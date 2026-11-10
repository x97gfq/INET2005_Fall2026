// A pretend AI provider, for when you don't have a key yet (or the Wi-Fi is down).
// It speaks just enough of the Chat Completions format for mflix-bff: same URL, same JSON.
// Run:  docker compose exec node node week10/class1/fake-ai/fake-ai.js     (port 3003)
// Then in mflix-bff/.env:  AI_BASE_URL=http://localhost:3003/v1  AI_API_KEY=anything  AI_MODEL=fake
// (Restart mflix-bff after changing .env: it reads the file once, when it starts.)

const express = require('express');
const app = express();
app.use(express.json());

app.post('/v1/chat/completions', (req, res) => {
  // A real provider checks the key here. We only check that there is one.
  if (!(req.get('authorization') || '').startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'No API key' } });
  }

  const question = req.body.messages?.at(-1)?.content || '';
  console.log('Asked:', question.slice(0, 80));
  // Asked for trivia (the assignment's prompt)? One of a few canned questions, in its format.
  const TRIVIA = [
    'Question: What is the capital of Canada? Answer: Ottawa',
    'Question: How many sides does a hexagon have? Answer: 6',
    'Question: Which planet is known as the Red Planet? Answer: Mars',
  ];
  const content = /trivia/i.test(question)
    ? TRIVIA[Math.floor(Math.random() * TRIVIA.length)]
    : [
      'The Fake Movie (1999) - a placeholder, because this is the fake AI.',
      'Another Fake Movie (2001) - point AI_BASE_URL at a real provider for real answers.',
      'Fake Movie III (2003) - the request and the response format are the real ones, though.',
    ].join('\n');

  // The shape every OpenAI-compatible provider sends back
  res.json({
    id: 'fake-1',
    object: 'chat.completion',
    model: req.body.model,
    choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }],
  });
});

app.listen(3003, () => console.log('Fake AI on http://localhost:3003/v1'));
