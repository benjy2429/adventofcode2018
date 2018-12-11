const fs = require('fs');

const FILE_NAME = './03/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const input = file.split('\n');

const claims = [];
const gridPoints = {};

input.forEach(claim => {
  const [_, id, x, y, width, height] = claim.match(/^#(\d+)\s@\s(\d+),(\d+):\s(\d+)x(\d+)$/);
  claims.push({
    id: parseInt(id),
    x: parseInt(x),
    y: parseInt(y),
    width: parseInt(width),
    height: parseInt(height)
  });
});

const calculateGridItems = ({ x, y, width, height }) => {
  for (let i = x; i < x + width; i++) {
    for (let j = y; j < y + height; j++) {
      const pointId = `${i},${j}`;
      gridPoints[pointId] = (gridPoints[pointId] || 0) + 1;
    }
  }
};

const hasOverlappingPoints = ({ id, x, y, width, height }) => {
  for (let i = x; i < x + width; i++) {
    for (let j = y; j < y + height; j++) {
      const pointId = `${i},${j}`;
      if (gridPoints[pointId] > 1) {
        return { id, overlapping: true };
      }
    }
  }
  return { id, overlapping: false };
};

claims.forEach(calculateGridItems);

const nonOverlappingClaims = claims
  .map(hasOverlappingPoints)
  .filter(({ overlapping }) => !overlapping);

console.log(`The claim with no overlapping has an ID of ${nonOverlappingClaims[0].id}.`);
