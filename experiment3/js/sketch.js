// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// Globals
let canvasContainer;
var centerHorz, centerVert;

/* exported preload, setup, draw, placeTile */

/* global generateGrid drawGrid */

let seed = 0;
let tilesetImage;
let currentGrid = [];
let numRows, numCols;
let tileSize = 16;
let inc = 0.05;
let chests = [];

function preload() {
  tilesetImage = loadImage(
    "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
  );
}

function setup() {
  let asciiBoxDungeon = $("#asciiBox");
  let asciiBoxWorld = $("#asciiBox-openworld");
  numCols = parseInt(asciiBoxDungeon.attr("cols")) || 0;
  numRows = parseInt(asciiBoxDungeon.attr("rows")) || 0;

  const dungeonCanvas = createCanvas(tileSize * numRows, tileSize * numCols);
  dungeonCanvas.parent("canvas-container");
  // open-world canvas
  const worldCanvas = createCanvas(tileSize * numRows, tileSize * numCols);
  worldCanvas.parent("canvas-container-openworld");

  dungeonCanvas.elt.getContext("2d").imageSmoothingEnabled = false;
  worldCanvas.elt.getContext("2d").imageSmoothingEnabled = false;

  let reseedButton = $("#clicker");
  reseedButton.click(() => {
    reseed();
  });

  asciiBoxDungeon.on("input", () => {
    reparseGrid();
  });

  asciiBoxWorld.on("input", () => {
    reparseGrid();
  });

  reseed();
}

function drawCloudShadows() {
  const cloudTimeSpeed = 0.00005;
  const cloudThreshold = 0.1;
  const t = millis() * cloudTimeSpeed;
  noStroke();

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      // sample 3D noise at (x, y, time)
      let n = noise(col / 10 + t, row / 10 + t, t);
      let a = map(n, 0, 1, 0, 120);
      fill(255, a);
      if (n > cloudThreshold) {
        rect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }
  }
}

function draw() {
  randomSeed(seed);
  updateChests();
  drawGrid(currentGrid);
  drawChests();
  drawCloudShadows();
  highlightHover();

  // drawNoise();
}

function rebuildChests() {
  chests = Chest.fromGrid(currentGrid);
}

function updateChests() {
  chests.forEach((c) => c.update());
}

function drawChests() {
  chests.forEach((c) => c.draw());
}

function reseed() {
  seed = (seed | 0) + 1109;
  randomSeed(seed);
  noiseSeed(seed);
  let seedReport = $("#seedReport");
  seedReport.text("seed " + seed);
  regenerateGrid();
}

function updateAsciiBox() {
  select("#asciiBox").value(gridToString(currentGrid));
}

function regenerateGrid() {
  select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
  reparseGrid();
}

function reparseGrid() {
  currentGrid = stringToGrid(select("#asciiBox").value());
  rebuildChests();
}

function gridToString(grid) {
  let rows = [];
  for (let i = 0; i < grid.length; i++) {
    rows.push(grid[i].join(""));
  }
  return rows.join("\n");
}

function stringToGrid(str) {
  let grid = [];
  let lines = str.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let row = [];
    let chars = lines[i].split("");
    for (let j = 0; j < chars.length; j++) {
      row.push(chars[j]);
    }
    grid.push(row);
  }
  return grid;
}

function placeTile(i, j, ti, tj) {
  image(
    tilesetImage,
    tileSize * j,
    tileSize * i,
    tileSize,
    tileSize,
    8 * ti,
    8 * tj,
    8,
    8
  );
}

function tileToBit(i, j, grid, target) {
  if (grid[i][j] !== target) return;

  function gridCheck(i, j) {
    return grid[i] && grid[i][j] === target;
  }

  let t = gridCheck(i - 1, j);
  let r = gridCheck(i, j + 1);
  let b = gridCheck(i + 1, j);
  let l = gridCheck(i, j - 1);
  // only sets if all other ones are full
  let tl = t && l && b && r ? gridCheck(i - 1, j - 1) : false; // bit 4
  let tr = t && l && b && r ? gridCheck(i - 1, j + 1) : false; // bit 5
  let br = t && l && b && r ? gridCheck(i + 1, j + 1) : false; // bit 6
  let bl = t && l && b && r ? gridCheck(i + 1, j - 1) : false; // bit 7

  // bitmap configuration
  // [4, 0, 5]
  // [3, ?, 1]
  // [7, 2, 6]

  let index = 0;
  index |= (t ? 1 : 0) << 0; // top
  index |= (r ? 1 : 0) << 1; // right
  index |= (b ? 1 : 0) << 2; // bottom
  index |= (l ? 1 : 0) << 3; // left

  index |= (tl ? 1 : 0) << 4; // top left
  index |= (tr ? 1 : 0) << 5; // top right
  index |= (br ? 1 : 0) << 6; // bottom right
  index |= (bl ? 1 : 0) << 7; // bottom left

  // console.log(
  //   `tile (${i},${j}) = ${index.toString(2).padStart(8, "0")} (${index})`
  // );
  return index;
}

// https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438

// GENERATE GRID

// DRAW GRID

// 3: top + right neigbor
// 6: right + bottom neighbor
// 9: top + left neighbor
// 12: bottom + left neighbor

// // default
// 0: // no neighbors, island
// 15: // all sides surrounded

// // one neighbor, jutting out
// 1: // top neighbor
// 2: // right neighbor
// 4: // bottom neighbor
// 8: // left neighbor

// // in between neighbor, rope
// 5: // top + bottom neighbor
// 10: // right + left neighbor

// // wrapped, one side empty, wall
// 7: // top + right + bottom neighbor
// 11: // top + right + left neighbor
// 13: // top + bottom + left neighbor
// 14: // right + bottom + left neighbor

// 223: // top right corner only empty
// 239 // top left corner only empty
// 127: // bottom left corner only empty
// 191 // btoom right corner only empty

function drawBackground(grid) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      // pick your dirt tile-frame however you like:
      const dirt = tiles.purpledungeon.solidfloor;
      placeTile(i, j, dirt.ti, dirt.tj);
    }
  }
}

function drawGrid(grid) {
  drawBackground(grid);
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      // gets ascii symbol
      let symbol = grid[i][j];
      const tileType = tileMap[symbol];
      if (tileType) {
        const bit = tileToBit(i, j, grid, symbol);
        const tile = tileType.getTile(bit);
        placeTile(i, j, tile.ti, tile.tj);
      } else if (grid[i][j] == ".") {
        placeTile(i, j);
      }
    }
  }
}

function mousePositiontoGrid() {
  // compute grid‐cell under mouse
  let i = floor(mouseY / tileSize);
  let j = floor(mouseX / tileSize);
  // console.log(i, j);
  return { i, j };
}

function highlightHover() {
  let { i, j } = mousePositiontoGrid();
  // only if inside bounds
  if (i >= 0 && i < numRows && j >= 0 && j < numCols) {
    noStroke();
    fill(255, 40);
    rect(j * tileSize, i * tileSize, tileSize, tileSize);
  }
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
  let { i, j } = mousePositiontoGrid();
  chests.forEach((c) => {
    if (c.isAt(i, j)) c.open();
  });
}

const tiles = {
  lightpinkdungeon: {
    wall: () => ({ ti: floor(random(1, 5)), tj: 21 }),
    brokenfloor: () => ({
      ti: floor(random(1, 5)),
      tj: 22,
    }),
    solidfloor: {
      ti: 0,
      tj: 23,
    },
    solidlightfloor: {
      ti: 0,
      tj: 21,
    },
  },
  darkpurpledungeon: {
    wall: () => ({ ti: floor(random(21, 25)), tj: 21 }),
    brokenfloor: () => ({
      ti: floor(random(21, 25)),
      tj: 22,
    }),
    solidfloor: {
      ti: 20,
      tj: 23,
    },
    solidlightfloor: {
      ti: 20,
      tj: 21,
    },
    door: () => ({
      ti: floor(random(25, 28)),
      tj: floor(random(25, 28)),
    }),
  },
  purpledungeon: {
    brokenfloor: () => ({
      ti: floor(random(11, 15)),
      tj: 22,
    }),
    solidfloor: {
      ti: 10,
      tj: 21,
    },
  },
  treasurechest: () => ({
    ti: floor(random(0, 3)),
    tj: floor(random(28, 31)),
  }),
  chests: {
    wood: {
      open: { ti: 0, tj: 28 },
      closed: { ti: 3, tj: 28 },
    },
    silver: {
      open: { ti: 1, tj: 28 },
      closed: { ti: 4, tj: 28 },
    },
    gold: {
      open: { ti: 2, tj: 28 },
      closed: { ti: 5, tj: 28 },
    },
  },
  emptyspace: { ti: 5, tj: 10 },
  purpledirt: {
    defaultlight: () => ({ ti: floor(random(4)), tj: 16 }),
    defaultdark: () => ({ ti: floor(random(4)), tj: 16 }),
    flat: {
      rightedge: { ti: 4, tj: 10 },
      leftedge: { ti: 6, tj: 10 },
      bottomedge: { ti: 5, tj: 9 },
      topedge: { ti: 5, tj: 11 },
      bottomleftcorner: { ti: 4, tj: 11 },
      bottomrightcorner: { ti: 6, tj: 11 },
      toprightcorner: { ti: 6, tj: 9 },
      topleftcorner: { ti: 4, tj: 9 },
    },
    tall: {
      rightedge: { ti: 9, tj: 10 },
      leftedge: { ti: 11, tj: 10 },
      bottomedge: { ti: 10, tj: 9 },
      topedge: { ti: 10, tj: 11 },
      bottomleftcorner: { ti: 9, tj: 11 },
      bottomrightcorner: { ti: 11, tj: 11 },
      toprightcorner: { ti: 11, tj: 9 },
      topleftcorner: { ti: 9, tj: 9 },
    },
  },
};

const tileMap = {
  _: {
    getTile(bit) {
      const lookup = {
        // empty space for corners
        3: tiles.emptyspace,
        6: tiles.emptyspace,
        9: tiles.emptyspace,
        12: tiles.emptyspace,
        // edges
        7: tiles.purpledirt.tall.leftedge,
        11: tiles.purpledirt.tall.bottomedge,
        13: tiles.purpledirt.tall.rightedge,
        14: tiles.purpledirt.flat.topedge,
        // // corners
        223: tiles.purpledirt.tall.bottomleftcorner,
        239: tiles.purpledirt.tall.bottomrightcorner,
        127: tiles.purpledirt.tall.toprightcorner,
        191: tiles.purpledirt.tall.topleftcorner,
      };
      return lookup[bit] ?? tiles.purpledirt.defaultlight();
    },
  },
  ".": {
    getTile(bit) {
      const lookup = {};
      if (lookup[bit]) {
        return lookup[bit];
      } else {
        if (random() < 0.8) {
          return tiles.darkpurpledungeon.solidfloor;
        } else {
          return tiles.darkpurpledungeon.brokenfloor();
        }
      }
    },
  },
  "#": {
    getTile(bit) {
      if (random() < 0.15) {
        return tiles.darkpurpledungeon.door();
      } else {
        return tiles.darkpurpledungeon.wall();
      }
      // return { ti: floor(floor(random(21, 25))), tj: floor(random(11, 15)) };
    },
  },
  C: {
    getTile(bit) {
      return tiles.treasurechest();
    },
  },
};

function generateGrid(numCols, numRows) {
  let grid = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      row.push("_");
    }
    grid.push(row);
  }
  let numDungeons = floor(random(1, 6));
  let rooms = [];
  for (let i = 0; i < numDungeons; i++) {
    let room = generateDungeonRooms();
    rooms.push(room);
  }
  connectRooms(rooms);
  detailDungeons();

  // dungeon room
  function generateDungeonRooms() {
    let margin = 3; // keeps away from walls
    let roomHeight = floor(random(2, numRows / 3));
    let roomWidth = floor(random(4, numCols / 3));
    // start corner (top left)
    let si = floor(random(margin, numRows - margin * 2));
    let sj = floor(random(margin, numCols - margin * 2));
    // prevents overlap a little
    while (grid[si] == "." || grid[sj] == ".") {
      si = floor(random(margin, numRows - margin * 2));
      sj = floor(random(margin, numCols - margin * 2));
    }
    // end corner (bottom right)
    let ei = min(si + roomHeight, numRows - margin);
    let ej = min(sj + roomWidth, numCols - margin);

    for (let i = si; i < ei; i++) {
      for (let j = sj; j < ej; j++) {
        if (random() < 0.03) {
          grid[i][j] = "C";
        } else {
          grid[i][j] = ".";
        }
      }
    }
    // returns center of each dungeons to create paths
    const centerRow = floor(si + roomHeight / 2);
    const centerCol = floor(sj + roomWidth / 2);
    return { si, sj, ei, ej, centerRow, centerCol };
  }

  function detailDungeons() {
    for (let i = 1; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        // removes singular dirt blocks inbetween dungeons
        if (
          grid[i][j] == "_" &&
          grid[i][j - 1] === "." &&
          grid[i][j + 1] === "."
        ) {
          grid[i][j] = ".";
        }
        // draws upper walls
        if (
          (grid[i][j] === "." || grid[i][j] === "C") &&
          grid[i - 1][j] === "_"
        ) {
          grid[i - 1][j] = "#";
        }
      }
    }
  }

  function connectRooms(rooms) {
    let mainroom = rooms[0];
    for (let room of rooms) {
      carveCorridor(mainroom, room);
    }
  }

  // carve an L‑shaped tunnel between two points
  function carveCorridor(room1, room2) {
    const r1 = room1.centerRow;
    const c1 = room1.centerCol;
    const r2 = room2.centerRow;
    const c2 = room2.centerCol;

    if (random() < 0.5) {
      // horizontal then vertical
      for (let c = min(c1, c2); c <= max(c1, c2); c++) {
        grid[r1][c] = ".";
      }
      for (let r = min(r1, r2); r <= max(r1, r2); r++) {
        grid[r][c2] = ".";
      }
    } else {
      // vertical then horizontal
      for (let r = min(r1, r2); r <= max(r1, r2); r++) {
        grid[r][c1] = ".";
      }
      for (let c = min(c1, c2); c <= max(c1, c2); c++) {
        grid[r2][c] = ".";
      }
    }
  }
  return grid;
}

class Chest {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.state = "closed"; // 'closed' | 'opening' | 'gone'
    this.timer = 0;
    this.alpha = 255;
  }

  open() {
    if (this.state === "closed") {
      this.state = "opening";
      this.timer = 10; // 10 frames to "open"
    }
  }

  update() {
    if (this.state === "opening") {
      this.timer--;
      this.alpha = map(this.timer, 20, 0, 255, 0);
      if (this.timer <= 0) {
        this.state = "gone";
        // replace chest in grid with floor
        if (currentGrid[this.row] && currentGrid[this.row][this.col] === "C") {
          currentGrid[this.row][this.col] = ".";
        }
        updateAsciiBox();
      }
    }
  }

  draw() {
    if (this.state === "gone") return;

    let tile;
    tile = tiles.treasurechest();

    push();
    tint(255, this.alpha);
    placeTile(this.row, this.col, tile.ti, tile.tj);
    pop();
  }

  // Check if click hits this chest
  isAt(i, j) {
    return this.row === i && this.col === j;
  }

  // Scans grid and instantiates chest objects
  static fromGrid(grid) {
    const arr = [];
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] === "C") arr.push(new Chest(i, j));
      }
    }
    return arr;
  }
}
