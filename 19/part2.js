const fs = require('fs');

const FILE_NAME = './19/input';

const state = {
  registers: [1, 0, 0, 0, 0, 0],
  tests: [],
  instructionPointerRegister: 0,
  instructionPointer: 0,
  iteration: 0
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

  while (currentTest && state.iteration < 30) {
    state.iteration++;

    console.log(state.registers);
    state.registers[state.instructionPointerRegister] = state.instructionPointer;

    const [opcode, a, b, c] = currentTest;
    console.log(state.instructionPointer);
    opcodes[opcode](a, b, c);

    state.instructionPointer = state.registers[state.instructionPointerRegister];
    state.instructionPointer++;
    currentTest = state.tests[state.instructionPointer];
  }
};

// const loopOld = () => {
//   // 4
//   state.registers[5] = 1 === state.registers[4] ? 1 : 0
//   // 5
//   // goto 5 + state.registers[5] // 5 or 6

//   // 6
//   // goto 8

//   // 8
//   state.registers[1] += 1
//   // 9
//   state.registers[5] = state.registers[1] > state.registers[4] ? 1 : 0

//   if (state.registers[5] === 0) {
//     // 11
//     // goto 3
//     return;
//   }

//   // 12
//   state.registers[3] += 1
//   // 13
//   state.registers[5] = state.registers[3] > state.registers[4] ? 1 : 0

//   if (state.registers[5] === 0) {
//     // 15
//     // goto 2
//     state.registers[1] = 1
//     return;
//   }
// };

// const pseudoOld = () => {
//   // 33
//   state.registers[4] = 10551394
//   // 34
//   state.registers[0] = 0
//   // 1
//   state.registers[3] = 1
//   // 2
//   state.registers[1] = 1

//   while (state.registers[5] === 0) {
//     loop();
//     console.log(state.registers);
//   }
//   // 16
//   // goto 257 HALT
// };





// const pseudo1 = () => {
//   // 00
//   goto 17
//   // 17
//   r[4] += 2
//   // 18
//   r[4] *= r[4]
//   // 19
//   r[4] *= 19
//   // 20
//   r[4] *= 11
//   // 21
//   r[5] += 7
//   // 22
//   r[5] *= 22
//   // 23
//   r[5] += 4
//   // 24
//   r[4] += r[5]
//   // 25
//   goto 26 + r[0] // usually 0?

//   // 26
//   goto 1

//   // 01
//   r[3] = 1
//   // 02
//   r[1] = 1
//   // 03
//   r[5] = r[3] * r[1]
//   // 04
//   r[5] = r[5] === r[4] ? 1 : 0
//   // 05
//   goto 6 + r[5] // 6 or 7

//   // 06
//   goto 8

//   // 07
//   r[0] += r[3]
//   // 08
//   r[1] += 1
//   // 09
//   r[5] = r[1] > r[4] ? 1 : 0
//   // 10
//   goto 11 + r[5] // 11 or 12

//   // 11
//   goto 3

//   // 12
//   r[3] += 1
//   // 13
//   r[5] = r[3] > r[4] ? 1 : 0
//   // 14
//   goto 15 + r[5] // 15 or 16

//   // 15
//   goto 2

//   // 16
//   goto 257 HALT
// };



const pseudo2 = () => {
  // 17
  state.registers[4] = 994
  // 21
  state.registers[5] = 158
  // 22
  state.registers[5] *= 22
  // 23
  state.registers[5] += 4
  // 24
  state.registers[4] += state.registers[5]
  // 25
  goto 26 + state.registers[0] // usually 0?

  // 26
  goto 1

  // 01
  state.registers[3] = 1
  // 02
  state.registers[1] = 1
  // 03
  state.registers[5] = state.registers[3] * state.registers[1]
  // 04
  state.registers[5] = state.registers[5] === state.registers[4] ? 1 : 0
  // 05
  goto 6 + state.registers[5] // 6 or 7

  // 06
  goto 8

  // 07
  state.registers[0] += state.registers[3]
  // 08
  state.registers[1] += 1
  // 09
  state.registers[5] = state.registers[1] > state.registers[4] ? 1 : 0
  // 10
  goto 11 + state.registers[5] // 11 or 12

  // 11
  goto 3

  // 12
  state.registers[3] += 1
  // 13
  state.registers[5] = state.registers[3] > state.registers[4] ? 1 : 0
  // 14
  goto 15 + state.registers[5] // 15 or 16

  // 15
  goto 2

  // 16
  goto 257 HALT
};

const run = () => {
  parseInput();
  // runTests();
  pseudo2();

  console.log(`Register 0 contains ${state.registers[0]} after running the test program.`);
};

run();