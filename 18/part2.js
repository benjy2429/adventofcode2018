const fs = require('fs');

const FILE_NAME = './18/input';
const MAX_MINUTE = 1000000000;

const ACRE_TYPES = {
  OPEN: '.',
  TREES: '|',
  LUMBERYARD: '#'
}

const state = {
  area: [],
  minute: 0,
  seenAreas: []
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');

  input.split("\n").forEach(line => {
    state.area.push(line.split(''));
  });
};

const renderArea = () => {
  state.area.forEach(line => {
    console.log(line.join(''));
  });
  console.log();
};

const getAdjacentAcres = (x, y) => {
  const adjacentCoordinates = [
    [x - 1, y],
    [x - 1, y - 1],
    [x, y - 1],
    [x + 1, y - 1],
    [x + 1, y],
    [x + 1, y + 1],
    [x, y + 1],
    [x - 1, y + 1],
  ];

  return adjacentCoordinates
    .map(([x, y]) => state.area[y] && state.area[y][x])
    .filter(Boolean);
};

const countTypes = acres => ({
  open: acres.filter(acre => acre === ACRE_TYPES.OPEN).length,
  trees: acres.filter(acre => acre === ACRE_TYPES.TREES).length,
  lumberyard: acres.filter(acre => acre === ACRE_TYPES.LUMBERYARD).length
});

const updateOpenAcre = (x, y, acre) => {
  const { trees } = countTypes(getAdjacentAcres(x, y));
  return trees >= 3 ? ACRE_TYPES.TREES : acre;
};

const updateTreesAcre = (x, y, acre) => {
  const { lumberyard } = countTypes(getAdjacentAcres(x, y));
  return lumberyard >= 3 ? ACRE_TYPES.LUMBERYARD : acre;
};

const updateLumberyardAcre = (x, y, acre) => {
  const { lumberyard, trees } = countTypes(getAdjacentAcres(x, y));
  return lumberyard >= 1 && trees >= 1 ? acre : ACRE_TYPES.OPEN;
};

const updateAcreMethods = {
  [ACRE_TYPES.OPEN]: updateOpenAcre,
  [ACRE_TYPES.TREES]: updateTreesAcre,
  [ACRE_TYPES.LUMBERYARD]: updateLumberyardAcre,
}

const updateArea = () => {
  const newArea = [];

  state.area.forEach((row, y) => {
    const newRow = [];

    row.forEach((acre, x) => {
      const newAcreType = updateAcreMethods[acre](x, y, acre);
      newRow.push(newAcreType);
    })

    newArea.push(newRow);
  });

  state.area = newArea;
};

const run = () => {
  parseInput();

  while (state.minute < MAX_MINUTE) {
    state.minute++;
    updateArea();

    const currentArea = [].concat(...state.area).join('');
    const seenAreaIndex = state.seenAreas.indexOf(currentArea);
    if (seenAreaIndex > -1) {
      state.repeatStartIndex = seenAreaIndex;
      break;
    } else {
      state.seenAreas.push(currentArea);
    }
  }

  const finalIndex = (MAX_MINUTE - state.repeatStartIndex) % (state.seenAreas.length - state.repeatStartIndex);
  const finalArea = state.seenAreas[finalIndex + state.repeatStartIndex - 1];
  const { trees, lumberyard } = countTypes(finalArea.split(''));
  const finalResourceValue = trees * lumberyard;

  console.log(`The total resource value after ${MAX_MINUTE} minutes is ${finalResourceValue}.`);
};

run();
