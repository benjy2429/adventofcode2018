const fs = require('fs');

const FILE_NAME = './16/input';

const state = {
  registers: [],
  samples: []
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

const countMatchingOpcodes = ({ before, instruction, after }) => (
  opcodeKeys.map(
    opcode => {
      state.registers = [...before];
      const [_, a, b, c] = instruction;
      opcodes[opcode](a, b, c);

      return after.every((value, index) => value === state.registers[index]);
    }
  ).filter(
    result => result
  ).length
);

const run = () => {
  parseInput();

  const testedSamples = state.samples.map(countMatchingOpcodes);
  const threeOrMoreOpcodes = testedSamples.filter(x => x >= 3);

  console.log(`There are ${threeOrMoreOpcodes.length} samples that behave like three or more opcodes.`);
};

run();
