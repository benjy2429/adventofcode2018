const fs = require('fs');

const FILE_NAME = './05/input';
const LETTERS = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

const polymer = fs.readFileSync(FILE_NAME, 'utf8');

const isCapital = unit => unit === unit.toUpperCase();
const hasMatchingTypes = (a, b) => a.toLowerCase() === b.toLowerCase();
const hasMatchingPolarity = (a, b) => isCapital(a) === isCapital(b);
const willReact = (a, b) => hasMatchingTypes(a,b) && !hasMatchingPolarity(a,b);

const triggerReactions = input => {
  for (let i = 0; i < input.length - 2; i++) {
    const a = input[i];
    const b = input[i + 1];

    if (willReact(a, b)) {
      return `${input.slice(0, i)}${input.slice(i + 2)}`;
    }
  }

  return input;
};

const fullyReact = polymer => {
  let isComplete = false;
  let currentPolymer = polymer;

  while (!isComplete) {
    const newPolymer = triggerReactions(currentPolymer);

    if (newPolymer.length === currentPolymer.length) {
      isComplete = true;
    }

    currentPolymer = newPolymer;
  }

  return currentPolymer;
};

let letterToRemove;
let shortestPolymer = [];

LETTERS.forEach(letter => {
  const regexPattern = `${letter}|${letter.toUpperCase()}`;
  const sanitizedPolymer = polymer.replace(new RegExp(regexPattern, 'g'), '');
  const reactedPolymer = fullyReact(sanitizedPolymer);

  if (!shortestPolymer.length || reactedPolymer.length < shortestPolymer.length) {
    letterToRemove = regexPattern;
    shortestPolymer = reactedPolymer;
  }
});

console.log(`The shortest possible polymer is ${shortestPolymer.length} long, made by removing ${letterToRemove} units.`);
