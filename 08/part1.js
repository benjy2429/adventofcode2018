const fs = require('fs');

const FILE_NAME = './08/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const nodes = [];
let cursor = 0;

const createNode = metadata => {
  nodes.push(metadata);
};

const processNodes = input => {
  const childCount = input[cursor++];
  const metadataCount = input[cursor++];

  if (childCount > 0) {
    for (let i = 0; i < childCount; i++) {
      processNodes(input);
    }
  }

  const metadata = [];
  for (let i = 0; i < metadataCount; i++) {
    metadata.push(input[cursor++]);
  }

  createNode(metadata);
}

const run = () => {
  const input = file.split(' ').map(a => parseInt(a));
  processNodes(input);
}

const sumMetadata = () => {
  return nodes.reduce(
    (acc, metadata) => {
      metadata.forEach(data => {
        acc += data;
      });
      return acc;
    },
    0
  );
}

run();
console.log(nodes);
console.log(`The sum of all metadata entries is ${sumMetadata()}.`);
