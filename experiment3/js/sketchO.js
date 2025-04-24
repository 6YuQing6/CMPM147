// sketch.js - purpose and description here

// OPENWORLD

new p5(function (p) {
  /* exported preload, setup, draw, placeTile */

  /* global generateGrid drawGrid */

  let seed = 0;
  let tilesetImage;
  let currentGrid = [];
  let numRows, numCols;
  let tileSize = 16;
  let inc = 0.05;
  let chests = [];

  p.preload = function () {
    tilesetImage = p.loadImage(
      "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
    );
  };

  p.setup = function () {
    let asciiBoxWorld = $("#asciiBox-openworld");
    numCols = parseInt(asciiBoxWorld.attr("cols")) || 0;
    numRows = parseInt(asciiBoxWorld.attr("rows")) || 0;

    const worldCanvas = p.createCanvas(tileSize * numRows, tileSize * numCols);
    worldCanvas.parent("canvas-container-openworld");

    worldCanvas.elt.getContext("2d").imageSmoothingEnabled = false;

    let reseedButton = $("#clicker-openworld");
    reseedButton.click(() => {
      reseed();
    });

    asciiBoxWorld.on("input", () => {
      reparseGrid();
    });

    reseed();
  };

  function drawCloudShadows() {
    const cloudTimeSpeed = 0.00005;
    const cloudThreshold = 0.5;
    const t = p.millis() * cloudTimeSpeed;
    p.noStroke();

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        // sample 3D noise at (x, y, time)
        let n = p.noise(col / 10 + t, row / 10 + t, t);
        let a = p.map(n, 0, 1, 0, 220);
        p.fill(255, a);
        if (n > cloudThreshold) {
          p.rect(col * tileSize, row * tileSize, tileSize, tileSize);
        }
      }
    }
  }

  p.draw = function () {
    p.randomSeed(seed);
    updateChests();
    drawGrid(currentGrid);
    drawChests();
    drawCloudShadows();
    highlightHover();

    // drawNoise();
  };

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
    p.randomSeed(seed);
    p.noiseSeed(seed);
    let seedReport = $("#seedReport-openworld");
    seedReport.text("seed " + seed);
    regenerateGrid();
  }

  function updateAsciiBox() {
    p.select("#asciiBox-openworld").value(gridToString(currentGrid));
  }

  function regenerateGrid() {
    p.select("#asciiBox-openworld").value(
      gridToString(generateGrid(numCols, numRows))
    );
    reparseGrid();
  }

  function reparseGrid() {
    currentGrid = stringToGrid(p.select("#asciiBox-openworld").value());
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
    p.image(
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

  const objects = ["C", "H", "T"];

  function gridCheck(grid, i, j, target) {
    return grid[i] && (grid[i][j] === target || objects.includes(grid[i][j]));
  }

  function tileToBit(i, j, grid, target) {
    if (grid[i][j] !== target) return;

    let t = gridCheck(grid, i - 1, j, target);
    let r = gridCheck(grid, i, j + 1, target);
    let b = gridCheck(grid, i + 1, j, target);
    let l = gridCheck(grid, i, j - 1, target);
    // only sets if all other ones are full
    let tl = t && l && b && r ? gridCheck(grid, i - 1, j - 1, target) : false; // bit 4
    let tr = t && l && b && r ? gridCheck(grid, i - 1, j + 1, target) : false; // bit 5
    let br = t && l && b && r ? gridCheck(grid, i + 1, j + 1, target) : false; // bit 6
    let bl = t && l && b && r ? gridCheck(grid, i + 1, j - 1, target) : false; // bit 7

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
        const dirt = tiles.grass.defaultdark();
        placeTile(i, j, dirt.ti, dirt.tj);
      }
    }
  }

  function drawBorderSlice(grid, i, j, ni, nj) {
    // if this cell *is* target, skip
    let target = grid[ni][nj];
    if (grid[i][j] === target) return;
    // // if neighbor isn’t target, skip
    // if (!gridCheck(grid, i, j, target)) return;

    console.log(target);
    const bit = tileToBit(ni, nj, grid, target);
    console.log(bit);
    const base = tileMap[target].getTile(bit);
    // this draws the little slice *as if* this cell were the target,
    // overlaying it on top of whatever’s already here.
    console.log(base);
    if (base) {
      console.log("PLACING BORDER", i, j);
      placeTile(i, j, base.ti, base.tj);
    }
  }

  function drawBorders(grid, target) {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        let symbol = grid[i][j];
        if (symbol != target) continue;
        // draws neighbor's borders into this slice
        [
          [i - 1, j],
          [i + 1, j],
          [i, j - 1],
          [i, j + 1],
          [i - 1, j + 1],
          [i + 1, j + 1],
          [i - 1, j - 1],
          [i - 1, j - 1],
        ].forEach(([ni, nj]) => {
          if (grid[ni] && grid[ni][nj] && grid[ni][nj] !== symbol) {
            if (tileMap[grid[ni][nj]]) drawBorderSlice(grid, i, j, ni, nj);
          }
        });
      }
    }
  }

  function drawBase(grid, target) {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        // gets ascii symbol
        let symbol = grid[i][j];
        if (symbol != target) continue;
        if (tileMap[symbol]) {
          // if symbol exists
          const bit = tileToBit(i, j, grid, symbol);
          const base = tileMap[symbol].getDefault(bit);
          placeTile(i, j, base.ti, base.tj);
        }
      }
    }
  }

  function drawGrid(grid) {
    drawBackground(grid);
    // first loop - draws all default text

    drawBorders(grid, "-");
    drawBase(grid, "-");
    drawBase(grid, "=");
    drawBase(grid, "~");
    drawBorders(grid, "~");
    drawBorders(grid, "=");

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        // gets ascii symbol
        let symbol = grid[i][j];
        if (objects.includes(symbol)) {
          // if symbol exists
          const bit = tileToBit(i, j, grid, symbol);
          const base = tileMap[symbol].getDefault(bit);
          placeTile(i, j, base.ti, base.tj);
        }
      }
    }
  }

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

  function mousePositiontoGrid() {
    // compute grid‐cell under mouse
    let i = p.floor(p.mouseY / tileSize);
    let j = p.floor(p.mouseX / tileSize);
    // console.log(i, j);
    return { i, j };
  }

  function highlightHover() {
    let { i, j } = mousePositiontoGrid();
    // only if inside bounds
    if (i >= 0 && i < numRows && j >= 0 && j < numCols) {
      p.noStroke();
      p.fill(255, 40);
      p.rect(j * tileSize, i * tileSize, tileSize, tileSize);
    }
  }

  // mousePressed() function is called once after every time a mouse button is pressed
  p.mousePressed = function () {
    let { i, j } = mousePositiontoGrid();
    chests.forEach((c) => {
      if (c.isAt(i, j)) c.open();
    });
  };

  const tiles = {
    lightpinkdungeon: {
      wall: () => ({ ti: p.floor(p.random(1, 5)), tj: 21 }),
      brokenfloor: () => ({
        ti: p.floor(p.random(1, 5)),
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
      wall: () => ({ ti: p.floor(p.random(21, 25)), tj: 21 }),
      brokenfloor: () => ({
        ti: p.floor(p.random(21, 25)),
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
        ti: p.floor(p.random(25, 28)),
        tj: p.floor(p.random(25, 28)),
      }),
    },
    purpledungeon: {
      brokenfloor: () => ({
        ti: p.floor(p.random(11, 15)),
        tj: 22,
      }),
      solidfloor: {
        ti: 10,
        tj: 21,
      },
    },
    treasurechest: () => ({
      ti: p.floor(p.random(0, 3)),
      tj: p.floor(p.random(28, 31)),
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
      defaultlight: () => ({ ti: p.floor(p.random(4)), tj: 16 }),
      defaultdark: () => ({ ti: p.floor(p.random(4)), tj: 16 }),
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
    grass: {
      defaultlight: () => ({ ti: p.floor(p.random(0, 4)), tj: 0 }),
      defaultdark: () => ({ ti: p.floor(p.random(0, 4)), tj: 1 }),
      flat: {
        rightedge: { ti: 4, tj: 1 },
        leftedge: { ti: 6, tj: 1 },
        bottomedge: { ti: 5, tj: 0 },
        topedge: { ti: 5, tj: 2 },
        bottomleftcorner: { ti: 4, tj: 2 },
        bottomrightcorner: { ti: 6, tj: 2 },
        toprightcorner: { ti: 6, tj: 0 },
        topleftcorner: { ti: 4, tj: 0 },
      },
      tall: {
        rightedge: { ti: 9, tj: 1 },
        leftedge: { ti: 11, tj: 1 },
        bottomedge: { ti: 10, tj: 0 },
        topedge: { ti: 10, tj: 2 },
        bottomleftcorner: { ti: 9, tj: 2 },
        bottomrightcorner: { ti: 11, tj: 2 },
        toprightcorner: { ti: 11, tj: 0 },
        topleftcorner: { ti: 9, tj: 0 },
      },
    },
    sand: {
      default: () => ({
        ti: p.floor(p.random(0, 4)),
        tj: 18,
      }),
      flat: {
        rightedge: { ti: 4, tj: 19 },
        leftedge: { ti: 6, tj: 19 },
        bottomedge: { ti: 5, tj: 18 },
        topedge: { ti: 5, tj: 20 },
        bottomleftcorner: { ti: 4, tj: 20 },
        bottomrightcorner: { ti: 6, tj: 20 },
        toprightcorner: { ti: 6, tj: 18 },
        topleftcorner: { ti: 4, tj: 18 },
      },
    },
    water: {
      default: { ti: 17, tj: 18 },
      solid: () => ({
        ti: p.floor(p.random(18, 21)),
        tj: p.random() > 0.5 ? 18 : 20,
      }),
      flat: {
        rightedge: { ti: 12, tj: 19 },
        leftedge: { ti: 14, tj: 19 },
        bottomedge: { ti: 13, tj: 18 },
        topedge: { ti: 13, tj: 20 },
        bottomleftcorner: { ti: 12, tj: 20 },
        bottomrightcorner: { ti: 14, tj: 20 },
        toprightcorner: { ti: 14, tj: 18 },
        topleftcorner: { ti: 12, tj: 18 },
      },
    },
    houses: {
      default: () => ({
        ti: 26,
        tj: p.floor(p.random(0, 4)),
      }),
    },
    trees: {
      green: {
        ti: 14,
        tj: 0,
      },
    },
  };

  const tileMap = {
    _: {
      getDefault() {
        return tiles.purpledirt.defaultlight();
      },
      getTile(bit) {
        const lookup = {
          // // // empty space for corners
          // 3: tiles.emptyspace,
          // 6: tiles.emptyspace,
          // 9: tiles.emptyspace,
          // 12: tiles.emptyspace,
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
        return lookup[bit];
      },
    },
    "-": {
      getDefault() {
        return tiles.grass.defaultlight();
      },
      getTile(bit) {
        const lookup = {
          // // empty space for corners
          // 3: tiles.emptyspace,
          // 6: tiles.emptyspace,
          // 9: tiles.emptyspace,
          // 12: tiles.emptyspace,
          // edges
          7: tiles.grass.tall.leftedge,
          11: tiles.grass.tall.bottomedge,
          13: tiles.grass.tall.rightedge,
          14: tiles.grass.flat.topedge,
          // // corners
          223: tiles.grass.tall.bottomleftcorner,
          239: tiles.grass.tall.bottomrightcorner,
          127: tiles.grass.tall.toprightcorner,
          191: tiles.grass.tall.topleftcorner,
        };
        return lookup[bit];
      },
    },
    ".": {
      getDefault() {
        if (p.random() < 0.8) {
          return tiles.darkpurpledungeon.solidfloor;
        } else {
          return tiles.darkpurpledungeon.brokenfloor();
        }
      },
      getTile(bit) {
        const lookup = {};
        if (lookup[bit]) {
          return lookup[bit];
        } else {
          if (p.random() < 0.8) {
            return tiles.darkpurpledungeon.solidfloor;
          } else {
            return tiles.darkpurpledungeon.brokenfloor();
          }
        }
      },
    },
    "#": {
      getDefault() {
        if (p.random() < 0.15) {
          return tiles.darkpurpledungeon.door();
        } else {
          return tiles.darkpurpledungeon.wall();
        }
        // return { ti: floor(floor(random(21, 25))), tj: floor(random(11, 15)) };
      },
      getTile() {
        return;
      },
    },
    C: {
      getDefault() {
        return tiles.treasurechest();
      },
      getTile() {
        return;
      },
    },
    "~": {
      getDefault() {
        let d = p.random() > 0.5 ? tiles.water.default : tiles.water.solid();
        return d;
      },
      getTile(bit) {
        // const lookup = {
        //   3: tiles.emptyspace,
        //   6: tiles.emptyspace,
        //   9: tiles.emptyspace,
        //   12: tiles.emptyspace,
        //   // edges
        //   7: tiles.water.flat.leftedge,
        //   11: tiles.water.flat.bottomedge,
        //   13: tiles.water.flat.rightedge,
        //   14: tiles.water.flat.topedge,
        //   // // corners
        //   223: tiles.water.flat.bottomleftcorner,
        //   239: tiles.water.flat.bottomrightcorner,
        //   127: tiles.water.flat.toprightcorner,
        //   191: tiles.water.flat.topleftcorner,
        // };
        // return lookup[bit];
        return;
      },
    },
    "=": {
      getDefault() {
        return tiles.sand.default();
      },
      getTile(bit) {
        const lookup = {
          // edges
          7: tiles.sand.flat.leftedge,
          11: tiles.sand.flat.bottomedge,
          13: tiles.sand.flat.rightedge,
          14: tiles.sand.flat.topedge,
          // // corners
          223: tiles.sand.flat.bottomleftcorner,
          239: tiles.sand.flat.bottomrightcorner,
          127: tiles.sand.flat.toprightcorner,
          191: tiles.sand.flat.topleftcorner,
        };

        return lookup[bit];
        return;
      },
    },
    H: {
      getDefault() {
        return tiles.houses.default();
      },
      getTile() {
        return;
      },
    },
    T: {
      getDefault() {
        return tiles.trees.green;
      },
      getTile() {
        return;
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
    generateLandscape();

    // https://p5js.org/reference/p5/noise/
    function generateLandscape() {
      let noiseScale = 0.09;
      let waterPercent = 0.4;
      let sandThreshold = 0.1;
      let sandPercent = waterPercent + sandThreshold;
      let chestPercent = 0.01;
      let housePercent = 0.01;
      let treePercent = housePercent + 0.02;

      // Iterate from top to bottom.
      for (let row = 0; row < numRows; row++) {
        // Iterate from left to right.
        for (let col = 0; col < numCols; col++) {
          // Scale the input coordinates.
          let nj = noiseScale * col;
          let ni = noiseScale * row;

          // Compute the noise value.
          let n = p.noise(nj, ni);
          if (n < waterPercent) grid[row][col] = "~"; // water
          else if (n < sandPercent) {
            let r = p.random();
            if (r < chestPercent) grid[row][col] = "C";
            else grid[row][col] = "="; // sand
          } else {
            let r = p.random();
            if (r < housePercent) grid[row][col] = "H";
            else if (r < treePercent) grid[row][col] = "T";
            else grid[row][col] = "-"; // grass
          }
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
        this.alpha = p.map(this.timer, 20, 0, 255, 0);
        // console.log(this.alpha);
        if (this.timer <= 0) {
          this.state = "gone";
          // replace chest in grid with floor
          if (
            currentGrid[this.row] &&
            currentGrid[this.row][this.col] === "C"
          ) {
            currentGrid[this.row][this.col] = "=";
          }
          updateAsciiBox();
        }
      }
    }

    draw() {
      if (this.state === "gone") return;

      let tile;
      tile = tiles.treasurechest();

      p.push();
      p.tint(255, this.alpha);
      placeTile(this.row, this.col, tile.ti, tile.tj);
      p.pop();
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
});
