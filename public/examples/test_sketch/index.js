let shared;

function preload() {
  // connect to the party server
  partyConnect("wss://demoserver.p5party.org", "hello_party");

  // begin loading shared object
  // and provide starting values for the object to be used
  // if there are no clients already connected to the room
  // setup() won't be called until the shared object is loaded
  shared = partyLoadShared("shared", { x: 100, y: 100 });
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  partyWatchShared(shared, "x", onSharedChange, true);
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

function onSharedChange(x) {
  console.log("shared data changed", x);
}
