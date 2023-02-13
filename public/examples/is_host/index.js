let shared;

function preload() {
  partyConnect("wss://demoserver.p5party.org", "is_host");
  shared = partyLoadShared("globals", {
    clicks: [],
    startTime: Date.now(),
  });
}

function setup() {
  createCanvas(400, 400);
  noStroke();
}

function draw() {
  background("#006666");
  noStroke();

  // reset the history every 10 seconds
  // we don't want every participant doing this
  // so we can ask the host to handle it
  if (partyIsHost()) {
    const elapsed = Date.now() - shared.startTime;
    if (elapsed > 10000) {
      partySetShared(shared, {
        startTime: Date.now(),
        clicks: [],
      });
    }

    // out put some debugging info
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
