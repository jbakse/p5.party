let shared;

function preload() {
  partyConnect("wss://demoserver.p5party.org", "hello_class");
  shared = partyLoadShared("shared", { obj: { clicks: 0 } });
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  partyToggleInfo(true);
  // noLoop();
  frameRate(2);

  Object.defineProperty(shared.obj, "local", {
    enumerable: false,
    writable: true,
    value: 0,
  });
}

function draw() {
  console.log(JSON.stringify(shared.obj));
  console.log(shared.obj.local);
}

function mousePressed() {
  shared.obj.clicks++;
  shared.obj.local++;
}

function keyPressed() {}
