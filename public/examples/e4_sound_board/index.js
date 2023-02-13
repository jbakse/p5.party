const sounds = {}; // ?

function preload() {
  // ?
  partyConnect("wss://demoserver.p5party.org", "sound_board");

  // ?
  sounds.closed_hat = loadSound("assets/closed_hat.wav");
  sounds.floor_tom = loadSound("assets/floor_tom.wav");
  sounds.kick = loadSound("assets/kick.wav");
  sounds.mid_tom = loadSound("assets/mid_tom.wav");
}

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER, CENTER);

  // ?
  partySubscribe("playSound", onPlaySound);
}

function draw() {
  // ?
  background(220);

  // ?
  textSize(32);
  text("Click to play!", width / 2, height / 2);

  textSize(16);
  text("close_hat", width * 0.25, height * 0.25);
  text("floor_tom", width * 0.75, height * 0.25);
  text("kick", width * 0.25, height * 0.75);
  text("mid_tom", width * 0.75, height * 0.75);

  noLoop();
}

function mousePressed() {
  // ?
  if (mouseX < width * 0.5 && mouseY < height * 0.5) {
    // ?
    partyEmit("playSound", "closed_hat");
  }
  if (mouseX > width * 0.5 && mouseY < height * 0.5) {
    partyEmit("playSound", "floor_tom");
  }
  if (mouseX < width * 0.5 && mouseY > height * 0.5) {
    partyEmit("playSound", "kick");
  }
  if (mouseX > width * 0.5 && mouseY > height * 0.5) {
    partyEmit("playSound", "mid_tom");
  }
}

// ?
function onPlaySound(name) {
  console.log("onPlaySound", name, sounds);

  // ?
  sounds[name].play();
}

// Place these comments in the right places in the code above.

// tell party to run the `onPlaySound()` function when a `playSound` event is received
// begin loading each sound, store them as properties of the sounds object
// connect to the p5.party server
// clear the canvas
// send a `playSound` event with p5.party
// draw the ui
// callback function that handles the `playSound` event
// object to hold loaded sounds
// check if the mouse is in the upper left quadrant
// find the sound in the sounds object by name and play it

/**
 * Q+A
 *
 * In the code above...
 *
 * 1) Does this example use any shared objects?
 *
 * 2) Do multiple clients write to the same shared object at the same time?
 *
 * 3) How does each client know _when_ to play a sound?
 *
 * 4) How does each client knowh _which_ sound to play?
 *
 * 5) Is the sound data transmitted from client to client?
 *
 * 6) How does each client get the sound data?
 *
 * 7) Do clients in other rooms or apps receive events from this client?
 *
 * 8) Are newly joined clients informed of past events?
 */
