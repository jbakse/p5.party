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

  // info is hidden by default

  const toggleButton = createButton("Toggle Info").mousePressed(() => {
    partyToggleInfo(); // pass nothing to toggle
  });
  toggleButton.parent(document.querySelector("main"));

  const showButton = createButton("Show Info").mousePressed(() => {
    partyToggleInfo(true); // pass true to show
  });
  showButton.parent(document.querySelector("main"));

  const hideButton = createButton("Hide Info").mousePressed(() => {
    partyToggleInfo(false); // pass false to hide
  });
  hideButton.parent(document.querySelector("main"));
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
