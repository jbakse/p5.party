let nameInput; // ?
let participants; // ?
let my; // ?

function preload() {
  // ?
  partyConnect("wss://deepstream-server-1.herokuapp.com", "sign_up", "main");

  // ?
  participants = partyLoadParticipantShareds();

  // ?
  my = partyLoadMyShared();
}

function setup() {
  createCanvas(400, 400);

  // ?
  nameInput = createInput();

  // ?
  nameInput.input(onNameInput);

  // ?
  my.name = "?";
}

function draw() {
  background(220);

  // ?
  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];

    // ?
    text(p.name, 10, i * 20 + 20);
  }
}

// ?
function onNameInput() {
  // ?
  my.name = nameInput.value();
}

// Place these comments in the right places in the code above.

// load shared objects for all connected clients, including this one
// loop through all the shared objects in participants array
// set the function to be called when the input field is changed
// a shared object for this client
// handler that is called when the input field is changed
// the input field user types into
// array of shared objects, one for each connected client
// load shared object for this connected client
// create an `input` elment on the page
// connect to p5.party server
// update the name value in this client's shared object
// initialize this clients name
// draw the name of the participant to the canvas

/**
 * Q+A
 *
 * In the code above...
 *
 * 1) Is the object refrenced by `my` in the `participants` array?
 *
 * 2) Does more than one client write to the same shared object?
 *
 * 3) Does more than one client read from the same shared object?
 *
 * 4) Do all the clients have the same objects in their `participants` arrays?
 *
 * 5) Do all the clients have the same `my` object?
 *
 * 6) Is it possible that `my.name` will have a value before setup() is called?
 *
 * 7) Is it possible that some of objects in `participants` will have a `name`
 *    set before setup() is called?
 *
 * 8) How many objects will be in the `participants` array when setup()
 *    is called?
 */
