let shared = false;
function preload() {}

function setup() {
  createCanvas(400, 400);
  createButton("connect").mousePressed(connectToParty);
}

function connectToParty() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "callbacks",
    "main",
    () => {
      console.log("connected!");
    }
  );
  partyLoadShared("shared", (s) => {
    console.log("shared object loaded!");
    shared = s;
  });
}

function mousePressed() {
  if (shared) {
    shared.x = mouseX;
    shared.y = mouseY;
  } else {
    console.log("mouse pressed before shared object loaded!");
  }
}

function draw() {
  if (!shared) {
    background("#ffcccc");
    fill("black");
    text("shared not loaded", 10, 20);
    return;
  }

  background("#ccffcc");
  noStroke();
  fill("black");
  text("shared loaded", 10, 20);
  fill("#3333cc");
  ellipse(shared.x, shared.y, 100, 100);
}
