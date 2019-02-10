const fs = require('fs');

const FILE_NAME = './16/input';

const state = {
  registers: [],
  samples: [],
  tests: [],
  opcodeMap: {}
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');

  const [part1, part2] = input.split("\n\n\n\n");

  part1.split("\n\n").forEach(sample => {
    const lines = sample.split("\n");

    const [_before, registerBeforeRaw] = lines[0].match(/^Before:\s+\[(.+)\]$/);
    const before = registerBeforeRaw.split(', ').map(x => parseInt(x));

    const instruction = lines[1].split(' ').map(x => parseInt(x));

    const [_after, registerAfterRaw] = lines[2].match(/^After:\s+\[(.+)\]$/);
    const after = registerAfterRaw.split(', ').map(x => parseInt(x));

    state.samples.push({
      before,
      instruction,
      after
    })
  });

  part2.split("\n").forEach(test => {
    const parsedTest = test.split(' ').map(x => parseInt(x));
    state.tests.push(parsedTest);
  });
};

const opcodes = {
  addr: (a, b, c) => state.registers[c] = state.registers[a] + state.registers[b],
  addi: (a, b, c) => state.registers[c] = state.registers[a] + b,
  mulr: (a, b, c) => state.registers[c] = state.registers[a] * state.registers[b],
  muli: (a, b, c) => state.registers[c] = state.registers[a] * b,
  banr: (a, b, c) => state.registers[c] = state.registers[a] & state.registers[b],
  bani: (a, b, c) => state.registers[c] = state.registers[a] & b,
  borr: (a, b, c) => state.registers[c] = state.registers[a] | state.registers[b],
  bori: (a, b, c) => state.registers[c] = state.registers[a] | b,
  setr: (a, b, c) => state.registers[c] = state.registers[a],
  seti: (a, b, c) => state.registers[c] = a,
  gtir: (a, b, c) => state.registers[c] = a > state.registers[b] ? 1 : 0,
  gtri: (a, b, c) => state.registers[c] = state.registers[a] > b ? 1 : 0,
  gtrr: (a, b, c) => state.registers[c] = state.registers[a] > state.registers[b] ? 1 : 0,
  eqir: (a, b, c) => state.registers[c] = a === state.registers[b] ? 1 : 0,
  eqri: (a, b, c) => state.registers[c] = state.registers[a] === b ? 1 : 0,
  eqrr: (a, b, c) => state.registers[c] = state.registers[a] === state.registers[b] ? 1 : 0,
};

const opcodeKeys = Object.keys(opcodes);

const findMatchingOpcodes = ({ before, instruction, after }) => {
  const [opcodeNumber, a, b, c] = instruction;

  const matchingOpcodes = opcodeKeys.reduce(
    (acc, opcode) => {
      state.registers = [...before];
      opcodes[opcode](a, b, c);
      const isMatching = after.every((value, index) => value === state.registers[index]);
      return isMatching ? [...acc, opcode] : acc;
    },
    []
  );

  return {
    opcodeNumber,
    matchingOpcodes
  };
};

const calculateOpcodeNumbers = samples => {
  let unknownSamples = [...samples];

  while (unknownSamples.length) {
    const nextSamples = [];

    unknownSamples.forEach(sample => {
      const { opcodeNumber, matchingOpcodes } = sample;

      if (matchingOpcodes.length > 1) {
        nextSamples.push(sample);
        return;
      }

      state.opcodeMap[opcodeNumber] = matchingOpcodes[0];
    });

    const knownOpcodes = Object.values(state.opcodeMap);

    unknownSamples = nextSamples
      .map(sample => ({
        ...sample,
        matchingOpcodes: sample.matchingOpcodes.filter(
          opcode => !knownOpcodes.includes(opcode)
        )
      }))
      .filter(sample => sample.matchingOpcodes.length)
  }
};

const runTests = () => {
  state.registers = [0, 0, 0, 0];

  state.tests.forEach(test => {
    const [opcodeNumber, a, b, c] = test;
    const opcode = state.opcodeMap[opcodeNumber];
    opcodes[opcode](a, b, c);
  });
};

const run = () => {
  parseInput();

  const testedSamples = state.samples.map(findMatchingOpcodes);

  calculateOpcodeNumbers(testedSamples)
  runTests();

  console.log(`Register 0 contains ${state.registers[0]} after running the test program.`);
};

run();
