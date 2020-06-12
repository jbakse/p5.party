let shared, host;

function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "empty_example",
    "main"
  );
  shared = partyLoadShared("shared");
  host = partyLoadShared("host");
}

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
