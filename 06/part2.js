const fs = require('fs');

const FILE_NAME = './06/input';
const MAX_DISTANCE = 10000;

const file = fs.readFileSync(FILE_NAME, 'utf8');

const grid = {};
const locations = [];
const gridDimensions = {
  xMin: Number.POSITIVE_INFINITY,
  xMax: 0,
  yMin: Number.POSITIVE_INFINITY,
  yMax: 0
};

file.split('\n').forEach((coordinate, index) => {
  const [xStr, yStr] = coordinate.split(', ');
  const x = parseInt(xStr);
  const y = parseInt(yStr);

  const { xMin, xMax, yMin, yMax } = gridDimensions;

  gridDimensions.xMin = x < xMin ? x : xMin;
  gridDimensions.xMax = x > xMax ? x : xMax;
  gridDimensions.yMin = y < yMin ? y : yMin;
  gridDimensions.yMax = y > yMax ? y : yMax;

  locations.push({ id: index, x, y });
});

const calculateDistance = ( x1, y1, x2, y2 ) =>
  Math.abs(x1 - x2) + Math.abs(y1 - y2);

const findTotalDistance = (x, y) => (
  locations.reduce(
    (acc, location) => acc + calculateDistance(x, y, location.x, location.y),
    0
  )
);

const generateGrid = () => {
  const { xMin, xMax, yMin, yMax } = gridDimensions;

  for (let i = xMin; i < xMax + 1; i++) {
    for (let j = yMin; j < yMax + 1; j++) {
      const coordinateKey = `${i},${j}`;
      const totalDistance = findTotalDistance(i, j);

      if (totalDistance < MAX_DISTANCE) {
        grid[coordinateKey] = totalDistance;
      }
    }
  }
}

generateGrid();
const regionSize = Object.keys(grid).length;

console.log(`The region size is ${regionSize}.`);
