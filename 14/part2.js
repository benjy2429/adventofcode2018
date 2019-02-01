const fs = require('fs');

const FILE_NAME = './14/input';

const state = {
  targetRecipes: 0,
  scores: [3, 7],
  elves: [
    { currentRecipe: 0 },
    { currentRecipe: 1 }
  ],
  matchingIndex: undefined,
  searchWindow: 0
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  state.targetRecipes = parseInt(input);
};

const printScores = () => {
  console.log('Score count:', state.scores.length, '|', state.scores.join(''));
};

const createRecipes = () => {
  const currentRecipeSum = state.elves.reduce(
    (acc, { currentRecipe }) => acc + state.scores[currentRecipe],
    0
  );

  const digits = currentRecipeSum.toString().split('').map(x => parseInt(x));
  state.scores.push(...digits);
  state.searchWindow = digits.length;

  state.elves.forEach(elf => {
    elf.currentRecipe = (elf.currentRecipe + 1 + state.scores[elf.currentRecipe]) % state.scores.length
  });
};

const findTargetRecipes = () => {
  const targetAsString = state.targetRecipes.toString();

  for (let i = 0; i < targetAsString.length + state.searchWindow; i++) {
    const startingIndex = i + (state.scores.length - targetAsString.length - state.searchWindow);
    const currentScores = state.scores.slice(startingIndex, startingIndex + targetAsString.length);

    if (currentScores.join('') === targetAsString) {
      state.matchingIndex = startingIndex;
      break;
    }
  }
};

const run = () => {
  parseInput();
  // printScores();

  while (!state.matchingIndex) {
    createRecipes();
    findTargetRecipes()
    // printScores();
  }

  console.log(`There are ${state.matchingIndex} recipes to the left of ${state.targetRecipes}.`);
};

run();
