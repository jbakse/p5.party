// import { Rect, intersects } from "./shape.js";
/*eslint complexity: ["error", 30]*/

const roundLength = 10000;
const drawCursors = false;
let shared;
let me;
let guests;

window.preload = () => {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "cover_up", "main");
  shared = partyLoadShared("shared");
  me = partyLoadMyShared();
  guests = partyLoadGuestShareds();
};

window.setup = () => {
  createCanvas(400, 400);
  noStroke();

  if (partyIsHost()) {
    startRound(1);
  }

  me.id = random();
  me.tokenPos = false;
  me.cursorPos = false;
  me.tokenColor = "black";
};

window.draw = () => {
  if (partyIsHost()) stepHost();
  me.cursorPos = { x: mouseX, y: mouseY };

  // draw background
  background("#9f9");

  // draw grid
  noStroke();
  fill("#090");
  for (let y = 50; y < 400; y += 50) {
    for (let x = 50; x < 400; x += 50) {
      ellipse(x, y, 3, 3);
    }
  }

  // draw squares
  if (shared.squares.length) {
    stroke("#000");
    strokeWeight(2);
    fill("#f9f");
    rectMode(CENTER);
    shared.squares.forEach((square) => {
      rect(square.col * 50 + 25, square.row * 50 + 25, 20, 20, 2);
    });
  }

  // draw token
  if (shared.state === "play") {
    noStroke();
    if (me.tokenPos) {
      fill(me.tokenColor);
      ellipse(me.tokenPos.col * 50 + 25, me.tokenPos.row * 50 + 25, 50, 50);
    } else {
      const pos = getMouseSquare();
      fill("#090");
      ellipse(pos.col * 50 + 25, pos.row * 50 + 25, 50, 50);
    }
  }

  // draw results
  if (shared.state === "reveal") {
    for (const p of guests) {
      if (p.tokenPos) {
        fill(p.tokenColor);
        noStroke();

        ellipse(p.tokenPos.col * 50 + 25, p.tokenPos.row * 50 + 25, 50, 50);
      }
    }
  }

  // draw cursors
  if (drawCursors) {
    for (const p of guests) {
      if (p.id !== me.id && p.cursorPos) {
        fill("#000");
        stroke("#fff");
        strokeWeight(1.5);
        ellipse(p.cursorPos.x, p.cursorPos.y, 8, 8);
      }
    }
  }

  // draw time
  if (shared.state === "play" && shared.remainingTime > 0) {
    fill("black");
    textAlign(CENTER);
    textSize(30);
    text(shared.remainingTime, 100, 30);
  }

  // draw commit count
  if (shared.state === "play" && shared.remainingTime > 0) {
    fill("black");
    textAlign(CENTER);
    textSize(30);
    const commited = guests.filter((p) => p.tokenPos).length;
    if (commited < guests.length) {
      text(`${commited}/${guests.length}`, 300, 30);
    }
  }

  // draw round
  if (shared.state === "play") {
    noStroke();
    fill("black");
    textAlign(CENTER);
    textSize(30);
    text(shared.round, 200, 390);
  }

  // draw win/lose
  if (shared.state === "reveal") {
    noStroke();
    fill("black");
    textAlign(CENTER);
    textSize(30);
    text(shared.revealMessage, 200, 390);
  }
};

window.mouseClicked = () => {
  if (shared.state === "play" && !me.tokenPos) {
    me.tokenPos = getMouseSquare();
  }
};

window.keyPressed = () => {
  if (key === "r") {
    startRound(1);
  }
};

function stepHost() {
  if (shared.state === "play") {
    const elapsed = new Date() - new Date(shared.startTime);
    shared.remainingTime = ceil((roundLength - elapsed) / 1000);
    if (elapsed > roundLength) {
      startReveal();
    }
    if (guests.every((p) => p.tokenPos)) {
      startReveal();
    }
  }
}

function startReveal() {
  shared.state = "reveal";

  // check if every square has a paticipant's token on it.
  const win = shared.squares.every((s) =>
    guests.find((p) => p.tokenPos.col === s.col && p.tokenPos.row === s.row)
  );

  // set win/lose message
  shared.revealMessage = win ? "Round Win!" : "Round Lose!";

  // start over on loss
  if (!win) shared.round = 0;

  // wait before moving to next round
  setTimeout(startRound, 2000);
}

function startRound(round) {
  // set round number
  if (round) {
    shared.round = round;
  } else {
    shared.round++;
  }

  // place squares
  const difficulty = min(shared.round, guests.length);
  shared.squares = [];
  for (let i = 0; i < difficulty; i++) {
    shared.squares.push({
      col: floor(random(1, 7)),
      row: floor(random(1, 7)),
    });
  }

  // reset guests
  guests.forEach((p) => (p.tokenPos = false));

  // start the timer
  shared.startTime = new Date();
  shared.remainingTime = ceil(roundLength / 1000);

  // start playing
  shared.state = "play";
}

function getMouseSquare() {
  const col = constrain(floor(mouseX / 50), 0, 7);
  const row = constrain(floor(mouseY / 50), 0, 7);
  return { col, row };
}
