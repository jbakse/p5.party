export default class Grid {
  constructor(top, left, width, height, rows, cols) {
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
    this.rows = rows;
    this.cols = cols;
    this.cellWidth = width / cols;
    this.cellHeight = height / rows;
  }

  mouseCoord() {
    return {
      col: Math.floor((mouseX - this.left) / this.cellWidth),
      row: Math.floor((mouseY - this.top) / this.cellHeight),
      inside:
        mouseX >= this.left &&
        mouseY >= this.top &&
        mouseX < this.left + this.width &&
        mouseY < this.top + this.height,
    };
  }

  cellBounds(col, row) {
    return {
      left: col * this.cellHeight + this.left,
      top: row * this.cellWidth + this.top,
      width: this.cellWidth,
      height: this.cellHeight,
    };
  }

  // neighbors returns an array of all the squares within
  // manhattan distance of pos
  // excludes pos
  // exculdes positions outside grid bounds

  manhattanNeighbors(pos, minDist = 1, maxDist = 1) {
    if (!pos) return [];

    const neighbors = [];
    for (let col = pos.col - maxDist; col <= pos.col + maxDist; col++) {
      for (let row = pos.row - maxDist; row <= pos.row + maxDist; row++) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows)
          continue;
        if (manhattanDistance(pos, { col, row }) < minDist) continue;
        if (manhattanDistance(pos, { col, row }) > maxDist) continue;
        neighbors.push({ col, row });
      }
    }
    return neighbors;
  }
}

function manhattanDistance(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}
