// get the room name from the query string
const room = new URLSearchParams(location.search).get("room");
console.log("room:", room);

if (room) {
  document.getElementById("room").value = room;
}

let shared;

function preload() {
  if (room) {
    partyConnect("wss://demoserver.p5party.org", "select_room", room);
    shared = partyLoadShared("shared", { x: 0, y: 0 });
  }
}

function setup() {
  createCanvas(400, 400);
  noStroke();
}

function draw() {
  if (room) {
    background("#ffcccc");
    fill("#000066");
    ellipse(shared.x, shared.y, 100, 100);
  } else {
    background("#ffcccc");
    noStroke();
    fill("white");
    textAlign(CENTER);
    text("Choose a room", 200, 200);
  }
}

function mousePressed() {
  if (!room) return;

  shared.x = mouseX;
  shared.y = mouseY;
}
