let shared;
function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "hello_watch",
    "main"
  );
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  // set defaults on shared data
  shared.x = shared.x || 0;
  shared.y = shared.y || 0;

  // don't draw every frame
  noLoop();

  // subscribe to data changes, and draw when they happen
  partyWatchShared(shared, onDataChange, true);
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

function onDataChange(newValue) {
  console.log("onDataChange", newValue);
  // draw when the circle moves
  draw();
}
