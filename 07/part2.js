const fs = require('fs');

const log = (...args) => {
  if (!process.env.DEBUG) return;
  console.log(...args);
}

const FILE_NAME = './07/input';
const WORKER_COUNT = 5;
const BASE_STEP_DURATION = 60;

const file = fs.readFileSync(FILE_NAME, 'utf8');

const steps = {};
const stepBlockers = {};
const workers = {};

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

const canBeStarted = completedSteps => step => {
  const blockers = stepBlockers[step];
  if (!blockers || !completedSteps.length) {
    return true;
  }
  const incompleteBlockers = blockers.filter(blocker => (
    !completedSteps.includes(blocker)
  ));
  return incompleteBlockers.length === 0;
}

const resetWorker = () => ({
  currentStep: undefined,
  timeRemaining: undefined
});

const generateWorkers = () => {
  for (let i = 0; i < WORKER_COUNT; i++) {
    workers[i] = resetWorker();
  }
};

const calculateStepLength = step => BASE_STEP_DURATION + (step.charCodeAt(0) - 64);

const isJobsOngoing = () => {
  return Object.keys(workers).filter(id => Boolean(workers[id].currentStep)).length > 0;
}

const run = () => {
  let stepsToDo = [...startingSteps];
  let completedSteps = [];
  let currentSecond = 0;

  while (stepsToDo.length || isJobsOngoing()) {
    log(`Processing second ${currentSecond}..`);
    const workerIds = Object.keys(workers);

    const busyWorkers = workerIds.filter(id => Boolean(workers[id].currentStep));

    busyWorkers.forEach(id => {
      workers[id].timeRemaining--;
    })

    const finishedWorkers = workerIds.filter(id => workers[id].timeRemaining === 0);

    finishedWorkers.forEach(id => {
      const completedStep = workers[id].currentStep;
      completedSteps.push(completedStep);

      const blockers = steps[completedStep] || [];
      const filteredBlockers = blockers.filter(blocker => !stepsToDo.includes(blocker));
      stepsToDo.push(...filteredBlockers);

      workers[id] = resetWorker();
    })

    stepsToDo.sort();
    const startableSteps = stepsToDo.filter(canBeStarted(completedSteps));

    startableSteps.forEach(step => {
      const idleWorkers = workerIds.filter(id => !Boolean(workers[id].currentStep));
      if (!idleWorkers.length) {
        return;
      }
      const newWorker = idleWorkers[0];
      workers[newWorker] = {
        currentStep: step,
        timeRemaining: calculateStepLength(step)
      }
      stepsToDo.splice(stepsToDo.indexOf(step), 1);
    });

    currentSecond++;

    log('Completed steps:', completedSteps);
    log('Steps to do:', stepsToDo);
    log(workers);
    log("\n");
  }

  return currentSecond;
}

generateWorkers();
const timeTaken = run() - 1;

console.log(`All steps finished in ${timeTaken} seconds.`);
