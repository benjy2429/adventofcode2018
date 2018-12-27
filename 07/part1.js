const fs = require('fs');

const log = (...args) => {
  if (!process.env.DEBUG) return;
  console.log(...args);
}

const FILE_NAME = './07/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');

const steps = {};
const stepBlockers = {};

file.split('\n').forEach(instruction => {
  const [_, step1, step2] = instruction.match(/^Step ([A-Z]) must be finished before step ([A-Z]) can begin.$/);

  steps[step1] = [
    ...steps[step1] || [],
    step2
  ];

  stepBlockers[step2] = [
    ...stepBlockers[step2] || [],
    step1
  ];
});

const stepsToProcess = Object.keys(steps);
const blockedSteps = Object.keys(stepBlockers);

const startingSteps = stepsToProcess.filter(step => !blockedSteps.includes(step));

const canBeStarted = (step, completedSteps) => {
  const blockers = stepBlockers[step];
  if (!blockers || !completedSteps.length) {
    return true;
  }
  const incompleteBlockers = blockers.filter(blocker => (
    !completedSteps.includes(blocker)
  ));
  return incompleteBlockers.length === 0;
}

const run = (startingSteps) => {
  let currentSteps = [...startingSteps];
  const stepsOrder = [];

  while (currentSteps.length) {
    log(`Steps to go:`, currentSteps);

    const currentStep = currentSteps[0];

    if (!canBeStarted(currentStep, stepsOrder)) {
      log(`Step ${currentStep} has outstanding blockers!`);
      currentSteps.push(currentSteps.shift());
      continue;
    }

    log(`Processing step ${currentStep}..`);

    stepsOrder.push(currentStep);

    const blockers = steps[currentStep] || [];
    const filteredBlockers = blockers.filter(blocker => !currentSteps.includes(blocker));

    currentSteps = [
      ...currentSteps.slice(1),
      ...filteredBlockers
    ].sort();
  }

  return stepsOrder;
}

const finalOrder = run(startingSteps);

console.log(`Steps should be completed in the order ${finalOrder.join('')}.`);
