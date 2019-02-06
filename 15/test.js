const run = require('./part1');

const tests = [
  {
    input: '15/input.reddit1',
    expected: 13400
  },
  {
    input: '15/input.reddit2',
    expected: 13987
  },
  {
    input: '15/input.reddit3',
    expected: 10325
  },
  {
    input: '15/input.reddit4',
    expected: 10804
  },
  {
    input: '15/input.reddit5',
    expected: 10620
  },
  {
    input: '15/input.reddit6',
    expected: 16932
  },
  {
    input: '15/input.reddit7',
    expected: 10234
  },
  {
    input: '15/input.reddit8',
    expected: 10430
  },
  {
    input: '15/input.reddit9',
    expected: 12744
  },
  {
    input: '15/input.reddit10',
    expected: 14740
  },
  {
    input: '15/input.example1',
    expected: 27730
  },
  {
    input: '15/input.example2',
    expected: 36334
  },
  {
    input: '15/input.example3',
    expected: 39514
  },
  {
    input: '15/input.example4',
    expected: 27755
  },
  {
    input: '15/input.example5',
    expected: 28944
  },
  {
    input: '15/input.example6',
    expected: 18740
  },
  {
    input: '15/input.move',
    expected: 27828
  },
  {
    input: '15/input.moveleft',
    expected: 10030
  },
  {
    input: '15/input.moveright',
    expected: 10234
  },
  {
    input: '15/input.wall',
    expected: 18468
  },
];

const filter = process.argv[2];

const runTests = tests.filter(
  (test, index) => !filter || parseInt(filter) === index
).map(
  (test, index) => ({ ...test, id: index, passed: run(test.input) === test.expected })
);

console.log(runTests.filter(test => !test.passed));

console.log(`${runTests.filter(test => test.passed).length} / ${runTests.length} passed`);
