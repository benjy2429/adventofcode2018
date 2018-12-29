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
  },
  storedTotals: {},
  newTotals: {}
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

const calculateTotalPower = (x, y, size) => {
  let totalPower = state.storedTotals[`${x},${y},${size - 1}`] || 0;

  for (let n = 0; n < size; n++) {
    const xToLook = `${x + n},${y + size - 1}`;
    const yToLook = `${x + size - 1},${y + n}`;

    totalPower += state.grid[xToLook].power;
    if (xToLook !== yToLook) {
      totalPower += state.grid[yToLook].power
    }
  }

  delete state.storedTotals[`${x},${y},${size - 1}`] || 0;

  if (x <= MAX_X_COORDINATE - size && y <= MAX_Y_COORDINATE - size) {
    state.storedTotals[`${x},${y},${size}`] = totalPower;
  }

  return totalPower;
};

const findLargestPowerBank = () => {
  for (let size = 1; size <= MAX_X_COORDINATE; size++) {
    for (let i = 1; i <= MAX_X_COORDINATE - size + 1; i++) {
      for (let j = 1; j <= MAX_Y_COORDINATE - size + 1; j++) {
        const totalPower = calculateTotalPower(i, j, size);

        if (totalPower > state.highestPowerLevel.power) {
          state.highestPowerLevel = {
            power: totalPower,
            location: `${i},${j},${size}`
          };
        }
      }
    }
    console.log(`Checking ${size}x${size} power banks...`);
  }
};

const run = () => {
  generateGrid();
  findLargestPowerBank();

  console.log(`The top-left coordinate of the highest power bank is ${state.highestPowerLevel.location}.`);
};

run();
