const fs = require('fs');

const FILE_NAME = './10/input';
const OUTPUT_FILE_NAME = './10/output';

const input = fs.readFileSync(FILE_NAME, 'utf8');

const state = {
  second: 0,
  points: {},
  gridPoints: {},
  previousGridSize: {}
}

const parseInput = () => {
  const points = input.split("\n");
  points.forEach((point, index) => {
    const [_, position, velocity] = point.match(/^position=<(.+)> velocity=<(.+)>$/);
    const [positionX, positionY] = position.replace(/\s/g, '').split(',');
    const [velocityX, velocityY] = velocity.replace(/\s/g, '').split(',');

    state.points[index] = {
      id: index,
      position: {
        x: parseInt(positionX),
        y: parseInt(positionY),
      },
      velocity: {
        x: parseInt(velocityX),
        y: parseInt(velocityY),
      }
    };

    state.previousGridSize = calculateGridSize(state.points);
  });
};

const getGridBounds = points => {
  const values = Object.values(points);
  const bounds = values.reduce(
    (acc, { position }) => {
      acc.xMin = position.x < acc.xMin ? position.x : acc.xMin;
      acc.xMax = position.x > acc.xMax ? position.x : acc.xMax;
      acc.yMin = position.y < acc.yMin ? position.y : acc.yMin;
      acc.yMax = position.y > acc.yMax ? position.y : acc.yMax;
      return acc;
    },
    { xMin: 0, xMax: 0, yMin: 0, yMax: 0 }
  );
  return bounds;
}

const printGrid = () => {
  const { xMin, xMax, yMin, yMax } = getGridBounds(state.points);

  const writeStream = fs.createWriteStream(OUTPUT_FILE_NAME);

  console.log('Writing message...');

  for (let j = yMin; j <= yMax; j++) {
    const col = state.gridPoints[j] || {};
    let row = '';
    for (let i = xMin; i <= xMax; i++) {
      const hasPoint = Boolean(col[i]);
      row += (hasPoint ? '#' : '.');
    }
    writeStream.write(row + "\n");
  }

  writeStream.end();
  console.log(`Written message to ${OUTPUT_FILE_NAME}.`);
};

const calculateGridSize = (points) => {
  const { xMin, xMax, yMin, yMax } = getGridBounds(points);
  return {
    width: Math.abs(xMax - xMin),
    height: Math.abs(yMax - yMin),
  };
}

const updatePoints = () => {
  const newPoints = {};
  const newGridPoints = {};

  const { previousGridSize, points } = state;

  Object.values(points).forEach(point => {
    const { position, velocity, id } = point;
    newPoints[id] = {
      ...point,
      position: {
        x: position.x += velocity.x,
        y: position.y += velocity.y,
      }
    }

    newGridPoints[position.y] = newGridPoints[position.y] || {};
    newGridPoints[position.y] = {
      ...newGridPoints[position.y],
      [position.x]: {
        ...newGridPoints[position.y][position.x] || [],
        id
      }
    }
  });

  const newGridSize = calculateGridSize(newPoints);

  const messageFound = newGridSize.width > previousGridSize.width
    && newGridSize.height > previousGridSize.height;

  if (messageFound) {
    return true;
  }

  state.points = newPoints;
  state.gridPoints = newGridPoints;
  state.previousGridSize = newGridSize;

  return false;
};

const run = () => {
  parseInput();
  let foundMessage = false;
  console.log('Looking for message...');

  while (!foundMessage) {
    foundMessage = updatePoints();

    if (foundMessage) {
      console.log(`Message found after ${state.second} seconds.`);
      printGrid();
      return;
    }

    state.second++;
  }
};

run();
