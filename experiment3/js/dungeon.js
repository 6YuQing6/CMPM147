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
