// 2950000001598
// 3750000001113
// 3750000001113

const fs = require('fs');

const FILE_NAME = './12/input';
const GENERATIONS = 50000000000;
// const GENERATIONS = 20;
const POT_STATE = {
  EMPTY: '.',
  PLANT: '#'
};

const state = {
  generation: 0,
  pots: [],
  rules: {},
  totals: [],
  converged: false,
  convergenceWindow: 5000,
  convergenceOffset: 0
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  const lines = input.split("\n");

  const [_, initialState] = lines[0].match(/^initial state: ([#|\.]+)$/);
  state.pots = initialState.split('').map((state, index) => ({
    position: index,
    state
  }));

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.length === 0) {
      continue;
    }

    const [_, pattern, output] = line.match(/^([#|\.]+) => ([#|\.])$/);
    state.rules[pattern] = output;
  }
};

const printPots = (pots = state.pots) => {
  const row = pots.map(pot => pot.state);
  // const row = pots.map(pot => pot.position);
  // console.log(pots[0], pots[1], pots[2], pots[3], pots[4]);
  console.log(`${state.generation}: ${row.join('')}`);
  // console.log(pots[0]);
};

const matchingPots = (pots1, pots2) => {
  for (let i = 0; i < pots1.length; i++) {
    // console.log(pots1[i].state, pots2[i].state);
    // console.log(pots1[i].state === pots2[i].state);
    if (pots1[i].state !== pots2[i].state) {
      return false;
    }
  }
  // printPots(pots1)
  // printPots(pots2)

  return true;
}

const addEdgeBuffer = () => {
  let firstPlantIndex;
  let index = 0;

  while (firstPlantIndex === undefined) {
    if (state.pots[index].state === POT_STATE.PLANT) {
      firstPlantIndex = index;
    }
    index++;
  }

  let lastPlantIndex;
  index = state.pots.length - 1;

  while (lastPlantIndex === undefined) {
    if (state.pots[index].state === POT_STATE.PLANT) {
      lastPlantIndex = index;
    }
    index--;
  }

  const newPots = state.pots.slice(firstPlantIndex, lastPlantIndex + 1);

  newPots.unshift(
    { position: newPots[0].position - 4, state: POT_STATE.EMPTY },
    { position: newPots[0].position - 3, state: POT_STATE.EMPTY },
    { position: newPots[0].position - 2, state: POT_STATE.EMPTY },
    { position: newPots[0].position - 1, state: POT_STATE.EMPTY }
  );

  newPots.push(
    { position: newPots[newPots.length - 1].position + 1, state: POT_STATE.EMPTY },
    { position: newPots[newPots.length - 1].position + 2, state: POT_STATE.EMPTY },
    { position: newPots[newPots.length - 1].position + 3, state: POT_STATE.EMPTY },
    { position: newPots[newPots.length - 1].position + 4, state: POT_STATE.EMPTY },
  );

  state.pots = newPots;
};

const incrementGeneration = () => {
  state.generation++;
  const oldPots = JSON.parse(JSON.stringify(state.pots));

  for (let i = 2; i <= state.pots.length - 3; i++) {
    const surroundingPots = oldPots.slice(i-2, i+3);
    const subPattern = surroundingPots.reduce((acc, pot) => acc + pot.state, '');

    const newState = state.rules[subPattern];
    state.pots[i].state = newState === POT_STATE.PLANT ? POT_STATE.PLANT : POT_STATE.EMPTY;
  }

  addEdgeBuffer();
};

const countPlants = () => state.pots.reduce(
  (acc, pot) => (pot.state === POT_STATE.PLANT)
    ? acc + pot.position
    : acc,
  0
);

const checkForConvergence = () => {
  if (state.generation < state.convergenceWindow) {
    return;
  }

  const lastTotals = state.totals.slice(state.convergenceWindow * -1);

  const diffs = [];
  for (let i = 1; i < lastTotals.length; i++) {
    const diff = lastTotals[i] - lastTotals[i - 1];
    if (!diffs.includes(diff)) {
      diffs.push(diff);
    }
  }

  console.log(diffs);

  if (diffs.length === 1) {
    state.converged = true;
    state.convergenceOffset = diffs[0];
  }
}

const run = () => {
  parseInput();
  addEdgeBuffer();
  printPots();

  for (let i = 0; i < GENERATIONS; i++) {
    incrementGeneration();

    state.totals.push(countPlants());

    checkForConvergence();

    if (state.converged) {
      console.log('CONVERGED', state.generation);
      break;
    }
  }


  const lastPlantCount = state.totals.slice(-1)[0];
  const remainingGenerations = GENERATIONS - state.generation;
  const totalPlantCount = lastPlantCount + (state.convergenceOffset * remainingGenerations);
  console.log(lastPlantCount);
  console.log(state.convergenceOffset);
  console.log(remainingGenerations);
  console.log(totalPlantCount);

  console.log(`The total number of plants over ${GENERATIONS} generations is ${totalPlantCount}.`)
};

run();
