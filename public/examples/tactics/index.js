import Grid from "./grid.js";
import { insetRect } from "./shape.js";
import { assignRoles } from "./partyHacks.js";

// example unit
// {
//   col: 0, // grid position
//   row: 0, // grid position
//   owner: 1, // player 1 or 2
//   selected: false, // is this unit selected?
//   moved: false, // has this unit moved this turn?
// }

const BOARD = new Grid(50, 50, 500, 500, 16, 16);

const PLAYER_1_COLOR = "#55c";
const PLAYER_2_COLOR = "#C44900";

let setupComplete = false;

let shared;
let me;
let guests;

let endTurnButton;

window.preload = () => {
  // connect to the party server
  partyConnect("wss://demoserver.p5party.org", "tactics");

  shared = partyLoadShared("shared", {});
  me = partyLoadMyShared({ placeholder: true });
  guests = partyLoadGuestShareds();
};

window.setup = () => {
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
};

window.draw = () => {
  if (!setupComplete) return;

  // logic
  update();

  // dom
  updateDom();

  // drawing
  background("#9A9B73");
  drawCheckerboard();
  drawUnits();
  drawNeighbors();
  drawUI();
};

function update() {
  assignRoles(guests, me, [1, 2], "observer");
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
        fill(255, 255, 255, 25);
        let b = BOARD.cellBounds(x, y);
        b = insetRect(b, 1);
        rect(b.left, b.top, b.width, b.height, 4);
      }
    }
  }
  pop();
}

function drawUnits() {
  push();
  ellipseMode(CORNER);
  shared.units.forEach((unit) => {
    let b = BOARD.cellBounds(unit.col, unit.row);
    b = insetRect(b, 4);

    // base
    fill(unit.owner === 1 ? PLAYER_1_COLOR : PLAYER_2_COLOR);
    noStroke();
    ellipse(b.left, b.top, b.width, b.height);

    // eligible to move
    if (
      // none selected
      !shared.units.find((u) => u.selected) &&
      !unit.moved &&
      unit.owner === me.role &&
      shared.currentPlayer == me.role
    ) {
      noFill();
      strokeWeight(1);
      stroke(255, 255, 255, 255);
      ellipse(b.left, b.top, b.width, b.height);
    }

    // if selected
    if (unit.selected) {
      noFill();
      strokeWeight(5);
      stroke(255, 255, 255, 255);
      ellipse(b.left, b.top, b.width, b.height);
    }
    // moved
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
  textSize(30);
  textAlign(CENTER, CENTER);

  if (shared.currentPlayer === me.role) {
    text("YOUR TURN", width * 0.5, 25);
  } else {
    fill(0, 0, 0, 100);
    text(`WAITING FOR PLAYER ${shared.currentPlayer}`, width * 0.5, 25);
  }
  textSize(16);
  textAlign(CENTER, CENTER);
  if (me.role === "observer") {
    text(`OBSERVER`, width * 0.5, height - 20);
  } else {
    text(`PLAYER ${me.role}`, width * 0.5, height - 20);
  }
  pop();
}

window.mousePressed = () => {
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
};

function selectUnit(unit) {
  // update selection
  shared.units.forEach((u) => (u.selected = false));
  unit.selected = true;

  // update neighbors
  shared.selectionNeighbors = BOARD.manhattanNeighbors(unit, 0, 3).filter(
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
