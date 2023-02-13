// Play Rock Paper Scissors online
let titleScreen = true;

const signs = ["rock", "paper", "scissors"];
const colors = { player1: "#A44", player2: "#379", observer: "gray" };
const buttons = [];

const imageLib = {}; // object to hold loaded images

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
 * "play" || "result" || "outro"
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
  imageLib.blue_blue = loadImage(`./assets/blue_blue.png`);
  imageLib.blue_wins = loadImage(`./assets/blue_wins.png`);
  imageLib.blue_hand_rock = loadImage(`./assets/blue_hand_rock.png`);
  imageLib.blue_hand_paper = loadImage(`./assets/blue_hand_paper.png`);
  imageLib.blue_hand_scissors = loadImage(`./assets/blue_hand_scissors.png`);
  imageLib.blue_question = loadImage(`./assets/blue_question.png`);

  imageLib.red_red = loadImage(`./assets/red_red.png`);
  imageLib.red_wins = loadImage(`./assets/red_wins.png`);
  imageLib.red_hand_rock = loadImage(`./assets/red_hand_rock.png`);
  imageLib.red_hand_paper = loadImage(`./assets/red_hand_paper.png`);
  imageLib.red_hand_scissors = loadImage(`./assets/red_hand_scissors.png`);
  imageLib.red_question = loadImage(`./assets/red_question.png`);

  imageLib.title_scissors = loadImage(`./assets/title_scissors.png`);
  imageLib.title_paper = loadImage(`./assets/title_paper.png`);
  imageLib.title_rock = loadImage(`./assets/title_rock.png`);

  imageLib.draw = loadImage(`./assets/draw.png`);

  // connect to the party server
  partyConnect("wss://demoserver.p5party.org", "hello_party", "main");

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
      x: width * 0.15,
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
      x: width * 0.85,
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

  if (partyIsHost()) startPlay();
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
  if (titleScreen) {
    drawTitleScreen();
  } else {
    drawGame();
  }
  drawGuests();
}

function drawTitleScreen() {
  background("white");
  wobbleImage(imageLib.title_rock, width * 0.4, height * 0.4, 1, {
    phase: 0,
    amplitude: 5,
    period: 1,
  });
  wobbleImage(imageLib.title_paper, width * 0.5, height * 0.5, 1, {
    phase: 0.33,
    amplitude: 5,
    period: 0.8,
  });
  wobbleImage(imageLib.title_scissors, width * 0.5, height * 0.7, 1, {
    phase: 0.66,
    amplitude: 5,
    period: 0.9,
  });
}

function drawGame() {
  background("white");
  buttons.forEach((b) => b.draw());
  if (shared.gameState === "result") drawResult();
}

function drawResult() {
  if (shared.winner === "player1") {
    wobbleImage(imageLib.red_red, width * 0.5, height * 0.4);
    wobbleImage(imageLib.red_wins, width * 0.5, height * 0.6);
  }
  if (shared.winner === "player2") {
    wobbleImage(imageLib.blue_blue, width * 0.5, height * 0.4);
    wobbleImage(imageLib.blue_wins, width * 0.5, height * 0.6);
  }
  if (shared.winner === "draw") {
    wobbleImage(imageLib.draw, width * 0.5, height * 0.5);
  }
}

function drawGuests() {
  for (let guest of guests) {
    if (!guest.show) continue;

    push();
    translate(guest.x, guest.y);

    stroke(0, 0, 0, 50);
    strokeWeight(5);
    triangle(0, 0, 16, 16, 0, 22);

    stroke("white");
    strokeWeight(2);
    fill(colors[guest.role]);
    triangle(0, 0, 16, 16, 0, 22);

    pop();
  }
}

function stepHost() {
  if (!partyIsHost()) return;

  if (
    shared.gameState === "play" &&
    shared.player1Sign !== undefined &&
    shared.player2Sign !== undefined
  ) {
    startResult();
    setTimeout(() => (shared.gameState = "outro"), 2000);
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
  if (titleScreen) {
    titleScreen = false;
    return;
  }
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
    this.transitionScale = 0;
  }
  draw() {
    const secret = my.role !== this.controller;
    const hover = !secret && dist(this.x, this.y, mouseX, mouseY) < this.radius;
    const colorName = this.controller === "player1" ? "red" : "blue";

    let i;
    if (secret && shared.gameState === "play") {
      i = imageLib[`${colorName}_question`];
    } else {
      i = imageLib[`${colorName}_hand_${this.sign}`];
    }

    if (!this.visible || shared.gameState === "outro") {
      this.transitionScale = lerp(this.transitionScale, 0.0, 0.3);
      wobbleImage(i, this.x, this.y, this.transitionScale, { amplitude: 10 });
    } else if (hover || shared.gameState === "result") {
      this.transitionScale = lerp(this.transitionScale, 1.4, 0.1);
      wobbleImage(i, this.x, this.y, this.transitionScale, { amplitude: 10 });
    } else {
      this.transitionScale = lerp(this.transitionScale, 1, 0.1);
      wobbleImage(i, this.x, this.y, this.transitionScale, { amplitude: 2 });
    }
  }

  mousePressed() {
    if (my.role != this.controller) return;
    if (dist(this.x, this.y, mouseX, mouseY) > this.radius) return;

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

function wobbleImage(i, x = 0, y = 0, s = 1, settings = {}) {
  settings = Object.assign(
    {
      period: 1,
      amplitude: 10,
      phase: 0,
    },
    settings
  );

  push();
  imageMode(CENTER);
  translate(x, y);
  scale(s);

  const a = ((millis() / 1000 + settings.phase) * PI) / settings.period;
  rotate(radians(sin(a) * settings.amplitude));
  image(i, 0, 0);
  pop();
}
