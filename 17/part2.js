const fs = require('fs');

const FILE_NAME = './17/input';
const WATER_SOURCE_X = 500;

const TILE_TYPES = {
  SAND: '.',
  CLAY: '#',
  WATER_SPRING: '+',
  FLOWING_WATER: '|',
  RESTING_WATER: 'o'
}

const state = {
  clayTiles: [],
  limits: {},
  slice: {},
  currentY: 0,
};

const calculateLimits = () => {
  state.clayTiles.sort((a, b) => a.x - b.x);
  state.limits.minX = state.clayTiles[0].x - 1;
  state.limits.maxX = state.clayTiles[state.clayTiles.length - 1].x + 1;

  state.clayTiles.sort((a, b) => a.y - b.y);
  state.limits.minY = state.clayTiles[0].y;
  state.limits.maxY = state.clayTiles[state.clayTiles.length - 1].y;
};

const populateSlice = () => {
  const { minX, maxX, minY, maxY } = state.limits;
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      state.slice[`${x},${y}`] = TILE_TYPES.SAND;
    }
  }

  state.clayTiles.forEach(tile => {
    state.slice[`${tile.x},${tile.y}`] = TILE_TYPES.CLAY;
  });

  state.slice[`${WATER_SOURCE_X},${minY}`] = minY === 0 ? TILE_TYPES.WATER_SPRING : TILE_TYPES.FLOWING_WATER;
}

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');

  input.split("\n").forEach(line => {
    const [_, dimension1, coord1, dimension2, coord2Start, coord2End] = line
      .match(/^(x|y)=(\d+), (x|y)=(\d+)..(\d+)$/);

    const isXFirst = dimension1 === 'x';

    for (i = parseInt(coord2Start); i <= parseInt(coord2End); i++) {
      state.clayTiles.push(
        isXFirst ?
        { x: parseInt(coord1), y: i } :
        { x: i, y: parseInt(coord1) }
      );
    }
  });

  calculateLimits();
  populateSlice();
  state.currentY = state.limits.minY;
};

const renderSlice = () => {
  const rows = [];

  const { minX, maxX, minY, maxY } = state.limits;
  for (let y = minY; y <= maxY; y++) {
    const row = [];
    for (let x = minX; x <= maxX; x++) {
      row.push(state.slice[`${x},${y}`]);
    }
    // console.log(('0'+y).slice(-2), row.join(''));
    rows.push(`${('0'+y).slice(-2)} ${row.join('')}`);
  }
  // console.log();
  fs.writeFileSync('./17/output', rows.join("\n"));
}

const isWaterTile = tile =>
  tile === TILE_TYPES.WATER_SPRING ||
  tile === TILE_TYPES.RESTING_WATER;

const flowSideways = (currentX, currentY) => {
  const leftTiles = [];
  let nextX = currentX - 1;
  let hitLeftEdge = false;
  let foundLeftPathDown = false;

  while (!hitLeftEdge && !foundLeftPathDown) {
    if (nextX < state.limits.minX) {
      hitLeftEdge = true;
    }

    const nextTile = state.slice[`${nextX},${currentY}`];
    const tileBelow = state.slice[`${nextX},${currentY + 1}`];

    if (tileBelow === TILE_TYPES.FLOWING_WATER) {
      foundLeftPathDown = true;
    }

    if (nextTile === TILE_TYPES.SAND) {
      leftTiles.push(nextX);
    }

    if (nextTile === TILE_TYPES.CLAY) {
      hitLeftEdge = true;
    }

    if (nextTile === TILE_TYPES.FLOWING_WATER) {
      leftTiles.push(nextX);
    }

    if (tileBelow === TILE_TYPES.SAND) {
      foundLeftPathDown = true;
    }

    nextX--;
  }

  const rightTiles = [];
  nextX = currentX + 1;
  let hitRightEdge = false;
  let foundRightPathDown = false;

  while (!hitRightEdge && !foundRightPathDown) {
    if (nextX > state.limits.maxX) {
      hitRightEdge = true;
    }

    const nextTile = state.slice[`${nextX},${currentY}`];
    const tileBelow = state.slice[`${nextX},${currentY + 1}`];

    if (tileBelow === TILE_TYPES.FLOWING_WATER) {
      foundRightPathDown = true;
    }

    if (nextTile === TILE_TYPES.SAND) {
      rightTiles.push(nextX);
    }

    if (nextTile === TILE_TYPES.CLAY) {
      hitRightEdge = true;
    }

    if (nextTile === TILE_TYPES.FLOWING_WATER) {
      rightTiles.push(nextX);
    }

    if (tileBelow === TILE_TYPES.SAND) {
      foundRightPathDown = true;
    }

    nextX++;
  }

  const tilesToFlow = [...leftTiles, currentX, ...rightTiles].sort();

  if (foundLeftPathDown || foundRightPathDown) {
    tilesToFlow.forEach(x => {
      state.slice[`${x},${currentY}`] = TILE_TYPES.FLOWING_WATER;
    });

    if (foundLeftPathDown) {
      state.slice[`${tilesToFlow[0]},${currentY + 1}`] = TILE_TYPES.FLOWING_WATER;
    }

    if (foundRightPathDown) {
      state.slice[`${tilesToFlow[tilesToFlow.length - 1]},${currentY + 1}`] = TILE_TYPES.FLOWING_WATER;
    }

    return {};
  }

  if (hitLeftEdge && hitRightEdge) {
    tilesToFlow.forEach(x => {
      state.slice[`${x},${currentY}`] = TILE_TYPES.RESTING_WATER;
    });

    return { restedWater: true };
  }

  return {};
};

const flowWater = () => {
  const yAbove = state.currentY - 1;
  const waterTilesAbove = [];

  for (let x = state.limits.minX; x <= state.limits.maxX; x++) {
     const currentTile = state.slice[`${x},${yAbove}`];
     if (currentTile === TILE_TYPES.FLOWING_WATER) {
       waterTilesAbove.push(x);
     }
  }

  let hasWaterRested = false;

  waterTilesAbove.forEach(waterTileX => {
    const nextTileId = `${waterTileX},${state.currentY}`;
    const nextTile = state.slice[nextTileId];

    if (nextTile === TILE_TYPES.SAND) {
      state.slice[nextTileId] = TILE_TYPES.FLOWING_WATER;
      return;
    }

    if (nextTile === TILE_TYPES.CLAY) {
      const { restedWater } = flowSideways(waterTileX, yAbove);
      hasWaterRested = hasWaterRested || restedWater;
      return;
    }

    if (nextTile === TILE_TYPES.RESTING_WATER) {
      const { restedWater } = flowSideways(waterTileX, yAbove);
      hasWaterRested = hasWaterRested || restedWater;
      return;
    }
  });

  if (hasWaterRested) {
    state.currentY -= 2;
  }
};

const run = () => {
  parseInput();
  // renderSlice();

  while (
    state.currentY <= state.limits.maxY
  ) {
    state.currentY = state.currentY + 1;
    flowWater();

    // renderSlice();
  }

  renderSlice();
  const watertiles = Object.values(state.slice).filter(isWaterTile);

  console.log(`There are ${watertiles.length} tiles that can be reached by water.`);
};

run();
