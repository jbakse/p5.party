let shared;

function preload() {
  // connect to the party server
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "hello_party",
    "main"
  );

  // begin loading shared object
  // setup() won't be called until the shared object is loaded
  // provide default values for shared data
  shared = partyLoadShared("shared", { x: 100, y: 100 });
}

function setup() {
  createCanvas(400, 400);
  noStroke();
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
