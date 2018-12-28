const fs = require('fs');

const FILE_NAME = './09/input';

const input = fs.readFileSync(FILE_NAME, 'utf8');

const state = {
  board: [0],
  playerCount: 0,
  marblesRemaining: [],
  players: {},
  currentMarbleIndex: 0,
  currentPlayer: 0,
}

const parseInput = () => {
  const [_, playerCount, maxMarble] = input.match(/^(\d+) players; last marble is worth (\d+) points$/);
  state.playerCount = parseInt(playerCount);
  state.marblesRemaining = Array.from(Array(parseInt(maxMarble)), (_,x) => x + 1);
};

const generatePlayers = () => {
  for (let i = 0; i < state.playerCount; i++) {
    state.players[i] = {
      score: 0
    };
  }
};

const performRound = () => {
  const { board, currentMarbleIndex, marblesRemaining } = state;

  const nextMarble = marblesRemaining.shift();

  if (nextMarble % 23 === 0) {
    state.players[state.currentPlayer].score += nextMarble;

    let indexToRemove = currentMarbleIndex - 7;

    while (indexToRemove < 0) {
      indexToRemove += board.length;
    }

    const [removedMarble] = board.splice(indexToRemove, 1);

    state.players[state.currentPlayer].score += removedMarble;
    state.currentMarbleIndex = indexToRemove;
    state.currentPlayer = (state.currentPlayer + 1) % state.playerCount;

    return;
  }

  let indexToInsert = currentMarbleIndex + 2;

  while (indexToInsert > board.length) {
    indexToInsert -= board.length;
  }

  board.splice(indexToInsert, 0, nextMarble);
  state.currentMarbleIndex = indexToInsert;
  state.currentPlayer = (state.currentPlayer + 1) % state.playerCount;
};

const getHighestScore = () => {
  return Object.values(state.players).reduce(
    (acc, { score }) => score > acc ? score : acc,
    0
  );
}

const run = () => {
  parseInput();
  generatePlayers();

  while (state.marblesRemaining.length) {
    performRound();
  }
};

run();
console.log(`${input}: high score is ${getHighestScore()}`);
