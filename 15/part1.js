// Outcome: 59 * 3020 = 178180
// TOO HIGH
// Outcome: 59 * 3011 = 177649
// TOO LOW

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
  winningTeam: undefined
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
          hp: 200
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
    // currentRowOutput += getUnitById(square.unit).id;
  });

  console.log(currentRowOutput);
  console.log();
};

const sortByReadingOrder = (a, b) => (
  a.y - b.y || a.x - b.x
);

const sortByFAndReadingOrder = (a, b) => (
  a.f - b.f || sortByReadingOrder(a, b)
);

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

const calculateDistance = (point1, point2) =>
  Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);

const findAStarPath = (unit, destination) => {
  // console.log('DEST', destination);
  // g = distance between start and current
  // h = distance between current and end
  // f = g + h
  unit.g = 0;
  unit.h = calculateDistance(unit, destination);
  unit.f = unit.g + unit.h;

  const openSet = [unit];

  // squares already considered
  const closedSet = [];

  // 0,0 current
  // 0,-1
  // -1,0
  // 1,0
  // 0,1
  // a = [{x: 0, y: -1},{x: -1, y: 0},{x: 1, y: 0},{x: 0, y: 1}]

  while (openSet.length) {

    // if (unit.id === 0) {
    //   console.log('openSet');
    //   console.log(openSet);
    // }
    openSet.sort(sortByFAndReadingOrder);

    // if (unit.id === 0) {
    //   console.log('openSet sorted');
    //   console.log(openSet);
    // }

    const currentSquare = openSet.shift();
    closedSet.push(currentSquare);

    if (currentSquare.x === destination.x && currentSquare.y === destination.y) {
      let nextParent = state.board[currentSquare.parent];
      const path = [currentSquare];

      while (nextParent.x !== unit.x || nextParent.y !== unit.y) {
        path.push(nextParent);
        nextParent = state.board[nextParent.parent];
      }
      path.push(unit);
      // console.log("PATH FOUND");
      // if (unit.id === 0) {
      //   console.log(path);
      //   process.exit()
      // }
      return path.reverse();
    }

    const neighbours = getAdjacentOpenSquares(currentSquare);

    // if (unit.id === 0) {
    //   console.log();
    //   console.log('current');
    //   console.log(currentSquare);
    //   console.log('openSet');
    //   console.log(openSet);
    //   console.log('closedSet');
    //   console.log(closedSet);
    //   console.log('neighbours');
    //   console.log(neighbours);
    // }

    neighbours.forEach((neighbour, index) => {
      const neighbourInClosedSet = closedSet.find(
        square => square.x === neighbour.x && square.y === neighbour.y
      );

      if (neighbourInClosedSet) {
        // console.log('IN CLOSED SET');
        return;
      }

      const g = currentSquare.g + 1;
      const h = calculateDistance(neighbour, destination);
      const f = g + h;

      const neighbourInOpenSet = openSet.find(
        square => square.x === neighbour.x && square.y === neighbour.y
      );

      if (!neighbourInOpenSet) {
        // console.log('NOT IN OPEN SET');
        neighbour.h = h;
        openSet.push(neighbour);

      } else if (g === neighbour.g) {
        const [highestReadingOrder] = [neighbour, currentSquare].sort(sortByReadingOrder);

        if (highestReadingOrder.x === currentSquare.x && highestReadingOrder.y === currentSquare.y) {
          return;
        }
      } else if (g > neighbour.g) {
        // console.log('G SCORE WAS WORSE');
        return;
      }

      // console.log('G SCORE WAS BETTER!');
      neighbour.parent = `${currentSquare.x},${currentSquare.y}`;
      neighbour.g = g;
      neighbour.f = f;
      // console.log(neighbour);
    });

  }

  return;
};

const attack = targetSquares => {
  const targets = targetSquares.map(square => getUnitById(square.unit));
  targets.sort((a, b) => a.hp - b.hp || sortByReadingOrder(a, b));
  const [targetToAttack] = targets;

  targetToAttack.hp = targetToAttack.hp - 3;

  if (targetToAttack.hp <= 0) {
    // console.log('UNIT DIED!', targetToAttack);
    state.board[`${targetToAttack.x},${targetToAttack.y}`].unit = undefined;
  }
};

const performTurn = unit => {
  if (isGameOver(state.units)) {
    return;
  }

  const adjacentTargets = getAdjacentTargets(unit);

  if (adjacentTargets.length) {
    attack(adjacentTargets);
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

  // console.log(destinations);

  const paths = destinations.map(dest => findAStarPath(unit, dest));

  // if (unit.id === 0) {
  //   console.log('DEBUG');
  //   console.log(targets);
  //   console.log(destinations);
  // }

  const [bestPath] = paths.sort((a, b) => a.length - b.length || sortByReadingOrder(a[a.length - 1], b[b.length - 1]));

  if (!bestPath) {
    return;
  }

  const bestNextStep = bestPath[1];

  // if (unit.id === 0) {
  //   console.log(paths);
  //   console.log(bestNextStep);
  // }

  state.board[`${bestNextStep.x},${bestNextStep.y}`].unit = unit.id;
  state.board[`${unit.x},${unit.y}`].unit = undefined;
  unit.x = bestNextStep.x;
  unit.y = bestNextStep.y;

  // console.log(`AFTER UNIT ${unit.id} MOVE:`);
  // printBoard();
  // process.exit()

  const newAdjacentTargets = getAdjacentTargets(unit);

  if (newAdjacentTargets.length) {
    attack(newAdjacentTargets);
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

const run = input => {
  state.board = {},
  state.units = [],
  state.turn = 0,
  state.gameOver = false,
  state.winningTeam = undefined

  parseInput(input);
  console.log('Initially:');
  printBoard();

  while (
    !state.gameOver
    // && state.turn < 25
  ) {
    state.turn++;
    performRound();
    console.log(`After ${state.turn} rounds:`);
    printBoard();
    // console.log(state.units.filter(({hp}) => hp > 0));
  }


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

// run();
module.exports = run;

/*
==TODO==
* Units not moving in reading order (ex1, 24-25th round, id0)
* HP not going down on last round giving wrong outcome
*/