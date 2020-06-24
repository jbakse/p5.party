let me;
let participants;
let shared;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "cursors", "main1");
  shared = partyLoadShared("shared");
  me = partyLoadMyShared();
  participants = partyLoadParticipantShareds();
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  console.log("setup");

  console.log("partyIsHost()", partyIsHost());
  if (partyIsHost()) {
    // if partyIsHost is true, this client is the first one in the room
    console.log("Participants.length should be 1:", participants.length === 1);
    console.log("me should equal participants[0]", me === participants[0]);
    me.x = 200;
    me.y = 200;
  } else {
    console.log("Participants.length should be > 1: ", participants.length > 1);
    console.log(
      "participants[0].x should be defined",
      typeof participants[0].x !== "undefined"
    );
    me.x = 0;
    me.y = 0;
  }
  console.log("me", JSON.stringify(me));
  console.log("participants", JSON.stringify(participants));
}

function mouseMoved(e) {
  // write shared data
  me.x = mouseX;
  me.y = mouseY;
}

function draw() {
  background("#ffcccc");
  // read shared data

  for (const p of participants) {
    if (typeof p.x !== "undefined") {
      fill("#cc0000");
      ellipse(p.x, p.y, 20, 20);
    }
  }
  fill("#ffffff");

  ellipse(me.x, me.y, 15, 15);
}
