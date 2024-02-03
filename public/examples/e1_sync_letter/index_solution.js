let shared; // declare variable for shared object

function preload() {
  // establish connection to party server
  partyConnect(
    "wss://demoserver.p5party.org", // server name
    "sync_letter", // app name
    "main" // room name
  );

  // load the shared object
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  textAlign(CENTER, CENTER);

  // set/reset shared object properties
  partySetShared(shared, {
    letter: "a",
  });
}

function keyPressed() {
  // set the value of shared.letter to the key pressed
  shared.letter = key;
}

function draw() {
  background("#ffcccc");

  // configure text options
  fill("#000066");
  textFont("Poppins");
  textSize(120);

  //draw the most recent key pressed to the screen
  text(shared.letter, width / 2, height / 2);
}

/**
 * Q+A
 *
 * In the code above:
 *
 * 1) Can all the clients _read_ from the `shared` object?
 *
 * Yes. The data in the shared object is viewable by everyone, it is being used to sync the letter across screens.
 *
 * 2) Can all the clients _write_ to the `shared` object?
 *
 * Yes. All clients are writing the value of the last key pressed to the shared object.
 *
 * 3) Do all clients connect to the same app and room?
 *
 * Yes. They all are connected to the "main" room of th "sync_letter" app.
 *
 * 4) What would happen if the clients connected to different apps or rooms?
 *
 *  They would not be able to share data with each other.
 *
 * 5) Do all the clients load the same shared object?
 *
 * Yes. All clients load the shared object called "shared" in room "main" of app "sync_letter".
 *
 * 6) What would happend if they didn't?
 *
 * They would be unable to share data with each other if they did not load the same shared object.
 *
 * 7) When one client presses a key, will the value of shared.letter change for all connected clients?
 *
 * Yes. Because `shared.letter` is a part of the shared object, its value will be synced to all other clients.
 *
 * 8) What will be the value of `shared.letter` be if no one presses a key?
 *
 * 'a'. Because it was initialized with the value of 'A' in setup.
 *
 * 9) Why does the value of `shared.letter` reset when a new client joins?
 *
 * Because the new client runs `setup()` and the value of `shared.letter` is set to 'A' again. You could use `partyIsHost()` to set this value only when the first client connects.
 *
 */
