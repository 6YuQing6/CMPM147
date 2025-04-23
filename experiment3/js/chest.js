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

  update(currentGrid) {
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
