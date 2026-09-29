// Solution for week04/practice/hockey_activity.js
// Run:  docker compose exec node node week04/practice/_solution/hockey_solution.js

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'data', 'hockey_stats.json');
const players = JSON.parse(fs.readFileSync(file, 'utf8'));

const points = (p) => p.goals + p.assists;
const skaters = players.filter((p) => p.position !== 'G');

// 1. Total goals by forwards
const forwardGoals = players
  .filter((p) => ['C', 'LW', 'RW'].includes(p.position))
  .reduce((sum, p) => sum + p.goals, 0);
console.log('1. Total goals by forwards:', forwardGoals);

// 2. Scoring leader - reduce keeps whichever player is bigger so far
const leader = players.reduce((best, p) => (points(p) > points(best) ? p : best));
console.log(`2. Scoring leader: ${leader.name} (${points(leader)} pts)`);

// 3. Goal leader and most penalty minutes
const sniper = players.reduce((best, p) => (p.goals > best.goals ? p : best));
const goon = players.reduce((best, p) => (p.penaltyMinutes > best.penaltyMinutes ? p : best));
console.log(`3. Goal leader: ${sniper.name} (${sniper.goals}), most PIM: ${goon.name} (${goon.penaltyMinutes})`);

// 4. Points per game, highest first (sort a copy with map, then sort)
console.log('4. Points per game:');
skaters
  .map((p) => ({ name: p.name, position: p.position, ppg: points(p) / p.games }))
  .sort((a, b) => b.ppg - a.ppg)
  .forEach((p) => console.log(`   ${p.name.padEnd(17)} ${p.position.padEnd(2)}  ${p.ppg.toFixed(2)}`));

// 5. Goals per team
const teamGoals = {};
players.forEach((p) => {
  teamGoals[p.team] = (teamGoals[p.team] || 0) + p.goals;
});
console.log('5. Goals per team:', teamGoals);

// 6. Average points per skater position, and goalie save percentage
console.log('6. Position averages:');
for (const position of ['C', 'LW', 'RW', 'D']) {
  const group = skaters.filter((p) => p.position === position);
  const average = group.reduce((sum, p) => sum + points(p), 0) / group.length;
  console.log(`   ${position.padEnd(2)} average points: ${average.toFixed(1)}`);
}
players
  .filter((p) => p.position === 'G')
  .forEach((g) => console.log(`   ${g.name} save %: ${(g.saves / g.shotsAgainst).toFixed(3)}`));
