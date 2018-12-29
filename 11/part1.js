const fs = require('fs');

const FILE_NAME = './11/input';
const MAX_X_COORDINATE = 300;
const MAX_Y_COORDINATE = 300;

const input = fs.readFileSync(FILE_NAME, 'utf8');

const state = {
  serialNumber: parseInt(input),
  grid: {},
  highestPowerLevel: {
    power: 0,
    location: undefined
  }
}

const calculatePowerLevel = (x, y) => {
  let power = 0;
  const rackID = x + 10;
  power = rackID * y;
  power += state.serialNumber;
  power *= rackID;
  power = parseInt(power.toString().substr(-3, 1) || '0');
  power -= 5;
  return power;
}

const generateGrid = () => {
  for (let i = 1; i <= MAX_X_COORDINATE; i++) {
    for (let j = 1; j <= MAX_Y_COORDINATE; j++) {
      state.grid[`${i},${j}`] = {
        x: i,
        y: j,
        power: calculatePowerLevel(i, j)
      }
    }
  }
};

const findLargestPowerBank = () => {
  for (let i = 1; i <= MAX_X_COORDINATE - 2; i++) {
    for (let j = 1; j <= MAX_Y_COORDINATE - 2; j++) {
      const cells = [
        `${i},${j}`,
        `${i},${j + 1}`,
        `${i},${j + 2}`,
        `${i + 1},${j}`,
        `${i + 1},${j + 1}`,
        `${i + 1},${j + 2}`,
        `${i + 2},${j}`,
        `${i + 2},${j + 1}`,
        `${i + 2},${j + 2}`,
      ]

      const totalPower = cells.reduce(
        (acc, cellId) => acc + state.grid[cellId].power,
        0
      );

      if (totalPower > state.highestPowerLevel.power) {
        state.highestPowerLevel = {
          power: totalPower,
          location: `${i},${j}`
        };
      }
    };
  }
};

const run = () => {
  generateGrid();
  findLargestPowerBank();

  console.log(`The top-left coordinate of the highest power bank is ${state.highestPowerLevel.location}.`);
};

run();
