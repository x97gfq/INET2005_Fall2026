// Extra practice: answer each question with JavaScript, using data/hockey_stats.json
// Run:  docker compose exec node node week04/practice/hockey_activity.js
//
// Use the patterns from examples 07-09: reduce, filter, forEach, sort, and
// "count into an object". Points = goals + assists. Question 1 is done for you.

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'hockey_stats.json');
const players = JSON.parse(fs.readFileSync(file, 'utf8'));

// 1. Total goals scored by all forwards (C, LW, RW)
const forwardGoals = players
  .filter((p) => ['C', 'LW', 'RW'].includes(p.position))
  .reduce((sum, p) => sum + p.goals, 0);
console.log('1. Total goals by forwards:', forwardGoals);

// 2. Scoring leader: the player with the most points (goals + assists)
// TODO

// 3. Goal leader and most penalty minutes (the "goon" award)
// TODO

// 4. Points per game for every skater (everyone except goalies), highest first
// TODO

// 5. Team statistics: total goals for each team
// TODO

// 6. Position analysis: average points for each skater position (C, LW, RW, D),
//    and save percentage (saves / shotsAgainst) for each goalie
// TODO
