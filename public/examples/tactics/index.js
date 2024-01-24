// example unit
// {
//   col: 0, // grid position
//   row: 0, // grid position
//   selected: false, // is this unit selected?
//   owner: 1, // player 1 or 2
// }

class Grid {
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
}

function insetRect(r, inset) {
  return {
    top: r.top + inset,
    left: r.left + inset,
    width: r.width - inset * 2,
    height: r.height - inset * 2,
  };
}

const BOARD = new Grid(50, 50, 500, 500, 16, 16);

const PLAYER_1_COLOR = "#ff0000";
const PLAYER_2_COLOR = "#0000ff";

let setupComplete = false;

let shared;
let me;
let guests;

let endTurnButton;

function preload() {
  // connect to the party server
  partyConnect("wss://demoserver.p5party.org", "tactics");

  shared = partyLoadShared("shared", {});
  me = partyLoadMyShared({ role: "observer" });
  guests = partyLoadGuestShareds();
}

function setup() {
  createCanvas(600, 600);
  noStroke();

  // initialize shared state
  if (partyIsHost()) {
    partySetShared(shared, {
      currentPlayer: 1,
      units: populateUnits(),
      selectionNeighbors: [],
    });
  }

  // create a button
  endTurnButton = createButton("End Turn");
  endTurnButton.mousePressed(onEndTurn);

  setupComplete = true;
}

function draw() {
  if (!setupComplete) return;

  // logic
  assignPlayers();

  // dom
  updateDom();

  // drawing
  background("#667788");
  drawCheckerboard();
  drawUnits();
  drawNeighbors();
  drawUI();
}

function updateDom() {
  if (shared.currentPlayer === me.role) {
    endTurnButton.show();
  } else {
    endTurnButton.hide();
  }
}

function drawCheckerboard() {
  push();
  for (let x = 0; x < BOARD.cols; x++) {
    for (let y = 0; y < BOARD.rows; y++) {
      if ((x + y) % 2 === 0) {
        fill(0, 0, 0, 10);
        const b = BOARD.cellBounds(x, y);
        rect(b.left, b.top, b.width, b.height);
      }
    }
  }
  pop();
}

function drawUnits() {
  push();
  ellipseMode(CORNER);
  shared.units.forEach((unit) => {
    fill(unit.owner === 1 ? PLAYER_1_COLOR : PLAYER_2_COLOR);
    strokeWeight(unit.selected ? 5 : 0);

    stroke("white");
    let b = BOARD.cellBounds(unit.col, unit.row);
    b = insetRect(b, 3);
    ellipse(b.left, b.top, b.width, b.height);
    if (unit.moved) {
      fill(0, 0, 0, 100);
      ellipse(b.left, b.top, b.width, b.height);
    }
  });
  pop();
}

function drawNeighbors() {
  push();
  shared.selectionNeighbors.forEach((n) => {
    let b = BOARD.cellBounds(n.col, n.row);
    b = insetRect(b, 3);

    fill(255, 255, 255, 100);
    rect(b.left, b.top, b.width, b.height, 3);
  });
  pop();
}

function drawUI() {
  push();
  fill("#000");
  textSize(32);
  textAlign(CENTER, CENTER);
  text("PLAYER " + shared.currentPlayer, width * 0.5, 30);

  textSize(16);
  textAlign(CENTER, CENTER);
  text(`Role: ${me.role}`, width * 0.5, height - 30);
  pop();
}

function mousePressed() {
  // stop if its not our turn
  if (shared.currentPlayer !== me.role) return;

  const m = BOARD.mouseCoord();
  if (!m.inside) return;

  // handle unit clicks
  const clickedUnit = shared.units.find(
    (u) => u.col === m.col && u.row === m.row && u.owner === me.role && !u.moved
  );
  if (clickedUnit) {
    selectUnit(clickedUnit);
    return;
  }

  // handle neighbor clicks
  const clickedNeighbor = shared.selectionNeighbors.find((n) => {
    return n.col === m.col && n.row === m.row;
  });
  if (clickedNeighbor) {
    moveUnit(
      shared.units.find((u) => u.selected),
      clickedNeighbor.col,
      clickedNeighbor.row
    );
    return;
  }

  // handle "nothing" clicks
  if (!clickedUnit && !clickedNeighbor) {
    shared.units.forEach((u) => (u.selected = false));
    shared.selectionNeighbors = [];
  }
}

function selectUnit(unit) {
  // update selection
  shared.units.forEach((u) => (u.selected = false));
  unit.selected = true;

  // update neighbors
  shared.selectionNeighbors = manhattanNeighbors(unit, 0, 3).filter(
    (n) => !shared.units.find((u) => u.col === n.col && u.row === n.row)
  );
}

function moveUnit(unit, col, row) {
  unit.col = col;
  unit.row = row;
  unit.selected = false;
  shared.selectionNeighbors = [];
  unit.moved = true;
}

// called from draw each player checks if player1 or 2 role is open
// and takes it if currently first inline
function assignPlayers() {
  // if there isn't a player1
  if (!guests.find((p) => p.role === 1)) {
    console.log("need player 1");
    // find the first observer
    const o = guests.find((p) => p.role === "observer");
    // if thats me, take the role
    if (o === me) o.role = 1;
  }
  if (!guests.find((p) => p.role === 2)) {
    const o = guests.find((p) => p.role === "observer");
    if (o === me) o.role = 2;
  }
}

function onEndTurn() {
  if (shared.currentPlayer !== me.role) return;

  // clear selection, neighbors, and moved
  shared.units.forEach((u) => (u.moved = false));
  shared.units.forEach((u) => (u.selected = false));
  shared.selectionNeighbors = [];

  // switch players
  if (shared.currentPlayer === 1) {
    shared.currentPlayer = 2;
  } else {
    shared.currentPlayer = 1;
  }
}

function populateUnits() {
  const units = [];

  units.push({ col: 6, row: 7, owner: 1 });
  units.push({ col: 7, row: 7, owner: 1 });
  units.push({ col: 8, row: 8, owner: 2 });
  units.push({ col: 9, row: 8, owner: 2 });

  return units;
}

// neighbors returns an array of all the squares within
// manhattan distance of pos
// excludes pos
// exculdes positions outside grid bounds

function manhattanNeighbors(pos, minDist = 1, maxDist = 1) {
  if (!pos) return [];

  const neighbors = [];
  for (let col = pos.col - maxDist; col <= pos.col + maxDist; col++) {
    for (let row = pos.row - maxDist; row <= pos.row + maxDist; row++) {
      if (col < 0 || col >= BOARD.cols || row < 0 || row >= BOARD.rows)
        continue;
      if (manhattanDistance(pos, { col, row }) < minDist) continue;
      if (manhattanDistance(pos, { col, row }) > maxDist) continue;
      neighbors.push({ col, row });
    }
  }
  return neighbors;
}

function manhattanDistance(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

// function randomInt(min, max) {
//   return Math.floor(random(min, max));
// }
