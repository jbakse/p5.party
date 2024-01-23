// example unit
// {
//   x: 0, // grid position
//   y: 0, // grid position
//   selected: false, // is this unit selected?
//   owner: 1, // player 1 or 2
// }

const GRID_ROWS = 16;
const GRID_COLS = 16;
const GRID_SIZE = 32;

const PLAYER_1_COLOR = "#ff0000";
const PLAYER_2_COLOR = "#0000ff";

let setupComplete = false;

let selectionNeighbors = [];

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
  createCanvas(512, 512);
  noStroke();

  if (partyIsHost()) {
    console.log("I am the host!");
    partySetShared(shared, {
      currentPlayer: 1,
      units: populateUnits(),
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

  // find the selected unit
  const selectedUnit = shared.units.find((u) => u.selected);
  if (selectedUnit) {
    let neighbors = listNeighbors(selectedUnit, 3);
    // remove neighbors that are occupied
    selectionNeighbors = neighbors.filter(
      (n) => !shared.units.find((u) => u.x === n.x && u.y === n.y),
    );
  } else {
    selectionNeighbors = [];
  }

  // update dom
  if (shared.currentPlayer === me.role) {
    endTurnButton.show();
  } else {
    endTurnButton.hide();
  }

  // drawing
  background("#667788");

  // draw light checkerboard
  push();
  for (let x = 0; x < GRID_COLS; x++) {
    for (let y = 0; y < GRID_ROWS; y++) {
      if ((x + y) % 2 === 0) {
        fill(0, 0, 0, 10);
        rect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      }
    }
  }
  pop();

  // draw units
  push();
  shared.units.forEach((unit) => {
    const x = unit.x * GRID_SIZE;
    const y = unit.y * GRID_SIZE;

    fill(unit.owner === 1 ? PLAYER_1_COLOR : PLAYER_2_COLOR);
    ellipseMode(CORNER);
    stroke("white");
    strokeWeight(unit.selected ? 5 : 0);
    ellipse(x + 3, y + 3, GRID_SIZE - 6, GRID_SIZE - 6);

    if (unit.moved) {
      fill(0, 0, 0, 100);
      ellipse(x + 3, y + 3, GRID_SIZE - 6, GRID_SIZE - 6);
    }
  });
  pop();

  // draw highlight for neighbors
  push();
  selectionNeighbors.forEach((n) => {
    const x = n.x * GRID_SIZE;
    const y = n.y * GRID_SIZE;
    fill(255, 255, 255, 100);
    rect(x + 3, y + 3, GRID_SIZE - 6, GRID_SIZE - 6, 4);
  });
  pop();

  // draw UI
  push();
  fill("#000");
  textSize(32);
  textAlign(CENTER, CENTER);
  text("PLAYER " + (shared.currentPlayer), width * .5, 30);

  textSize(16);
  textAlign(CENTER, CENTER);
  text(`Role: ${me.role}`, width * .5, height - 30);
  pop();
}

function mousePressed() {
  if (shared.currentPlayer !== me.role) return;

  const m = mouseGridPosition();
  const unit = shared.units.find((u) =>
    u.x === m.x && u.y === m.y && u.owner === me.role && !u.moved
  );
  const neighbor = selectionNeighbors.find((n) => n.x === m.x && n.y === m.y);

  if (unit) {
    // clear all selections
    shared.units.forEach((u) => (u.selected = false));
    unit.selected = true;
  }

  if (neighbor) {
    // move unit to neighbor
    const unit = shared.units.find((u) => u.selected);
    unit.x = neighbor.x;
    unit.y = neighbor.y;
    unit.selected = false;
    unit.moved = true;
  }
  if (!unit && !neighbor) {
    shared.units.forEach((u) => (u.selected = false));
  }
}

function mouseGridPosition() {
  return {
    x: Math.floor(mouseX / GRID_SIZE),
    y: Math.floor(mouseY / GRID_SIZE),
  };
}

// called from draw each player checks if player1 or 2 role is open
// and takes it if currently first inline
function assignPlayers() {
  // if there isn't a player1
  if (!guests.find((p) => p.role === 1)) {
    console.log("need player 1");
    // find the first observer
    const o = guests.find((p) => p.role === "observer");
    console.log("found", o, me, o === me);
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
  // clear moved property on all units
  shared.units.forEach((u) => (u.moved = false));

  if (shared.currentPlayer === 1) {
    shared.currentPlayer = 2;
  } else {
    shared.currentPlayer = 1;
  }
}

function populateUnits() {
  const units = [];

  function createUnit(minX, maxX, minY, maxY, owner) {
    const x = randomInt(minX, maxX);
    const y = randomInt(minY, maxY);
    return { x, y, owner };
  }

  // while there are fewer than 5 units owned by player 1
  while (units.filter((u) => u.owner === 1).length < 5) {
    // create unit
    const unit = createUnit(4, 7, 0, 16, 1);
    // add unit if location not taken
    if (!units.find((u) => u.x === unit.x && u.y === unit.y)) {
      units.push(unit);
    }
  }

  // while there are fewer than 5 units owned by player 2
  while (units.filter((u) => u.owner === 2).length < 5) {
    // create unit
    const unit = createUnit(8, 11, 0, 15, 2);
    // add unit if location not taken
    if (!units.find((u) => u.x === unit.x && u.y === unit.y)) {
      units.push(unit);
    }
  }

  return units;
}

// neighbors returns an array of all the squares within
// manhattan distance of pos
// excludes pos
// exculdes positions outside grid bounds

function listNeighbors(pos, distance = 1) {
  if (!pos) return [];
  if (distance < 1) return [];

  const neighbors = [];
  for (let x = pos.x - distance; x <= pos.x + distance; x++) {
    for (let y = pos.y - distance; y <= pos.y + distance; y++) {
      if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) continue;
      if (manhattanDistance(pos, { x, y }) > distance) continue;
      neighbors.push({ x, y });
    }
  }
  return neighbors;
}

function manhattanDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function randomInt(min, max) {
  return Math.floor(random(min, max));
}
