let shared;

function preload() {
  partyConnect("wss://demoserver.p5party.org", "empty_example", "main");
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  console.log(shared);
}

function draw() {
  background(220);
}
