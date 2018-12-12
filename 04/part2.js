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

  for (let i = currentStart; i < end; i++) {
    const mapId = `${id},${i}`;
    guardSleeps[mapId] = (guardSleeps[mapId] || 0) + 1;
  }
})

const [[sleepInfo]] = Object.entries(guardSleeps).sort((a, b) => {
  return b[1] - a[1];
});

const [_, sleepiestGuard, sleepiestMinute] = sleepInfo.match(/^(\d+),(\d+)$/);

console.log(`Guard #${sleepiestGuard} was sleepier at minute ${sleepiestMinute} than any other guard.`)
console.log(`Guard ID x sleepiest minute = ${sleepiestGuard * sleepiestMinute}.`);
