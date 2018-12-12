const fs = require('fs');

const FILE_NAME = './05/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const polymer = file.split('');

const isCapital = unit => unit === unit.toUpperCase();
const hasMatchingTypes = (a, b) => a.toLowerCase() === b.toLowerCase();
const hasMatchingPolarity = (a, b) => isCapital(a) === isCapital(b);
const willReact = (a, b) => hasMatchingTypes(a,b) && !hasMatchingPolarity(a,b);

const triggerReactions = input => {
  for (let i = 0; i < input.length - 2; i++) {
    const a = input[i];
    const b = input[i + 1];

    if (willReact(a, b)) {
      return [
        ...input.slice(0, i),
        ...input.slice(i + 2)
      ];
    }
  }

  return input;
};

let iteration = 0;
let isComplete = false;
let currentPolymer = polymer;

while (!isComplete) {
  const newPolymer = triggerReactions(currentPolymer);

  if (newPolymer.length === currentPolymer.length) {
    isComplete = true;
  }

  iteration++;
  currentPolymer = newPolymer;
}

console.log(`The polymer reacted ${iteration} times leaving ${currentPolymer.length} units remaining.`);
