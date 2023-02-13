let shared; // ?

function preload() {
  // ?
  partyConnect(
    "wss://demoserver.p5party.org",
    "sync_letter", // ?
    "main" // ?
  );

  // ?
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  textAlign(CENTER, CENTER);

  // ?
  partySetShared(shared, {
    letter: "a",
  });
}

function keyPressed() {
  // ?
  shared.letter = key;
}

function draw() {
  background("#ffcccc");

  // ?
  fill("#000066");
  textFont("Poppins");
  textSize(120);

  // ?
  text(shared.letter, width / 2, height / 2);
}

// Place these comments in the right places in the code above.

// draw the most recent key pressed to the screen
// app name
// set/reset shared object properties
// set the value of shared.letter to the key pressed
// configure text options
// room name
// load the shared object
// declare variable for shared object
// establish connection to party server

/**
 * Q+A
 *
 * In the code above:
 *
 * 1) Can all the clients _read_ from the `shared` object?
 *
 * 2) Can all the clients _write_ to the `shared` object?
 *
 * 3) Do all clients connect to the same app and room?
 *
 * 4) What would happen if the clients connected to different apps or rooms?
 *
 * 5) Do all the clients load the same shared object?
 *
 * 6) What would happend if they didn't?
 *
 * 7) When one client presses a key, will the value of shared.letter change for all connected clients?
 *
 * 8) What will be the value of `shared.letter` be if no one presses a key?
 *
 * 9) Why does the value of `shared.letter` reset when a new client joins?
 *
 */
