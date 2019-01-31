const fs = require('fs');

const FILE_NAME = './13/input';

const TRACK_PIECES = {
  HORIZONTAL: '-',
  VERTICAL: '|',
  CORNER_TOP_RIGHT: '\\',
  CORNER_TOP_LEFT: '/',
  INTERSECTION: '+'
};

const CART_PIECES = {
  UP: '^',
  DOWN: 'v',
  LEFT: '<',
  RIGHT: '>'
};

const TURNS = {
  LEFT: 'LEFT',
  STRAIGHT: 'STRAIGHT',
  RIGHT: 'RIGHT'
};

const state = {
  mapWidth: 0,
  mapHeight: 0,
  map: [],
  carts: [],
  tick: 0
};

const isCartPiece = piece => Object.values(CART_PIECES).includes(piece);

const isIntersection = piece => piece === TRACK_PIECES.INTERSECTION;

const isCornerPiece = piece =>
  piece === TRACK_PIECES.CORNER_TOP_LEFT || piece === TRACK_PIECES.CORNER_TOP_RIGHT;

const getOriginalTrackPiece = piece => {
  if (piece === CART_PIECES.UP || piece === CART_PIECES.DOWN) {
    return TRACK_PIECES.VERTICAL;
  }
  return TRACK_PIECES.HORIZONTAL;
}

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');

  const lines = input.split("\n");

  state.mapHeight = lines.length;

  for (let y = 0; y < state.mapHeight; y++) {
    const line = lines[y];
    const row = [];

    if (!state.mapWidth) {
      state.mapWidth = line.length;
    }

    for (let x = 0; x < state.mapWidth; x++) {
      const piece = line[x];

      const hasCart = isCartPiece(piece);
      const nextCartId = state.carts.length;

      if (hasCart) {
        state.carts.push({
          id: nextCartId,
          direction: piece,
          nextTurn: TURNS.LEFT
        })
      }

      row.push({
        x,
        y,
        piece: hasCart ? getOriginalTrackPiece(piece) : piece,
        cart: hasCart ? nextCartId : undefined
      });
    }
    state.map.push(row);
  }
};

const printMap = () => {
  const mapWithCarts = state.map.map(row => (
    row.map(tile => {
      return tile.cart !== undefined
        ? { ...tile, piece: state.carts[tile.cart].direction }
        : tile
    })
  ));

  mapWithCarts.forEach(line => {
    console.log(line.map(({ piece }) => piece).join(''));
  });
};

const getNextTile = (tile, cart) => {
  const { x, y } = tile;

  switch (cart.direction) {
    case CART_PIECES.UP: {
      return state.map[y - 1][x];
    }
    case CART_PIECES.DOWN: {
      return state.map[y + 1][x];
    }
    case CART_PIECES.LEFT: {
      return state.map[y][x - 1];
    }
    case CART_PIECES.RIGHT: {
      return state.map[y][x + 1];
    }
  }
}

const turnLeft = cart => {
  if (cart.direction === CART_PIECES.UP) {
    cart.direction = CART_PIECES.LEFT;
    return;
  }
  if (cart.direction === CART_PIECES.LEFT) {
    cart.direction = CART_PIECES.DOWN;
    return;
  }
  if (cart.direction === CART_PIECES.DOWN) {
    cart.direction = CART_PIECES.RIGHT;
    return;
  }
  if (cart.direction === CART_PIECES.RIGHT) {
    cart.direction = CART_PIECES.UP;
    return;
  }
}

const turnRight = cart => {
  turnLeft(cart);
  turnLeft(cart);
  turnLeft(cart);
}

const turnCorner = (cornerTile, cart) => {
  if (cart.direction === CART_PIECES.RIGHT || cart.direction === CART_PIECES.LEFT) {
    if (cornerTile.piece === TRACK_PIECES.CORNER_TOP_LEFT) {
      turnLeft(cart);
    } else {
      turnRight(cart);
    }
    return;
  }

  if (cart.direction === CART_PIECES.UP || cart.direction === CART_PIECES.DOWN) {
    if (cornerTile.piece === TRACK_PIECES.CORNER_TOP_LEFT) {
      turnRight(cart);
    } else {
      turnLeft(cart);
    }
    return;
  }
};

const navigateIntersection = cart => {
  if (cart.nextTurn === TURNS.LEFT) {
    turnLeft(cart);
    cart.nextTurn = TURNS.STRAIGHT;
    return;
  }

  if (cart.nextTurn === TURNS.STRAIGHT) {
    cart.nextTurn = TURNS.RIGHT;
    return;
  }

  if (cart.nextTurn === TURNS.RIGHT) {
    turnRight(cart);
    cart.nextTurn = TURNS.LEFT;
    return;
  }
};

const tick = () => {
  state.carts = state.carts.map(cart => ({ ...cart, hasMoved: false }));

  for (let y = 0; y < state.mapHeight; y++) {
    for (let x = 0; x < state.mapWidth; x++) {
      const currentTile = state.map[y][x];
      if (currentTile.cart === undefined) {
        continue;
      }

      const cart = state.carts[currentTile.cart]

      if (cart.hasMoved) {
        continue;
      }

      const nextTile = getNextTile(currentTile, cart);

      if (nextTile.cart !== undefined) {
        state.carts[currentTile.cart].removed = true;
        state.carts[nextTile.cart].removed = true;

        currentTile.cart = undefined;
        nextTile.cart = undefined;

        continue;
      }

      if (isCornerPiece(nextTile.piece)) {
        turnCorner(nextTile, cart);
      }

      if (isIntersection(nextTile.piece)) {
        navigateIntersection(cart);
      }

      nextTile.cart = currentTile.cart;
      currentTile.cart = undefined;
      cart.hasMoved = true;
    }
  }
};

const getCartLocation = cart => {
  let coords;

  state.map.forEach(row => {
    row.forEach(tile => {
      if (tile.cart === cart.id) {
        coords = {
          x: tile.x,
          y: tile.y
        };
      }
    })
  })

  return coords;
}

const run = () => {
  parseInput();
  // printMap();

  while (state.carts.filter(({ removed }) => !removed).length > 1) {
    state.tick++;
    tick();
    // printMap();
  }

  const [lastCart] = state.carts.filter(({ removed }) => !removed);
  const cartLocation = getCartLocation(lastCart);

  console.log(`The last cart stopped at ${cartLocation.x},${cartLocation.y} after ${state.tick} ticks.`);
};

run();
