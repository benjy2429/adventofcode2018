const fs = require('fs');

const FILE_NAME = './01/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const changes = file.split('\n');

changes.reduce(
  (frequency, change) => {
    const operator = change.slice(0, 1);
    const value = parseInt(change.slice(1));

    const newFrequency = operator === '+' ? frequency + value : frequency - value;
    console.log(`Current frequency ${frequency}, change of ${change}; resulting frequency ${newFrequency}.`);

    return newFrequency;
  },
  0
);
