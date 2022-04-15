let shared;
function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "set_shared", "main");
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  // remove all properties from shared
  partySetShared(shared, {});
}

function mousePressed(e) {
  // replace all properties in shared
  partySetShared(shared, { x: mouseX, y: mouseY });
}

function keyPressed() {
  // remove all properties from shared
  partySetShared(shared, {});
}

function draw() {
  // check if shared has a property called x
  if (typeof shared.x === "undefined") {
    background("#ffcccc");
  } else {
    background("#ccffcc");
    fill("#000066");
    ellipse(shared.x, shared.y, 100, 100);
  }
}
