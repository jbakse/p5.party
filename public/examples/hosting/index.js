let shared;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "hosting", "main");
  shared = partyLoadShared("globals");
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  // set defaults on shared data
  shared.clicks = shared.clicks || [];
  shared.startTime = shared.startTime || new Date();
  console.log("start as host?", partyIsHost());
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
