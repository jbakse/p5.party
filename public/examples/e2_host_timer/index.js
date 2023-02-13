// ?
let shared;

function preload() {
  // ?
  partyConnect("wss://demoserver.p5party.org", "host_timer", "main");

  // ?
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  textAlign(CENTER, CENTER);

  // ?
  frameRate(60);

  // ?
  console.log("hi1");
  if (partyIsHost()) {
    console.log("hi2");
    // ?
    partySetShared(shared, { circles: [], timer: 5 });
  }
}

function mousePressed() {
  // ?
  shared.circles.push({ x: mouseX, y: mouseY });
}

function draw() {
  background("#ffcccc");
  fill("#000066");

  // ?
  if (partyIsHost()) {
    // ?
    if (frameCount % 60 === 0) {
      shared.timer--;
    }

    // ?
    if (shared.timer === 0) {
      partySetShared(shared, { circles: [], timer: 5 });
    }
  }

  // ?
  for (const circle of shared.circles) {
    // ?
    ellipse(circle.x, circle.y, 20, 20);
  }

  // ?
  textSize(30);
  text(shared.timer, width / 2, 40);
}

// Place these comments in the right places in the code above.

// iterate through all coordinates in the shared circles array
// set frameRate to 60 frames per second
// check if this client is the host
// check if this client is the host
// push mouse coordinates into the `shared.circles` array
// draw a circle at the current set of coordinates
// declare variable for shared object
// set the intial values on the shared object
// connect to the p5.party server
// load the shared object
// draw the value of the timer
// reduce `shared.timer` by 1 every 60 frames
// reset the shared object when timer reaches 0

/**
 * Q+A
 *
 * In the code above:
 *
 * 1) Do all connected clients read from the shared object?
 *
 * 2) Do all connected clients write to the shared object?
 *
 * 3) Is it possible that two clients will write to the shared object at one time?
 *
 * 4) What would happen if two clients write to the shared object at one time?
 *
 * 5) Do all clients write to the shared.timer property?
 *
 * 6) Do all clients read the shared.timer property?
 *
 * 7) When a new client joins a room which already has a host, will the timer be reset?
 *
 * 8) When the host leaves the room, but other clients still remain, will the timer continue to decrease?
 *
 */
