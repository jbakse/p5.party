// declare variable for shared object
let shared;

function preload() {
  // connect to the p5.party server
  partyConnect("wss://demoserver.p5party.org", "host_timer", "main");

  // load the shared object
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  textAlign(CENTER, CENTER);

  // set frameRate to 60 frames per second
  frameRate(60);

  // check if this client is the host
  if (partyIsHost()) {
    // set the intial values on the shared object
    partySetShared(shared, { circles: [], timer: 5 });
  }
}

function mousePressed() {
  // push mouse coordinates into tje `shared.circles` array
  shared.circles.push({ x: mouseX, y: mouseY });
}

function draw() {
  background("#ffcccc");
  fill("#000066");

  // check if this client is the host
  if (partyIsHost()) {
    // reduce `shared.timer` by 1 every 60 frames
    if (frameCount % 60 === 0) {
      shared.timer--;
    }

    // reset the shared object when timer reaches 0
    if (shared.timer === 0) {
      partySetShared(shared, { circles: [], timer: 5 });
    }
  }

  // iterate through all coordinates in the shared circles array
  for (const circle of shared.circles) {
    // draw a circle at the current set of coordinates
    ellipse(circle.x, circle.y, 20, 20);
  }

  // draw the value of the timer
  textSize(30);
  text(shared.timer, width / 2, 40);
}

/**
 * Q+A
 *
 * In the code above:
 *
 * 1) Do all connected clients read from the shared object?
 *
 * Yes.
 *
 * 2) Do all connected clients write to the shared object?
 *
 * Yes. They all write to the shared.circles array of the shared object.
 *
 * 3) Is it possible that two clients will write to the shared object at one time?
 *
 * Yes. If they both click the screen at approximately the same time, they will both try to write to the shared object at the same time.
 *
 * 4) What would happen if two clients write to the shared object at one time?
 *
 * There will be a conflict in writing and only one of the clients' data will get written.
 *
 * Note: This does mean that his demo has a "bug" that appears when two players click at the same time.
 * There are ways to fix the bug, but it might not be necessary if its not a problem in practice.
 * p5.party is a prototyping library, after all.
 *
 * 5) Do all clients write to the shared.timer property?
 *
 * No. Only the host writes to shared.timer because it is enclosed in a check for partyIsHost().
 *
 * 6) Do all clients read the shared.timer property?
 *
 * Yes. Because they need to read it to display it on their own screen.
 *
 * 7) When a new client joins a room which already has a host, will the timer be reset?
 *
 * No. Because the host is the only one affecting the timer. The new client will just read the value of it as is.
 *
 * 8) When the host leaves the room, but other clients still remain, will the timer continue to decrease?
 *
 * Yes. Because the library will assign a new host who will take over running the host code.
 *
 */
