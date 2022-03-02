const sounds = {}; // object to hold loaded sounds

function preload() {
  // connect to the p5.party server
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "empty_example",
    "main"
  );

  // begin loading each sound, store them as properties of the sounds object
  sounds.closed_hat = loadSound("assets/closed_hat.wav");
  sounds.floor_tom = loadSound("assets/floor_tom.wav");
  sounds.kick = loadSound("assets/kick.wav");
  sounds.mid_tom = loadSound("assets/mid_tom.wav");
}

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER, CENTER);

  // tell party to run the `onPlaySound()` function when a `playSound` event is received
  partySubscribe("playSound", onPlaySound);
}

function draw() {
  // clear the canvas
  background(220);

  // draw the ui
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
  // check if the mouse is in the upper left quadrant
  if (mouseX < width * 0.5 && mouseY < height * 0.5) {
    // send a `playSound` event with p5.party
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

// callback function that handles the `playSound` event
function onPlaySound(name) {
  console.log("onPlaySound", name);

  // find the sound in the sounds object by name and play it
  sounds[name].play();
}

// Place these comments in the right places in the code above.

// [see above]

/**
 * Q+A
 *
 * In the code above...
 *
 * 1) Does this example use any shared objects?
 *
 * No. It uses partyEmit() and partySubscribe() to communicate, but now state is stored or shared.
 *
 * 2) Do multiple clients write to the same shared object at the same time?
 *
 * No. There aren't any shared objects at all!
 *
 * 3) How does each client know _when_ to play a sound?
 *
 * Sounds are played when the `playSound` event is received.
 *
 * 4) How does each client knowh _which_ sound to play?
 *
 * The `playSound` event data is the name of the sound to play.
 *
 * 5) Is the sound data transmitted from client to client?
 *
 * No. Only the name of the sound is transmitted.
 *
 * 6) How does each client get the sound data?
 *
 * Each client preloads the sound data from a file in preload().
 *
 * 7) Do clients in other rooms or apps receive events from this client?
 *
 * No. Clients only receive events from other clients in the same app and room.
 *
 * 8) Are newly joined clients informed of past events?
 *
 * No. Unlike shared data, events are transient.
 */
