const WAITING_DURATION = 1000;
const PLAYING_DURATION = 4000;

let shared;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "timer", "main");
  shared = partyLoadShared("globals", {
    gameState: "waiting", // waiting, playing
    startTime: Date.now(),
    displayTime: null,
  });
}

function setup() {
  createCanvas(400, 400);
  noStroke();
}

function draw() {
  // update
  if (partyIsHost()) manageTimer();

  // draw
  background("#006666");

  if (shared.gameState === "waiting") {
    drawWaiting();
  } else if (shared.gameState === "playing") {
    drawPlaying();
  }
}

function drawWaiting() {
  push();
  fill("#f00");
  circle(width / 2, height / 2, 200);
  fill("white");
  textSize(32);
  textAlign(CENTER, CENTER);
  text("WAITING", width / 2, height / 2);
  pop();
}

function drawPlaying() {
  push();
  fill("#0c0");
  circle(width / 2, height / 2, 200);
  fill("white");
  textSize(32);
  textAlign(CENTER, CENTER);
  text("PLAYING", width / 2, height / 2);
  text(shared.displayTime, width / 2, height / 2 + 50);
  pop();
}

function manageTimer() {
  if (shared.gameState === "waiting") {
    const elapsed = Date.now() - shared.startTime;
    if (elapsed > WAITING_DURATION) {
      shared.startTime = Date.now();
      shared.gameState = "playing";
      shared.displayTime = floor(PLAYING_DURATION / 1000) + 1;
    }
  } else if (shared.gameState === "playing") {
    const elapsed = Date.now() - shared.startTime;
    shared.displayTime = floor((PLAYING_DURATION - elapsed) / 1000) + 1;
    if (elapsed > PLAYING_DURATION) {
      shared.startTime = Date.now();
      shared.gameState = "waiting";
      shared.displayTime = "";
    }
  }
}
