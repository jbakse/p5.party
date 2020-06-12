let shared;
function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "test", "main");
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  // remove all properties from shared
  partySetShared(shared, {});
}

function mousePressed(e) {
  // write x and y to shared data all at once
  partySetShared(shared, { x: mouseX, y: mouseY });
}

function keyPressed() {
  partySetShared(shared, { x: width * 0.5, y: height * 0.5 });
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
