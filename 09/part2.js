const fs = require('fs');

const FILE_NAME = './09/input';

const input = fs.readFileSync(FILE_NAME, 'utf8');

const state = {
  board: {
    0: {
      value: 0,
      next: 0,
      prev: 0
    }
  },
  playerCount: 0,
  nextMarbleValue: 1,
  players: {},
  currentMarbleValue: 0,
  currentPlayer: 0,
  maxMarble: 0
}

const parseInput = () => {
  const [_, playerCount, maxMarble] = input.match(/^(\d+) players; last marble is worth (\d+) points$/);
  state.playerCount = parseInt(playerCount);
  state.maxMarble = parseInt(maxMarble) * 100;
};

const generatePlayers = () => {
  for (let i = 0; i < state.playerCount; i++) {
    state.players[i] = {
      score: 0
    };
  }
};

const traverseBoard = (current, count, forwards = true) => {
  let currentMarble = current;
  for (let i = 0; i < count; i++) {
    const newValue = forwards ? currentMarble.next : currentMarble.prev;
    currentMarble = state.board[newValue];
  }
  return currentMarble;
}

const performRound = () => {
  const { board, currentMarbleValue, nextMarbleValue } = state;

  if (nextMarbleValue % 23 === 0) {
    state.players[state.currentPlayer].score += nextMarbleValue;

    const beforeToRemove = traverseBoard(board[currentMarbleValue], 8, false);
    const toRemove = traverseBoard(board[currentMarbleValue], 7, false);
    const afterToRemove = traverseBoard(board[currentMarbleValue], 6, false);

    delete board[toRemove.value];
    state.players[state.currentPlayer].score += toRemove.value;

    beforeToRemove.next = afterToRemove.value;
    afterToRemove.prev = beforeToRemove.value;

    state.currentMarbleValue = afterToRemove.value;
    state.nextMarbleValue++;
    state.currentPlayer = (state.currentPlayer + 1) % state.playerCount;

    return;
  }

  const beforeToInsert = traverseBoard(board[currentMarbleValue], 1);
  const afterToInsert = traverseBoard(board[currentMarbleValue], 2);

  state.board[nextMarbleValue] = {
    value: nextMarbleValue,
    next: afterToInsert.value,
    prev: beforeToInsert.value
  };

  beforeToInsert.next = nextMarbleValue;
  afterToInsert.prev = nextMarbleValue;

  state.currentMarbleValue = nextMarbleValue;
  state.nextMarbleValue++;
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

  while (state.nextMarbleValue < state.maxMarble) {
    performRound();
  }
};

run();
console.log(`${input}: high score is ${getHighestScore()}`);
