const fs = require('fs');

const FILE_NAME = './15/input';

const SQUARE_TYPES = {
  WALL: '#',
  OPEN: '.',
  GOBLIN: 'G',
  ELF: 'E'
};

const state = {
  board: {},
  units: [],
  turn: 0,
  gameOver: false,
  winningTeam: undefined,
  reset: false,
  elfAp: 3,
  highestElfAp: undefined
};

const parseInput = (file = FILE_NAME) => {
  const input = fs.readFileSync(file, 'utf8');

  input.split("\n").forEach((row, y) => {
    row.split('').forEach((square, x) => {
      const id = `${x},${y}`;
      const unitId = state.units.length;

      state.board[id] = {
        cavern: square !== SQUARE_TYPES.WALL,
        x,
        y
      };

      if (square === SQUARE_TYPES.GOBLIN || square === SQUARE_TYPES.ELF) {
        state.units.push({
          id: unitId,
          type: square,
          startingPosition: { x, y },
          x,
          y,
          hp: 200,
          ap: square === SQUARE_TYPES.ELF ? state.elfAp : 3
        });

        state.board[id].unit = unitId;
      }
    });
  });
};

const getUnitById = id => (
  state.units.find(unit => unit.id === id)
)

const printBoard = () => {
  let currentY = 0;
  let currentRowOutput = '';

  Object.values(state.board).forEach(square => {
    if (currentY !== square.y) {
      console.log(currentRowOutput);
      currentY = square.y;
      currentRowOutput = '';
    }

    if (!square.cavern) {
      currentRowOutput += SQUARE_TYPES.WALL;
      return;
    }

    if (square.unit === undefined) {
      currentRowOutput += SQUARE_TYPES.OPEN
      return;
    }

    currentRowOutput += getUnitById(square.unit).type;
  });

  console.log(currentRowOutput);
  console.log();
};

const sortByReadingOrder = (a, b) => a.y - b.y || a.x - b.x;

const isUnitAlive = ({ hp }) => hp > 0;

const getAdjacentSquares = ({ x, y }) => (
  [
    `${x},${parseInt(y) - 1}`,
    `${parseInt(x) - 1},${y}`,
    `${parseInt(x) + 1},${y}`,
    `${x},${parseInt(y) + 1}`
  ].map(
    id => state.board[id] || undefined
  ).filter(
    Boolean
  )
);

const getAdjacentOpenSquares = square => (
  getAdjacentSquares(square).filter(
    ({ cavern, unit }) => cavern && unit === undefined
  )
);

const getAdjacentTargets = square => (
  getAdjacentSquares(square).filter(
    ({ unit }) => unit !== undefined && getUnitById(unit).type !== square.type
  )
);

const findShortestPath = (unit, destination) => {
  Object.keys(state.board).forEach(key => {
    state.board[key].parent = undefined;
    state.board[key].distance = undefined;
  });

  unit.distance = 0;
  const openSet = [unit];

  while (openSet.length) {
    const currentSquare = openSet.shift();
    const neighbours = getAdjacentOpenSquares(currentSquare);

    neighbours.forEach(neighbour => {
      const newDistance = currentSquare.distance + 1;

      if (!neighbour.distance || newDistance < neighbour.distance) {
        neighbour.distance = newDistance;
        neighbour.parent = `${currentSquare.x},${currentSquare.y}`;;
        openSet.push(neighbour);
      }
    });
  }

  let nextParent = state.board[destination.parent];

  if (!nextParent) {
    return undefined;
  }

  const path = [destination];
  while (nextParent.x !== unit.x || nextParent.y !== unit.y) {
    path.push(nextParent);
    nextParent = state.board[nextParent.parent];
  }
  path.push(unit);

  return path.reverse();
};

const attack = (unit, targetSquares) => {
  const targets = targetSquares.map(square => getUnitById(square.unit));
  targets.sort((a, b) => a.hp - b.hp || sortByReadingOrder(a, b));
  const [targetToAttack] = targets;

  targetToAttack.hp = targetToAttack.hp - unit.ap;

  if (targetToAttack.hp <= 0) {
    state.board[`${targetToAttack.x},${targetToAttack.y}`].unit = undefined;

    if (targetToAttack.type === SQUARE_TYPES.ELF) {
      state.reset = true;
      state.elfAp = state.highestElfAp ? state.elfAp + 1 : state.elfAp * 2;
    }
  }
};

const performTurn = unit => {
  if (isGameOver(state.units)) {
    return;
  }

  const adjacentTargets = getAdjacentTargets(unit);

  if (adjacentTargets.length) {
    attack(unit, adjacentTargets);
    return;
  }

  const targets = state.units
    .filter(isUnitAlive)
    .filter(({ type }) => type !== unit.type)
    .filter(({ id }) => id !== unit.id);

  const destinations = targets.reduce(
    (acc, square) => [...acc, ...getAdjacentOpenSquares(square)],
    []
  );

  const paths = destinations.map(dest => findShortestPath(unit, dest));
  const [bestPath] = paths.sort((a, b) => a.length - b.length || sortByReadingOrder(a[a.length - 1], b[b.length - 1]));

  if (!bestPath) {
    return;
  }

  const bestNextStep = bestPath[1];

  state.board[`${bestNextStep.x},${bestNextStep.y}`].unit = unit.id;
  state.board[`${unit.x},${unit.y}`].unit = undefined;
  unit.x = bestNextStep.x;
  unit.y = bestNextStep.y;

  const newAdjacentTargets = getAdjacentTargets(unit);

  if (newAdjacentTargets.length) {
    attack(unit, newAdjacentTargets);
  }
};

const performRound = () => {
  state.units.sort(sortByReadingOrder).forEach(unit => {
    if (!isUnitAlive(unit)) {
      return;
    }
    performTurn(unit);
  });
};

const isGameOver = units => {
  const remainingTypes = units.filter(isUnitAlive);

  const isOnlyElvesRemaining = remainingTypes.every(({ type }) => type === SQUARE_TYPES.ELF)
  const isOnlyGoblinsRemaining = remainingTypes.every(({ type }) => type === SQUARE_TYPES.GOBLIN);

  if (isOnlyElvesRemaining) {
    if (!state.highestElfAp) {
      state.reset = true;
      state.highestElfAp = state.elfAp;
      state.elfAp = (state.elfAp / 2) + 1;
      return false;
    }

    state.gameOver = true;
    state.winningTeam = SQUARE_TYPES.ELF;
    return true;
  }

  if (isOnlyGoblinsRemaining) {
    state.gameOver = true;
    state.winningTeam = SQUARE_TYPES.GOBLIN;
    return true;
  }

  return false;
};

const reset = input => {
  state.board = {};
  state.units = [];
  state.turn = 0;
  state.gameOver = false;
  state.winningTeam = undefined;
  state.reset = false;

  parseInput(input);
};

const run = input => {
  reset(input);
  console.log(`Elves now have ${state.elfAp} attack power`);

  while (!state.gameOver) {
    state.turn++;
    performRound();

    if (state.reset) {
      reset(input);
      console.log(`Elves now have ${state.elfAp} attack power`);
    }
  }

  console.log();
  console.log(`After ${state.turn} rounds:`);
  printBoard();

  const totalRemainingHP = state.units.reduce(
    (acc, { hp }) => hp > 0 ? acc + hp : acc,
    0
  );

  const winningTeam = state.winningTeam === SQUARE_TYPES.ELF ? 'Elves' : 'Goblins';
  const outcome = (state.turn - 1) * totalRemainingHP;

  console.log(`Combat ends after ${state.turn - 1} full rounds`);
  console.log(`${winningTeam} win with ${totalRemainingHP} total hit points left`);
  console.log(`Outcome: ${state.turn - 1} * ${totalRemainingHP} = ${outcome}`);

  return outcome;
};

run();
