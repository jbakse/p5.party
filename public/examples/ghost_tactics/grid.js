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

  // manhattanNeighbors returns an array of all the squares within
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

  // travelNeighbors returns an array of all squares reachable in
  // maxSteps steps or less
  // won't step into blocked squares
  // adapted from https://www.redblobgames.com/pathfinding/a-star/introduction.html
  travelNeighbors(pos, maxSteps = 1, blocked = []) {
    if (!pos) return [];
    // ▼ adjacent places to explore
    const frontier = [];

    // ▼ places we've already explored
    const reached = new Set();

    frontier.push({ pos, steps: 0 });

    while (frontier.length > 0) {
      // look at the next place
      const current = frontier.shift();

      // if its too far away, skip it
      if (current.steps >= maxSteps) continue;

      // find adjacent squares to the current one, rejecting blocked ones
      const neighbors = this.manhattanNeighbors(current.pos, 1, 1).filter(
        (n) => !blocked.some((b) => isSameLoc(b, n))
      );

      // loop through them and add them to the frontier if we haven't already
      // reached them

      neighbors.forEach((next) => {
        if (![...reached].some((r) => isSameLoc(r, next))) {
          frontier.push({ pos: next, steps: current.steps + 1 });
          reached.add(next);
        }
      });
    }

    return Array.from(reached);
  }
}

function isSameLoc(a, b) {
  return a.col === b.col && a.row === b.row;
}

// https://chris3606.github.io/GoRogue/articles/grid_components/measuring-distance.html
function manhattanDistance(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}
