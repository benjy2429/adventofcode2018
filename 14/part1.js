const fs = require('fs');

const FILE_NAME = './14/input';
const USEFUL_RECIPE_COUNT = 10;

const state = {
  targetRecipeCount: 0,
  scores: [3, 7],
  elves: [
    { currentRecipe: 0 },
    { currentRecipe: 1 }
  ]
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  state.targetRecipeCount = parseInt(input);
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

  state.elves.forEach(elf => {
    elf.currentRecipe = (elf.currentRecipe + 1 + state.scores[elf.currentRecipe]) % state.scores.length
  });
};

const run = () => {
  parseInput();
  // printScores();

  while (state.scores.length < state.targetRecipeCount + USEFUL_RECIPE_COUNT) {
    createRecipes();
    // printScores();
  }

  const finalScores = state.scores.slice(state.targetRecipeCount, state.targetRecipeCount + USEFUL_RECIPE_COUNT);

  console.log(`The ${USEFUL_RECIPE_COUNT} recipe scores immediately after ${state.targetRecipeCount} recipes is ${finalScores.join('')}.`);
};

run();
