import DOMCursors from "../dom_cursors/domCursors.js";
import { RoleKeeper, TurnKeeper } from "../role_keeper/roleKeeper.js";

import Grid from "./grid.js";
import { insetRect } from "./shape.js";

//   UNITS
//   col: 0           // grid position
//   row: 0           // grid position
//   owner: "ghosts"  // "ghosts" or "people"
//   selected: false  // is this unit selected?
//   moved: false     // has this unit moved this turn?

const BOARD = new Grid(75, 90, 450, 450, 16, 16);

let setupComplete = false;

let shared;
let me;
let turnKeeper;

let endTurnButton;

let spriteSheet;
let sprites = [];

const tombs = [];

window.preload = () => {
  // connect to the party server
  partyConnect("wss://demoserver.p5party.org", "ghost_tactics");

  shared = partyLoadShared("shared", {
    currentPlayer: 1,
    units: populateUnits(),
    selectionNeighbors: [],
  });
  me = partyLoadMyShared({ placeholder: true });
  spriteSheet = loadImage("sprites.png");
};

window.setup = () => {
  createCanvas(600, 600);

  // add position: relative to the main element
  document.querySelector("main").style.position = "relative";

  // create a button
  endTurnButton = createButton("End Turn");
  endTurnButton.mousePressed(onEndTurn);
  endTurnButton.parent(document.querySelector("main"));
  endTurnButton.position(width * 0.5 - endTurnButton.width * 0.5, height - 30);

  // slice spritesheet
  sprites = spritesFromSheet(spriteSheet);

  // load static map features
  populateGraves();

  // show everyone's cursors
  new DOMCursors(true);
  new RoleKeeper(["ghosts", "people"], "observer");
  turnKeeper = new TurnKeeper(["ghosts", "people"]);

  setupComplete = true;
};

window.draw = () => {
  if (!setupComplete) return;

  // logic
  update();

  // dom
  updateDom();

  // drawing
  noStroke();
  background("#222");
  drawBoard();
  drawGraves();
  drawUnits();

  drawNeighbors();
  drawUI();
};

function update() {}

function updateDom() {
  if (isMyTurn()) {
    endTurnButton.elt.removeAttribute("disabled");
  } else {
    endTurnButton.elt.setAttribute("disabled", true);
  }
}

function isMyTurn() {
  return turnKeeper.getCurrentTurn() === me.role_keeper.role;
}

function drawBoard() {
  push();
  fill("#333");
  for (let x = 0; x < BOARD.cols; x++) {
    for (let y = 0; y < BOARD.rows; y++) {
      const b = insetRect(BOARD.cellBounds(x, y), 3);
      rect(b.left, b.top, b.width, b.height, 4);
    }
  }
  pop();
}

function drawUnits() {
  push();
  ellipseMode(CORNER);
  shared.units.forEach((unit) => {
    const b = BOARD.cellBounds(unit.col, unit.row);
    const ib = insetRect(b, 3);

    // draw unit sprite
    push();
    noSmooth();
    blendMode(ADD);
    const s = unit.owner === "ghosts" ? sprites[0][1] : sprites[1][1];
    const ghostBob = unit.owner === "ghosts" ? sin(frameCount * 0.1) * 2 : 0;
    image(s, ib.left, ib.top + ghostBob, ib.width, ib.height);
    pop();

    // draw selection highlight
    if (unit.selected) {
      push();
      noFill();
      strokeWeight(2);
      stroke(255, 255, 255, 255);
      rect(b.left, b.top, b.width, b.height, 4);
      pop();
    }

    // moved
    if (unit.moved) {
      push();
      fill(0, 0, 0, 100);
      rect(ib.left, ib.top, ib.width, ib.height, 4);
      pop();
    }
  });
  pop();
}

function drawGraves() {
  push();
  noSmooth();
  blendMode(ADD);

  tombs.forEach((t) => {
    const b = insetRect(BOARD.cellBounds(t.col, t.row), 3);
    const s = sprites[1][0];
    image(s, b.left, b.top, b.width, b.height);
  });
  pop();
}

function drawNeighbors() {
  push();
  fill(255, 255, 255, 100);
  shared.selectionNeighbors.forEach((n) => {
    const b = insetRect(BOARD.cellBounds(n.col, n.row), 3);
    rect(b.left, b.top, b.width, b.height, 3);
  });
  pop();
}

function drawUI() {
  push();
  textSize(30);
  textAlign(CENTER, CENTER);

  if (turnKeeper.getCurrentTurn() === me.role_keeper.role) {
    fill(255, 255, 255);
    text("YOUR TURN", width * 0.5, 55);
  } else {
    fill(255, 255, 255, 100);
    const s = turnKeeper.getCurrentTurn().toUpperCase();
    text(`WAITING FOR ${s}`, width * 0.5, 55);
  }

  textSize(16);
  textAlign(CENTER, CENTER);
  if (me.role_keeper.role === "observer") {
    text(`OBSERVER`, width * 0.5, height - 20);
  } else {
    text(`You are the ${me.role_keeper.role}.`, width * 0.5, 20);
  }
  pop();
}

window.mousePressed = () => {
  // stop if its not our turn
  if (turnKeeper.getCurrentTurn() !== me.role_keeper.role) return;

  const m = BOARD.mouseCoord();
  if (!m.inside) return;

  // handle unit clicks
  const clickedUnit = shared.units.find(
    (u) =>
      u.col === m.col &&
      u.row === m.row &&
      u.owner === me.role_keeper.role &&
      !u.moved
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
  // deselect others
  shared.units.forEach((u) => (u.selected = false));
  // select this one
  unit.selected = true;

  // calculate new neighbors
  const range = unit.owner === "ghosts" ? 3 : 4;
  const blocked = [...shared.units];
  if (unit.owner === "people") {
    blocked.push(...tombs);
  }
  shared.selectionNeighbors = BOARD.travelNeighbors(unit, range, blocked);
}

function moveUnit(unit, col, row) {
  unit.col = col;
  unit.row = row;
  unit.selected = false;
  shared.selectionNeighbors = [];
  unit.moved = true;
}

function onEndTurn() {
  if (turnKeeper.getCurrentTurn() !== me.role_keeper.role) return;

  // clear selection, neighbors, and moved
  shared.units.forEach((u) => (u.moved = false));
  shared.units.forEach((u) => (u.selected = false));
  shared.selectionNeighbors = [];

  // switch players
  turnKeeper.nextTurn();
}

function populateUnits() {
  const units = [];

  units.push({ col: 7, row: 10, owner: "people" });
  units.push({ col: 8, row: 11, owner: "people" });

  units.push({ col: 5, row: 4, owner: "ghosts" });
  units.push({ col: 7, row: 4, owner: "ghosts" });
  units.push({ col: 9, row: 4, owner: "ghosts" });
  units.push({ col: 11, row: 4, owner: "ghosts" });
  units.push({ col: 5, row: 6, owner: "ghosts" });
  units.push({ col: 7, row: 6, owner: "ghosts" });
  units.push({ col: 9, row: 6, owner: "ghosts" });
  units.push({ col: 11, row: 6, owner: "ghosts" });

  return units;
}

function populateGraves() {
  for (let col = 2; col <= 14; col += 2) {
    for (let row = 2; row <= 10; row += 2) {
      tombs.push({ col, row });
    }
  }
}

function spritesFromSheet(gfx, w = 8, h = 8) {
  gfx;
  const sprites = [];
  for (let x = 0; x < gfx.width / w; x++) {
    sprites[x] = [];
    for (let y = 0; y < gfx.height / h; y++) {
      const i = createImage(w, h);
      i.copy(gfx, x * w, y * h, w, h, 0, 0, w, h);
      sprites[x][y] = i;
    }
  }
  return sprites;
}
