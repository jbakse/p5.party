/* eslint-disable */

let me;
let guests;
let isSetup = false; // flag to make sure preloading is done and setup is called

// is there any way to get rid of this?

function preload() {
  party.connect(
    "wss://deepstream-server-1.herokuapp.com",
    "cursors_new",
    "main",
    true // reset the room if empty
  );
  me = party.loadMyShared({ x: 200, y: 200 });
  guests = party.loadGuestShareds();
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  isSetup = true;
}

function mouseMoved(e) {
  if (!isSetup) return;

  // update this guest's cursor position
  me.x = mouseX;
  me.y = mouseY;
}

function draw() {
  background("#ffcccc");

  // draw each guest's cursor
  for (const g of guests) {
    fill("#cc0000");
    ellipse(g.x, g.y, 20, 20);
  }

  // mark this guest's cursor
  fill("#ffffff");
  ellipse(me.x, me.y, 15, 15);
}
