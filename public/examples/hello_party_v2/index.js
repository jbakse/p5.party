let shared;

async function setup() {
  createCanvas(400, 400);
  noStroke();

  // connect to the party server
  await partyConnect("wss://demoserver.p5party.org", "hello_party");

  // load the shared object
  // and provide starting values for the object to be used
  // if there are no clients already connected to the room
  shared = await partyLoadShared("shared", { x: 100, y: 100 });

  partyToggleInfo(true);
}

function mousePressed() {
  // mousePressed() can be called before setup() finishes loading shared
  if (!shared) return;

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
