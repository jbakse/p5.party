let shared = false;
function preload() {}

function setup() {
  createCanvas(400, 400);

  createButton("connect").mousePressed(connectToParty);
}

function connectToParty() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "hello_party",
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

function mousePressed(e) {
  shared.x = mouseX;
  shared.y = mouseY;
}

function draw() {
  if (!shared) {
    background("#666600");
    return;
  }

  background("#ffcccc");
  noStroke();
  fill("#3333cc");
  ellipse(shared.x, shared.y, 100, 100);
}
