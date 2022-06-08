console.log("%c Reload! \n ", "background: #f00; color: #fff");

let me;
let guests;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "cursors", "main1");
  me = partyLoadMyShared({ x: 200, y: 200 });
  guests = partyLoadGuestShareds();
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  // initialize this guests cursor position
  console.log("me", JSON.stringify(me));
  console.log("guests", JSON.stringify(guests));
  console.log("am i host?", partyIsHost());

  // partyToggleInfo(true);
}

function mouseMoved(e) {
  me.x = mouseX;
  me.y = mouseY;
}

function draw() {
  background("#ffcccc");

  // draw each guests cursor
  for (const p of guests) {
    fill("#cc0000");
    ellipse(p.x, p.y, 20, 20);
  }

  // mark this guests cursor
  fill("#ffffff");
  ellipse(me.x, me.y, 15, 15);
}
