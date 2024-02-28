let hostShared, guestShared;

function preload() {
  partyConnect("wss://demoserver.p5party.org", "clicker");
  hostShared = partyLoadShared("hostShared", { clicks: 0 });
  guestShared = partyLoadShared("guestShared", { clicks: 0 });
}

function setup() {
  createCanvas(800, 400);
  noStroke();
}

function mousePressed() {
  if (isRoundOver()) return; // ignore clicks after the game is over

  if (partyIsHost()) {
    hostShared.clicks++;
  } else {
    guestShared.clicks++;
  }
}

function update() {
  // nothing yet
}

function draw() {
  update();

  if (isRoundOver()) {
    drawEndState();
  } else {
    drawGameState();
  }
}

function isRoundOver() {
  return hostShared.clicks >= 20 || guestShared.clicks >= 20;
}

function drawGameState() {
  background("#ffcccc");
  fill("#000066");
  textSize(100);
  textAlign(CENTER, CENTER);
  text(hostShared.clicks, 200, 200);
  text(guestShared.clicks, 600, 200);
}

function drawEndState() {
  background("black");
  fill("#FFA500");
  textSize(100);
  textAlign(CENTER, CENTER);
  text(hostShared.clicks, 200, 200);
  text(guestShared.clicks, 600, 200);
}
