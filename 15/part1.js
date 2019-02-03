const fs = require('fs');

const FILE_NAME = './15/input.example2';

const SQUARE_TYPES = {
  WALL: '#',
  OPEN: '.',
  GOBLIN: 'G',
  ELF: 'E'
};

const state = {
  board: {},
  units: [],
  turn: 0
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');

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

    currentRowOutput += state.units[square.unit].type;
  });

  console.log(currentRowOutput);
  console.log();
};

const sortByFAndReadingOrder = (a, b) => (
  a.f - b.f || a.y - b.y || (a.x - b.x && (a.y - b.y === 0))
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
    ({ unit }) => unit !== undefined && state.units[unit].type !== square.type
  )
);

const calculateDistance = (point1, point2) =>
  Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);

const findAStarPath = (unit, destination) => {
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

    neighbours.forEach(neighbour => {
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
      } else if (g >= neighbour.g) {
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

const performTurn = unit => {
  const adjacentTargets = getAdjacentTargets(unit);

  if (adjacentTargets.length) {
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

  const nextSteps = destinations.map((dest, index) => {
    const path = findAStarPath(unit, dest);
    // console.log(path);
    if (!path) {
      return undefined;
    }

    // process.exit()

    return {
      x: path[1].x,
      y: path[1].y,
      f: path[1].f
    }
  });

  // console.log(nextSteps);

  const sortedNextSteps = nextSteps.sort(sortByFAndReadingOrder);
  const bestNextStep = sortedNextSteps[0];

  // console.log(sortedNextSteps[0]);
  // console.log(sortedNextSteps[1]);

  if (!bestNextStep) {
    return;
  }

  state.board[`${bestNextStep.x},${bestNextStep.y}`].unit = unit.id;
  state.board[`${unit.x},${unit.y}`].unit = undefined;
  unit.x = bestNextStep.x;
  unit.y = bestNextStep.y;

  // console.log(`AFTER UNIT ${unit.id} MOVE:`);
  // printBoard();
  // process.exit()
};

const performRound = () => {
  state.units.forEach(unit => {
    if (!isUnitAlive(unit)) {
      return;
    }
    performTurn(unit);
  });
};

const isGameOver = units => {
  const remainingTypes = units.filter(isUnitAlive);

  return remainingTypes.every(({ type }) => type === SQUARE_TYPES.ELF)
    || remainingTypes.every(({ type }) => type === SQUARE_TYPES.GOBLIN);
};

const run = () => {
  parseInput();
  console.log('Initially:');
  printBoard();

  while (!isGameOver(state.units) && state.turn < 4) {
    state.turn++;
    performRound();
    console.log(`After ${state.turn} round(s):`);
    printBoard();
  }

  // const finalScores = state.scores.slice(state.targetRecipeCount, state.targetRecipeCount + USEFUL_RECIPE_COUNT);

  // console.log(`The ${USEFUL_RECIPE_COUNT} recipe scores immediately after ${state.targetRecipeCount} recipes is ${finalScores.join('')}.`);
};

run();