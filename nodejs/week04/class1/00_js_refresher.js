// Example 0: the JavaScript you need for Node, in one file
// Run:  docker compose exec node node week04/class1/00_js_refresher.js
// (a script, not a server: it prints to the terminal and exits by itself)

// ---- 1. const and let (avoid var) ----
const course = 'INET2005'; // can't be reassigned
let week = 3;              // can be reassigned
week = week + 1;
console.log(`1. ${course}, week ${week}`); // template literal: backticks + ${ }

// ---- 2. Three ways to write the same function ----
function addA(a, b) {        // function declaration
  return a + b;
}
const addB = function (a, b) { // function expression
  return a + b;
};
const addC = (a, b) => a + b;  // arrow function: one expression = implicit return
console.log('2.', addA(2, 3), addB(2, 3), addC(2, 3));

// ---- 3. Objects and arrays (this IS JSON, minus the quotes on keys) ----
const student = { name: 'Alex', program: 'Web', marks: [78, 91, 85] };
console.log('3.', student.name, student.marks[1]);

// ---- 4. Array methods that take a function (a "callback") ----
const marks = [78, 91, 85, 62, 99];
const passed = marks.filter((m) => m >= 80);          // keep some
const curved = marks.map((m) => m + 5);               // transform each
const total = marks.reduce((sum, m) => sum + m, 0);   // boil down to one value
marks.forEach((m, i) => console.log(`4. mark #${i}: ${m}`));
console.log('4.', { passed, curved, total, average: total / marks.length });

// ---- 5. A callback is just a function you hand to someone else to call later ----
function greetLater(name, callback) {
  setTimeout(() => callback(`Hello, ${name}`), 500); // call it in 0.5 s
}
greetLater('class', (message) => console.log('5.', message));
console.log('5. this prints first - Node does not wait for the timer');

// ---- 6. JSON <-> JavaScript ----
const text = JSON.stringify(student);   // object -> string (to send or save)
const back = JSON.parse(text);          // string -> object (to use)
console.log('6.', typeof text, typeof back, back.program);

// ---- 7. async / await: the modern way to wait for something ----
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function main() {
  await wait(1000);
  console.log('7. one second later, thanks to await');
}
main();
