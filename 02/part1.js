const fs = require('fs');

const FILE_NAME = './02/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const ids = file.split('\n');

const wordLetterCounts = {
  two: 0,
  three: 0
};

ids.forEach(id => {
  const letterFrequency = {};

  [...id].forEach(letter => {
    letterFrequency[letter] = letterFrequency[letter] + 1 || 1;
  });

  const counts = Object.values(letterFrequency);

  if (counts.includes(2)) {
    wordLetterCounts.two++;
  }
  if (counts.includes(3)) {
    wordLetterCounts.three++;
  }
});

console.log(`Found ${wordLetterCounts.two} words with exactly 2 of any letter.`);
console.log(`Found ${wordLetterCounts.three} words with exactly 3 of any letter.`);

const checksum = wordLetterCounts.two * wordLetterCounts.three;

console.log(`Checksum is ${checksum}.`);
