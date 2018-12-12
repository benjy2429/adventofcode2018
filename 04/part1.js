const fs = require('fs');

process.env.TZ = 'UTC';
const FILE_NAME = './04/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const input = file.split('\n');

const EVENT_TYPES = {
  SLEEP: 1,
  WAKE: 2
};

const EVENT_TYPE_MAPPING = {
  'wakes up': EVENT_TYPES.WAKE,
  'falls asleep': EVENT_TYPES.SLEEP
};

const sortByDate = (a, b) => {
  const [_A, yearA, monthA, dateA, hoursA, minutesA] = a.match(/^\[(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})]/);
  const [_B, yearB, monthB, dateB, hoursB, minutesB] = b.match(/^\[(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})]/);
  return new Date(yearA, monthA, dateA, hoursA, minutesA) - new Date(yearB, monthB, dateB, hoursB, minutesB);
};

const records = [];
let currentId = undefined;

input.sort(sortByDate).map(record => {
  const [_, year, month, date, hours, minutes, event] = record
    .match(/^\[(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})] (.+)$/);

  if (event.includes('#')) {
    currentId = event.match(/#(\d+)/)[1];
  }
  const eventType = EVENT_TYPE_MAPPING[event];

  if (eventType) {
    records.push({
      id: currentId,
      dateTime: new Date(year, month, date, hours, minutes),
      eventType
    });
  }
});

const guardSleeps = {};

let currentStart = undefined;

records.forEach(record => {
  const { id, dateTime, eventType } = record;

  if (eventType === EVENT_TYPES.SLEEP) {
    currentStart = dateTime.getMinutes();
    return;
  }

  const end = dateTime.getMinutes();
  const minutesSlept = [];

  for (let i = currentStart; i < end; i++) {
    minutesSlept.push(i);
  }

  if (guardSleeps[id]) {
    guardSleeps[id].minutesSlept.push(...minutesSlept);
    return;
  };

  guardSleeps[id] = { id, minutesSlept };
})

const [sleepiestGuard] = Object.values(guardSleeps).sort((a, b) =>
  b.minutesSlept.length - a.minutesSlept.length
);

console.log(`Guard #${sleepiestGuard.id} was the sleepiest, spending ${sleepiestGuard.minutesSlept.length} minutes asleep.`)

const sleepiestMinuteForGuard = guardId => {
  const { minutesSlept } = guardSleeps[guardId];
  const minuteFrequency = {};

  minutesSlept.forEach(minute => {
    minuteFrequency[minute] = (minuteFrequency[minute] || 0) + 1;
  });

  const [sleepiestMinute] = Object.keys(minuteFrequency).sort((a, b) =>
    minuteFrequency[b] - minuteFrequency[a]
  );

  return sleepiestMinute;
}

const sleepiestMinute = sleepiestMinuteForGuard(sleepiestGuard.id);

console.log(`The guard was asleep the most during minute ${sleepiestMinute}.`);
console.log(`Guard ID x sleepiest minute = ${sleepiestGuard.id * sleepiestMinute}.`);
