const fs = require('fs');

const FILE_NAME = './01/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const changes = file.split('\n');
const foundFrequencies = [0];

let frequencyFoundTwice = undefined;

let index = 0;
let frequency = 0;

while (!frequencyFoundTwice) {
  const change = changes[index];

  const operator = change.slice(0, 1);
  const value = parseInt(change.slice(1));

  const newFrequency = operator === '+' ? frequency + value : frequency - value;

  if (foundFrequencies.includes(newFrequency)) {
    console.log(`Found frequency ${newFrequency} twice.`);
    frequencyFoundTwice = newFrequency;
    return;
  }

  frequency = newFrequency;
  foundFrequencies.push(newFrequency);
  index = index === changes.length - 1 ? 0 : index + 1;
}
