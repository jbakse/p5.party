let nameInput; // the input field user types into
let participants; // array of shared objects, one for each connected client
let my; // a shared object for this client

function preload() {
  // connect to p5.party server
  partyConnect("wss://deepstream-server-1.herokuapp.com", "sign_up", "main");

  // load shared objects for all connected clients, including this one
  participants = partyLoadParticipantShareds();

  // load shared object for this connected client
  my = partyLoadMyShared();
}

function setup() {
  createCanvas(400, 400);

  // create a <input> elment on the page
  nameInput = createInput();

  // set the function to be called when the input field is changed
  nameInput.input(onNameInput);
}

function draw() {
  background(220);

  // loop through all the shared objects in participants array
  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];

    // draw the name of the participant to the canvas
    text(p.name, 10, i * 20 + 20);
  }
}

// handler that is called when the input field is changed
function onNameInput() {
  // update the name value in this client's shared object
  my.name = nameInput.value();
}

// Place these comments in the right places in the code above.

// [see above]

/**
 * Q+A
 *
 * In the code above...
 *
 * 1) Is the object refrenced by `my` in the `participants` array?
 *
 * Yes.
 * The participant array has one shared object for each connected client
 * including the connected one.
 *
 * 2) Does more than one client write to the same shared object?
 *
 * No. Clients only write to their own shared object.
 *
 * 3) Does more than one client read from the same shared object?
 *
 * Yes. Every client reads from every object in `participants`.
 *
 * 4) Do all the clients have the same objects in their `participants` arrays?
 *
 * Yes. The `participants` array is kept in sync by p5.party.
 *
 * 5) Do all the clients have the same `my` object?
 *
 * No. `my` is created with partyLoadMyShared() which returns a different
 * shared object to each connected client.
 *
 * 6) Is it possible that `my.name` will have a value before setup() is called?
 *
 * No. `my` will be empty when setup() is called.
 *
 * 7) Is it possible that some of the objects in `participants` will have a
 *    `name` set before setup() is called?
 *
 * Yes. Yes other clients might set their name before this client connects.
 *
 * 8) How many shared objects will be in the `participants` array when setup()
 *    is called?
 *
 * At least 1: the shared object for this client. The total number will depend
 * on how many clients are connected.
 */
