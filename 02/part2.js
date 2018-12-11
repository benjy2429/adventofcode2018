const fs = require('fs');

const FILE_NAME = './02/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const ids = file.split('\n');

const getDifferences = (id1, id2) => {
  const differentIndexes = [];

  [...id1].forEach((character, index) => {
    if (character !== id2[index]) {
      differentIndexes.push(index);
    }
  });

  return differentIndexes;
};

for (let id1 of ids) {
  let lowestDifferences = [...id1];
  let matchingId = undefined;

  for (let id2 of ids) {
    const differences = getDifferences(id1, id2);
    if (differences.length !== 0 && differences.length < lowestDifferences.length) {
      lowestDifferences = differences;
      matchingId = id2;
    }
  }

  if (lowestDifferences.length === 1) {
    console.log('Found IDs with a difference of 1 character:');
    console.log(id1);
    console.log(matchingId);
    console.log(`Common characters are ${id1.slice(0, lowestDifferences[0])}${id1.slice(lowestDifferences[0] + 1)}.`);
    return;
  }
}
