let shared;

function preload() {
  // connect to the party server
  partyConnect("wss://demoserver.p5party.org", "hello_cdn");

  // begin loading shared object
  // setup() won't be called until the shared object is loaded
  shared = partyLoadShared("shared", { x: 0, y: 0 });
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  partyToggleInfo(true);
}

function mousePressed() {
  // write shared data
  shared.x = mouseX;
  shared.y = mouseY;
}

function draw() {
  background("#ffcccc");
  fill("#000066");

  // read shared data
  ellipse(shared.x, shared.y, 100, 100);
}
