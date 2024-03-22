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
    units: populateUnits(),
    moveTargets: [],
    fireTargets: [],
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
  endTurnButton.position(width * 0.5 - endTurnButton.width * 0.5, height - 40);

  // slice spritesheet
  sprites = spritesFromSheet(spriteSheet);

  // load static map features
  populateGraves();

  // show everyone's cursors
  new DOMCursors(true);
  // todo: move following to preload
  new RoleKeeper(["ghosts", "people"], "observer");
  turnKeeper = new TurnKeeper(["people", "ghosts"]);

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

  drawMoveTargets();
  drawFireTargets();
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

function drawMoveTargets() {
  push();
  fill(255, 255, 255, 100);
  shared.moveTargets.forEach((t) => {
    const b = insetRect(BOARD.cellBounds(t.col, t.row), 3);
    rect(b.left, b.top, b.width, b.height, 3);
  });
  pop();
}

function drawFireTargets() {
  push();
  fill(255, 0, 0, 100);
  shared.fireTargets.forEach((t) => {
    const b = insetRect(BOARD.cellBounds(t.col, t.row), 3);
    rect(b.left, b.top, b.width, b.height, 3);
  });
  pop();
}

function drawUI() {
  push();
  textSize(30);
  textAlign(CENTER, CENTER);

  if (isMyTurn()) {
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
    text(`OBSERVER`, width * 0.5, 20);
  } else {
    text(`You are the ${me.role_keeper.role}.`, width * 0.5, 20);
  }
  pop();
}

window.mousePressed = () => {
  // stop if its not our turn
  if (!isMyTurn()) return;

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

  // handle move target clicks
  const clickedMoveTarget = shared.moveTargets.find((n) => {
    return n.col === m.col && n.row === m.row;
  });
  if (clickedMoveTarget) {
    moveUnit(
      shared.units.find((u) => u.selected),
      clickedMoveTarget.col,
      clickedMoveTarget.row
    );
    return;
  }

  // handle fire target clicks
  const clickedFireTarget = shared.fireTargets.find((n) => {
    return n.col === m.col && n.row === m.row;
  });
  if (clickedFireTarget) {
    attackTarget(
      shared.units.find((u) => u.selected),
      clickedFireTarget
    );
    return;
  }

  // handle "nothing" clicks
  if (!clickedUnit && !clickedMoveTarget) {
    shared.units.forEach((u) => (u.selected = false));
    shared.moveTargets = [];
  }
};

function selectUnit(unit) {
  // deselect others
  shared.units.forEach((u) => (u.selected = false));
  // clear fire targets
  shared.fireTargets = [];

  // select this one
  unit.selected = true;

  // calculate move targets
  const range = unit.owner === "ghosts" ? 3 : 4;
  const blocked = [...shared.units];
  if (unit.owner === "people") {
    blocked.push(...tombs);
  }
  shared.moveTargets = BOARD.travelNeighbors(unit, range, blocked);
}

function moveUnit(unit, col, row) {
  // clear move targets
  shared.moveTargets = [];

  // move the unit
  unit.col = col;
  unit.row = row;
  unit.moved = true;

  // ghosts don't fire
  if (unit.owner === "ghosts") {
    unit.selected = false;
    return;
  }

  // people do fire
  const range = 1;
  const blocked = [];
  shared.fireTargets = BOARD.travelNeighbors(unit, range, blocked);
}

function attackTarget(unit, target) {
  // find the target
  const targetUnit = shared.units.find(
    (u) => u.col === target.col && u.row === target.row
  );

  if (!targetUnit) return;

  // remove the target
  shared.units = shared.units.filter((u) => u !== targetUnit);

  // clear fire targets
  unit.selected = false;
  shared.fireTargets = [];
}

function onEndTurn() {
  if (!isMyTurn()) return;

  // clear selection, targets, and moved status
  shared.units.forEach((u) => (u.moved = false));
  shared.units.forEach((u) => (u.selected = false));
  shared.moveTargets = [];
  shared.fireTargets = [];

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
