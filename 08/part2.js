const fs = require('fs');

const FILE_NAME = './08/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
let cursor = 0;

const sumMetadata = metadata => metadata.reduce(
  (acc, value) => acc + value,
  0
);

const calculateNodeValue = (nodeMetadata, nodeChildren) => {
  if (!nodeChildren.length) {
    return sumMetadata(nodeMetadata);
  }

  return nodeMetadata.reduce(
    (acc, metadata) => {
      const childNode = nodeChildren[metadata - 1];
      return childNode ? childNode.value + acc : acc;
    },
    0
  );
}

const processNodes = input => {
  const childCount = input[cursor++];
  const metadataCount = input[cursor++];
  const children = [];

  if (childCount > 0) {
    for (let i = 0; i < childCount; i++) {
      children.push(processNodes(input));
    }
  }

  const metadata = [];
  for (let i = 0; i < metadataCount; i++) {
    metadata.push(input[cursor++]);
  }

  const value = calculateNodeValue(metadata, children);

  return {
    metadata,
    value,
    children
  };
}

const run = () => {
  const input = file.split(' ').map(a => parseInt(a));
  return processNodes(input);
}

const nodes = run();
console.log(`The sum of all metadata entries is ${nodes.value}.`);
