const fs = require('fs');

const FILE_NAME = './20/input';

const state = {
  input: '',
  allPaths: []
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  state.input = input.replace(/\^|\$/g, '');
};

const generatePaths = () => {
  const matches = [];
  const toParse = [state.input];

  while (toParse.length) {
    const currentRegex = toParse.shift();

    if (currentRegex.includes('(')) {
      const openingBracket = currentRegex.indexOf('(');
      let currentIndex = openingBracket + 1;
      let nesting = 1;

      while (nesting > 0) {
        const char = currentRegex[currentIndex++];

        if (char === '(') {
          nesting++;
        } else if (char === ')') {
          nesting--;
        }
      }

      const closingBracket = currentIndex - 1;
      const prefix = currentRegex.slice(0, openingBracket);
      const options = currentRegex.slice(openingBracket + 1, closingBracket);
      const suffix = currentRegex.slice(closingBracket + 1);

      if (!options || options.endsWith('|')) {
        const newPath = [prefix, suffix].join('');
        toParse.push(newPath);
        continue;
      }

      let subPaths = [];
      let lastPipeIndex = 0;
      currentIndex = 0
      nesting = 0;

      while (currentIndex < options.length - 1) {
        const char = options[currentIndex++];

        if (nesting === 0 && char === '|') {
          const subPath = options.slice(lastPipeIndex, currentIndex - 1);
          subPaths.push(subPath);
          lastPipeIndex = currentIndex;
        }
        if (char === '(') {
          nesting++;
        } else if (char === ')') {
          nesting--;
        }
      }
      const lastSubPath = options.slice(lastPipeIndex);
      subPaths.push(lastSubPath);

      const newPaths = subPaths.map(path => [prefix, path, suffix].join(''));

      toParse.push(...newPaths);
      continue;
    }

    matches.push(currentRegex);
  }

  state.allPaths = matches;
};

const run = () => {
  parseInput();
  generatePaths();

  state.allPaths.sort((a, b) => b.length - a.length);

  console.log(`Furthest room requires passing ${state.allPaths[0].length} doors`);
};

run();
