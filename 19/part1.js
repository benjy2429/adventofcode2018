const fs = require('fs');

const FILE_NAME = './19/input';

const state = {
  registers: [0, 0, 0, 0, 0, 0],
  tests: [],
  instructionPointerRegister: 0,
  instructionPointer: 0
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');

  const [instructionPointerRegister, ...tests] = input.split("\n")

  state.instructionPointerRegister = parseInt(instructionPointerRegister.match(/^#ip (\d)$/)[1]);

  tests.forEach(test => {
    const [opcode, ...rest] = test.split(' ');
    state.tests.push([opcode, ...rest.map(x => parseInt(x))]);
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

const runTests = () => {
  let currentTest = state.tests[state.instructionPointer];

  while (currentTest) {
    state.registers[state.instructionPointerRegister] = state.instructionPointer;

    const [opcode, a, b, c] = currentTest;
    opcodes[opcode](a, b, c);

    state.instructionPointer = state.registers[state.instructionPointerRegister];
    state.instructionPointer++;
    currentTest = state.tests[state.instructionPointer];
  }
};

const run = () => {
  parseInput();
  runTests();

  console.log(`Register 0 contains ${state.registers[0]} after running the test program.`);
};

run();
