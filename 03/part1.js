const fs = require('fs');

const FILE_NAME = './03/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const input = file.split('\n');

const claims = [];
const gridPoints = {};

input.forEach(claim => {
  const [_, id, x, y, width, height] = claim.match(/^#(\d+)\s@\s(\d+),(\d+):\s(\d+)x(\d+)$/);
  claims.push({
    x: parseInt(x),
    y: parseInt(y),
    width: parseInt(width),
    height: parseInt(height)
  });
});

const calculateGridItems = ({ x, y, width, height }, index) => {
  for (let i = x; i < x + width; i++) {
    for (let j = y; j < y + height; j++) {
      const pointId = `${i},${j}`;
      gridPoints[pointId] = (gridPoints[pointId] || 0) + 1;
    }
  }
};

claims.forEach(calculateGridItems);
const allPoints = Object.values(gridPoints);
const overlappingPoints = allPoints.filter(count => count > 1);

console.log(`There are ${allPoints.length} square inches of claims.`);
console.log(`${overlappingPoints.length} square inches are overlapping.`);
