let shared;

function preload() {
  partyConnect("wss://demoserver.p5party.org", "click_history");
  shared = partyLoadShared("globals", {
    x: 0,
    y: 0,
    color: "white",
    clickHistory: [],
  });
}

function setup() {
  createCanvas(400, 400);
  noStroke();
}

function draw() {
  background("#ffcccc");

  // read shared data
  fill(shared.color);
  ellipse(shared.x, shared.y, 100, 100);

  fill("#000066");
  for (const p of shared.clickHistory) {
    ellipse(p.x, p.y, 20, 20);
  }
}

function keyPressed() {
  // write shared data
  if (key === " ") {
    shared.clickHistory = [];
    return false;
  }
}

function mousePressed(e) {
  // write shared data
  shared.x = mouseX;
  shared.y = mouseY;
  shared.color = color(random(255), random(255), random(255)).toString();
  shared.clickHistory.push({ x: mouseX, y: mouseY });
}
