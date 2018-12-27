const fs = require('fs');

const FILE_NAME = './06/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');

const grid = {};
const locations = [];
const gridDimensions = {
  xMin: Number.POSITIVE_INFINITY,
  xMax: 0,
  yMin: Number.POSITIVE_INFINITY,
  yMax: 0
};
const infiniteLocations = [];

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

const findClosestLocation = (x, y) => {
  let shortestDistance = Number.POSITIVE_INFINITY;
  let closestLocations = [];

  locations.forEach(location => {
    const distance = calculateDistance(x, y, location.x, location.y);
    if (!closestLocations.length || distance === shortestDistance) {
      closestLocations.push(location.id);
      shortestDistance = distance;
      return;
    }
    if (distance < shortestDistance) {
      shortestDistance = distance;
      closestLocations = [location.id];
    }
  });

  return closestLocations.length === 1 ? closestLocations[0] : undefined;
}

const isEdgeLocation = (x, y, { xMin, xMax, yMin, yMax }) =>
  x === xMin || x === xMax || y === yMin || y === yMax;

const generateGrid = () => {
  const { xMin, xMax, yMin, yMax } = gridDimensions;

  for (let i = xMin; i < xMax + 1; i++) {
    for (let j = yMin; j < yMax + 1; j++) {
      const coordinateKey = `${i},${j}`;
      const closestLocationId = findClosestLocation(i, j);
      grid[coordinateKey] = closestLocationId;

      if (
        isEdgeLocation(i, j, gridDimensions) &&
        !infiniteLocations.includes(closestLocationId)
      ) {
        infiniteLocations.push(closestLocationId);
      }
    }
  }
}

generateGrid();

const locationCountById = {};
Object.values(grid).forEach(id => {
  locationCountById[id] = (locationCountById[id] || 0) + 1;
});

const idWithLargestArea = Object.keys(locationCountById).reduce(
  (acc, id) => {
    const integerId = parseInt(id);
    return !infiniteLocations.includes(integerId)
      && locationCountById[integerId] > locationCountById[acc]
      ? integerId
      : acc;
  },
  0
);

console.log(`The largest area is ${locationCountById[idWithLargestArea]}.`);
