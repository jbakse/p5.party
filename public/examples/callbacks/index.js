let shared = false;
function preload() {
  // nothing in preload, this example connects later and uses callbacks
  // to know when the connection is ready
}

function setup() {
  console.log("setup");
  createCanvas(400, 400);
  const button = createButton("connect").mousePressed(connectToParty);
  button.parent(document.querySelector("main"));
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
  partyLoadShared("shared", { x: 0, y: 0 }, (s) => {
    console.log("shared object loaded!");
    shared = s;
  });
}

function mousePressed() {
  if (shared) {
    shared.x = mouseX;
    shared.y = mouseY;
  }
}

function draw() {
  if (!shared) {
    background("#ffcccc");
    fill("black");
    text("click 'connect' button", 10, 20);
    return;
  }

  background("#ccffcc");
  noStroke();
  fill("black");
  text("shared loaded", 10, 20);
  fill("#3333cc");
  ellipse(shared.x, shared.y, 100, 100);
}
