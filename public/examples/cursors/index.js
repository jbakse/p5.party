let me;
let participants;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "cursors", "main1");
  me = partyLoadMyShared();
  participants = partyLoadParticipantShareds();
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  // initialize this participants cursor position
  me.x = 200;
  me.y = 200;
}

function mouseMoved(e) {
  // update this participants cursor position
  me.x = mouseX;
  me.y = mouseY;
}

function draw() {
  background("#ffcccc");

  // draw each participants cursor
  for (const p of participants) {
    if (typeof p.x !== "undefined") {
      fill("#cc0000");
      ellipse(p.x, p.y, 20, 20);
    }
  }

  // mark this participants cursor
  fill("#ffffff");
  ellipse(me.x, me.y, 15, 15);
}
