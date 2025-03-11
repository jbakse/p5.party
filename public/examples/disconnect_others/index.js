let myClientId = Math.random(); // generate a unique ID for this client

let shared;
let me;
let guests;

function preload() {
  // connect to the party server
  partyConnect("wss://demoserver.p5party.org", "disconnect_others");

  // begin loading shared object with count property
  shared = partyLoadShared("shared", { count: 0 });
  // load "my" shared object with a placeholder so it will be listed in guests
  me = partyLoadMyShared({ placeholder: true });
  guests = partyLoadGuestShareds();
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  textAlign(CENTER, CENTER);
  partyToggleInfo(true);

  // subscribe to the disconnectOthers event
  partySubscribe("disconnectOthers", (data) => {
    console.log("disconnectOthers event received", data);
    // only disconnect if we're not the sender
    if (data.sender !== myClientId) partyDisconnect();
  });
}

function mousePressed() {
  // emit a disconnectOthers event with our ID as the sender
  partyEmit("disconnectOthers", {
    sender: myClientId,
  });
}

function draw() {
  background("#ffcccc");

  // update the count every 60 frames if we're the host
  if (partyIsHost() && frameCount % 60 === 0) {
    shared.count++;
  }

  // display the count
  fill("#000066");
  textSize(32);
  text("Count: " + shared.count, width / 2, height / 2);

  // display the guest count
  textSize(16);
  text("Guests: " + guests.length, width / 2, height / 2 + 40);
}
