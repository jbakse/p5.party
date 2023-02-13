const ROUND_LENGTH = 600; // duration in frames

let gameState = "waiting"; // "waiting" or "playing"
let roundStart;
let recording;
// recording layout
// [ {x, y}, {x, y}, ... ]

let guests;
let me;

// particpant shared object layout
// {
//   "spawnX": 100,
//   "spawnY": 100,
//   "color": "red",
//   "x": 100,
//   "y": 100,
//   "history": [
//     [  {x, y}, {x, y}, ... ],
//     [  {x, y}, {x, y}, ... ],
//   ]
// }

/////////////////////////////////////////////////
// controls

const controls = { up: false, down: false, left: false, right: false };
function keyPressed() {
  if (gameState === "waiting") {
    partyEmit("startRound");
  }
  if (key === "w") {
    controls.up = true;
  } else if (key === "s") {
    controls.down = true;
  } else if (key === "a") {
    controls.left = true;
  } else if (key === "d") {
    controls.right = true;
  }
}

function keyReleased() {
  if (key === "w") {
    controls.up = false;
  } else if (key === "s") {
    controls.down = false;
  } else if (key === "a") {
    controls.left = false;
  } else if (key === "d") {
    controls.right = false;
  }
}

/////////////////////////////////////////////////
// setup

function preload() {
  partyConnect("wss://demoserver.p5party.org", "ghosts");
  me = partyLoadMyShared({ initialized: true });
  guests = partyLoadGuestShareds();
}

function setup() {
  createCanvas(400, 400);

  // sent when gameState === "waiting" and any client presses key
  partySubscribe("startRound", startRound);

  // choose spawn point and color based on number join order
  if (guests.length === 1) {
    me.spawnX = 100;
    me.spawnY = 100;
    me.color = "red";
  }
  if (guests.length === 2) {
    me.spawnX = width - 100;
    me.spawnY = 100;
    me.color = "blue";
  }
  if (guests.length === 3) {
    me.spawnX = 100;
    me.spawnY = height - 100;
    me.color = "orange";
  }
  if (guests.length === 4) {
    me.spawnX = width - 100;
    me.spawnY = height - 100;
    me.color = "green";
  }
  if (guests.length > 4) {
    me.spawnX = random(width);
    me.spawnY = random(height);
    me.color = random(["red", "blue", "orange", "green"]);
  }

  me.x = me.spawnX;
  me.y = me.spawnY;

  me.history = [];
  me.ready = true;
}

/////////////////////////////////////////////////
// game state

function startRound() {
  console.log("start round");

  // not start frame
  roundStart = frameCount;

  // throw away old recording, and start an new one
  recording = [];

  // reset avatar
  me.x = me.spawnX;
  me.y = me.spawnY;

  // change game state
  gameState = "playing";
}

function endRound() {
  console.log("end round");

  // add a copy of this round's recording to the history
  // slice returns a "shallow copy" of the array
  me.history.push(recording.slice());

  // change game state
  gameState = "waiting";
}

/////////////////////////////////////////////////
// game loop
function draw() {
  if (gameState === "waiting") {
    drawWaiting();
  }
  if (gameState === "playing") {
    updateGame();
    drawGame();
  }
}

function updateGame() {
  if (controls.up) me.y -= 5;
  if (controls.down) me.y += 5;
  if (controls.left) me.x -= 5;
  if (controls.right) me.x += 5;

  // record the current position
  recording.push({ x: me.x, y: me.y });

  if (frameCount - roundStart > ROUND_LENGTH) {
    endRound();
  }
}

function drawWaiting() {
  push();

  textAlign(CENTER, CENTER);
  textSize(32);
  fill(0);

  background(220);
  text("Press Any Key To\nStart Round", width / 2, height / 2);

  pop();
}

function drawGame() {
  push();

  background(220);

  // draw all the ghosts
  for (const p of guests) {
    if (!p.ready) continue;
    for (const round of p.history) {
      const current_frame = frameCount - roundStart;
      if (!round[current_frame]) continue;
      drawGhost(round[current_frame], p.color);
    }
  }

  // draw all the avatars
  for (const p of guests) {
    if (!p.ready) continue;
    drawAvatar(p, p.color);
  }

  drawTimer();

  pop();
}

function drawTimer() {
  push();
  const timerWidth = map(frameCount - roundStart, 0, ROUND_LENGTH, width, 0);
  fill(0);
  rect(0, height - 10, timerWidth, 10);
  pop();
}

function drawAvatar(a, c = "black") {
  push();
  fill(c);
  noStroke();
  ellipse(a.x, a.y, 20, 20);
  pop();
}

function drawGhost(a, c = "black") {
  push();
  stroke(c);
  noFill();
  ellipse(a.x, a.y, 20, 20);
  pop();
}
