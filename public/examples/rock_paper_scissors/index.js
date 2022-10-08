// Play Rock Paper Scissors online

const signs = ["rock", "paper", "scissors"];
const colors = { player1: "#f33", player2: "#66f", observer: "gray" };
const buttons = [];

let shared;
/**
 * here are the properties in `shared`
 *
 * shared.player1Signs - randomized order of the signs
 * e.g. ["rock", "paper", "scissors"]
 *
 * shared.player2Signs - randomized order of the signs
 * e.g. ["rock", "paper", "scissors]
 *
 * shared.player1Sign - currently selected sign of player1
 * "rock" || "paper" || "scissors" || undefined
 *
 * shared.player2Sign - currently selected sign of player2 || undefined
 * "rock" || "paper" || "scissors" || undefined
 *
 * shared.gameState - high level switch of what stage of the game we are in
 * "play" || "result"
 *
 * shared.winner - the last winner, only valid if gameState === "result"
 * "player1" || "player2" || "draw"
 */

let my, guests;
/**
 * here are the properties in `my` and guests[] objects
 *
 * x - the x position of the cursor
 * y - the y position of the cursor
 * show - whether to show the cursor
 * role - "player1" || "player2" || "observer"
 *
 */

function preload() {
  // connect to the party server
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "hello_party",
    "main"
  );

  shared = partyLoadShared("shared", {});
  my = partyLoadMyShared({ x: 100, y: 100, show: false, role: "observer" });
  guests = partyLoadGuestShareds("guests");
}

function setup() {
  createCanvas(640, 480);
  noStroke();
  cursor("none");

  // left side
  buttons.push(
    new Button({
      x: width * 0.25,
      y: height * 0.25,
      radius: 50,
      visible: true,
      sign: "rock",
      controller: "player1",
    })
  );
  buttons.push(
    new Button({
      x: width * 0.25,
      y: height * 0.5,
      radius: 50,
      visible: true,
      sign: "paper",
      controller: "player1",
    })
  );
  buttons.push(
    new Button({
      x: width * 0.25,
      y: height * 0.75,
      radius: 50,
      visible: true,
      sign: "scissors",
      controller: "player1",
    })
  );

  // right side
  buttons.push(
    new Button({
      x: width * 0.75,
      y: height * 0.25,
      radius: 50,
      visible: true,
      sign: "rock",
      controller: "player2",
    })
  );
  buttons.push(
    new Button({
      x: width * 0.75,
      y: height * 0.5,
      radius: 50,
      visible: true,
      sign: "paper",
      controller: "player2",
    })
  );
  buttons.push(
    new Button({
      x: width * 0.75,
      y: height * 0.75,
      radius: 50,
      visible: true,
      sign: "scissors",
      controller: "player2",
    })
  );

  if (partyIsHost()) {
    startPlay();
  }
}

function mouseMoved() {
  if (pointInRect(mouseX, mouseY, 0, 0, width, height)) {
    my.x = mouseX;
    my.y = mouseY;
    my.show = true;
  } else {
    my.show = false;
  }
}

function draw() {
  // update
  stepHost();
  updateRoles();
  syncUI();

  // draw
  background("black");
  buttons.forEach((b) => b.draw());
  guests.forEach(drawGuest);
  if (shared.gameState === "result") drawResult();
}

function drawGuest(guest) {
  push();
  if (guest.show) {
    fill("#666");
    noStroke();
    if (guest.role === "player1") {
      fill("red");
      stroke("white");
    }
    if (guest.role === "player2") {
      fill("blue");
      stroke("white");
    }
    ellipse(guest.x, guest.y, 20, 20);
  }
  pop();
}

function drawResult() {
  push();
  fill("white");
  textAlign(CENTER, CENTER);
  textSize(32);
  if (shared.winner === "player1") {
    text("Player 1\nWins!", width / 2, height / 2);
  }
  if (shared.winner === "player2") {
    text("Player 2\nWins!", width / 2, height / 2);
  }
  if (shared.winner === "draw") {
    text("Draw!", width / 2, height / 2);
  }
  pop();
}

function stepHost() {
  if (!partyIsHost()) return;

  if (
    shared.gameState === "play" &&
    shared.player1Sign !== undefined &&
    shared.player2Sign !== undefined
  ) {
    startResult();
    setTimeout(startPlay, 3000);
  }
}

function updateRoles() {
  // if there isn't a player1
  if (!guests.find((p) => p.role === "player1")) {
    // find the first observer
    const o = guests.find((p) => p.role === "observer");
    // if thats me, take the role
    if (o === my) o.role = "player1";
  }
  if (!guests.find((p) => p.role === "player2")) {
    const o = guests.find((p) => p.role === "observer");
    if (o === my) o.role = "player2";
  }
}

function startPlay() {
  shared.player1Signs = shuffle(signs);
  shared.player2Signs = shuffle(signs);
  shared.player1Sign = undefined;
  shared.player2Sign = undefined;
  shared.gameState = "play";
}

function startResult() {
  shared.gameState = "result";
  shared.winner = getWinner(shared.player1Sign, shared.player2Sign);
}

function syncUI() {
  // sync the randomized sign order
  buttons[0].sign = shared.player1Signs[0];
  buttons[1].sign = shared.player1Signs[1];
  buttons[2].sign = shared.player1Signs[2];
  buttons[3].sign = shared.player2Signs[0];
  buttons[4].sign = shared.player2Signs[1];
  buttons[5].sign = shared.player2Signs[2];

  // hide buttons when selection made
  buttons[0].visible =
    shared.player1Sign === undefined || shared.player1Sign === buttons[0].sign;
  buttons[1].visible =
    shared.player1Sign === undefined || shared.player1Sign === buttons[1].sign;
  buttons[2].visible =
    shared.player1Sign === undefined || shared.player1Sign === buttons[2].sign;
  buttons[3].visible =
    shared.player2Sign === undefined || shared.player2Sign === buttons[3].sign;
  buttons[4].visible =
    shared.player2Sign === undefined || shared.player2Sign === buttons[4].sign;
  buttons[5].visible =
    shared.player2Sign === undefined || shared.player2Sign === buttons[5].sign;
}

function mousePressed() {
  buttons.forEach((b) => b.mousePressed());
}

function getWinner(player1Sign, player2Sign) {
  if (player1Sign === player2Sign) return "draw";
  if (player1Sign === "rock" && player2Sign === "scissors") return "player1";
  if (player1Sign === "rock" && player2Sign === "paper") return "player2";
  if (player1Sign === "paper" && player2Sign === "rock") return "player1";
  if (player1Sign === "paper" && player2Sign === "scissors") return "player2";
  if (player1Sign === "scissors" && player2Sign === "paper") return "player1";
  if (player1Sign === "scissors" && player2Sign === "rock") return "player2";
}

class Button {
  constructor({ x, y, radius, visible, sign, controller }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.visible = visible;
    this.sign = sign;
    this.controller = controller;
  }
  draw() {
    if (!this.visible) return;
    const secret = my.role !== this.controller;
    const hover = !secret && dist(this.x, this.y, mouseX, mouseY) < this.radius;

    push();
    // circle
    translate(this.x, this.y);
    hover ? fill("#333") : fill("#111");
    ellipse(0, 0, this.radius * 2, this.radius * 2);

    // text
    fill(colors[this.controller]);
    textAlign(CENTER, CENTER);
    textSize(18);
    if (secret && shared.gameState === "play") {
      text("?", 0, 0);
    } else {
      text(this.sign, 0, 0);
    }
    pop();
  }
  mousePressed() {
    if (my.role != this.controller) return;
    if (dist(this.x, this.y, mouseX, mouseY) > this.radius) return;

    console.log("mousePressed", this.controller, my.role, this.sign);
    if (this.controller === "player1") {
      shared.player1Sign = this.sign;
    }
    if (this.controller === "player2") {
      shared.player2Sign = this.sign;
    }
  }
}

function pointInRect(x, y, rx, ry, rw, rh) {
  return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
}
