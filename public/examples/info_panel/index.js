let shared;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "info_panel", "main");
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  // set defaults on shared data
  if (partyIsHost()) {
    partySetShared(shared, {
      x: 0,
      y: 0,
    });
  }

  partyToggleInfo(false); // pass false to hide

  createButton("Toggle Info").mousePressed(() => {
    partyToggleInfo(); // pass nothing to toggle
  });

  createButton("Show Info").mousePressed(() => {
    partyToggleInfo(true); // pass true to show
  });

  createButton("Hide Info").mousePressed(() => {
    partyToggleInfo(false); // pass true to show
  });
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
