let shared;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "is_host", "main");
  shared = partyLoadShared("globals");
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  // use partyIsHost in setup to see if you are the first one in the room
  if (partyIsHost()) {
    shared.clicks = [];
    shared.startTime = new Date();
  }
}

function draw() {
  background("#006666");
  noStroke();

  // reset the history every 10 seconds
  // we don't want every participant doing this
  // so we can ask the host to handle it
  if (partyIsHost()) {
    const elapsed = new Date() - new Date(shared.startTime);
    if (elapsed > 10000) {
      shared.startTime = new Date();
      shared.clicks = [];
    }

    // out put some debuggin info
    fill(255);
    textSize(24);
    textFont("Courier New");
    text("Hosting!", 10, 40);
    text(elapsed / 1000, 10, 80);
  }

  fill("#ffff00");
  for (const p of shared.clicks) {
    ellipse(p.x, p.y, 20, 20);
  }
}

function mousePressed(e) {
  // write shared data
  shared.clicks.push({ x: mouseX, y: mouseY });
}
