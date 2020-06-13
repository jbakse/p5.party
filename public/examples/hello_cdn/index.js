let shared;
function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "hello_cdn", "main");
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  // set defaults on shared data
  shared.x = shared.x || 0;
  shared.y = shared.y || 0;
}

function mousePressed(e) {
  // write shared dataa
  shared.x = mouseX;
  shared.y = mouseY;
}

function draw() {
  background("#ffcccc");
  fill("#000066");
  // read shared data
  ellipse(shared.x, shared.y, 100, 100);
}
