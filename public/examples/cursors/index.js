let me;
let participants;
let shared;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "cursors", "main1");
  shared = partyLoadShared("shared");
  me = partyGetMyShared();
  participants = partyGetParticipantShareds();

  console.log("preload", me, participants);
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  console.log("setup");
  me.x = 0;
  me.y = 0;
  console.log("myShared", JSON.stringify(me));
  console.log("participantShareds", JSON.stringify(participants));

  // set defaults on shared data
}

function mouseMoved(e) {
  // write shared dataa
  me.x = mouseX;
  me.y = mouseY;
}

function draw() {
  background("#ffcccc");
  // read shared data

  for (const p of participants) {
    if (p.x) {
      fill("#cc0000");
      ellipse(p.x, p.y, 20, 20);
    }
  }
  fill("#ffffff");
  ellipse(me.x, me.y, 15, 15);
}
