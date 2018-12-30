const fs = require('fs');

const FILE_NAME = './12/input';
const GENERATIONS = 20;
const POT_STATE = {
  EMPTY: '.',
  PLANT: '#'
};

const state = {
  generation: 0,
  pots: [],
  rules: {}
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
  console.log(`${state.generation}: ${row.join('')}`);
};

const hasAnyPlants = pots => pots.filter(pot => pot.state === POT_STATE.PLANT).length > 0;

const addEdgeBuffer = () => {
  const firstFourPots = state.pots.slice(0, 4);
  if (hasAnyPlants(firstFourPots)) {
    state.pots.unshift(
      { position: state.pots[0].position - 4, state: POT_STATE.EMPTY },
      { position: state.pots[0].position - 3, state: POT_STATE.EMPTY },
      { position: state.pots[0].position - 2, state: POT_STATE.EMPTY },
      { position: state.pots[0].position - 1, state: POT_STATE.EMPTY }
    );
  }

  const lastFourPots = state.pots.slice(state.pots.length - 4);
  if (hasAnyPlants(lastFourPots)) {
    state.pots.push(
      { position: state.pots[state.pots.length - 1].position + 1, state: POT_STATE.EMPTY },
      { position: state.pots[state.pots.length - 1].position + 2, state: POT_STATE.EMPTY },
      { position: state.pots[state.pots.length - 1].position + 3, state: POT_STATE.EMPTY },
      { position: state.pots[state.pots.length - 1].position + 4, state: POT_STATE.EMPTY },
    );
  }
};

const incrementGeneration = () => {
  state.generation++;
  addEdgeBuffer();
  const oldPots = JSON.parse(JSON.stringify(state.pots));

  for (let i = 2; i <= state.pots.length - 3; i++) {
    const surroundingPots = oldPots.slice(i-2, i+3);
    const subPattern = surroundingPots.reduce((acc, pot) => acc + pot.state, '');

    const newState = state.rules[subPattern];
    state.pots[i].state = newState === POT_STATE.PLANT ? POT_STATE.PLANT : POT_STATE.EMPTY;
  }
};

const run = () => {
  parseInput();
  addEdgeBuffer();
  printPots();

  for (let i = 0; i < GENERATIONS; i++) {
    incrementGeneration();
    printPots();
  }

  const plantCount = state.pots.reduce(
    (acc, pot) => (pot.state === POT_STATE.PLANT) ? acc + pot.position : acc,
    0
  );

  console.log(`The total number of plants over ${state.generation} generations is ${plantCount}.`)
};

run();
