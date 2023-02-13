const ROUND_LENGTH = 600; // duration in frames
let gameState = "waiting"; // "waiting" or "playing"
let roundStart;
let recording; // recording[frame] = {x, y}

let guests;
let me;
// {
//   "x": 100,
//   "y": 100,
//   "color": "red",
//   "history": [
//     [  {x, y}, {x, y}, ... ],
//     [  {x, y}, {x, y}, ... ],
//   ]
// }

function preload() {
  partyConnect("wss://demoserver.p5party.org", "ghosts");
  me = partyLoadMyShared();
  guests = partyLoadGuestShareds();
}

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
// controls
function setup() {
  createCanvas(400, 400);

  partySubscribe("startRound", startRound);
  me.color = random([
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "violet",
  ]);
  me.x = 100;
  me.y = 100;
  me.history = [];
  me.ready = true;
}

/////////////////////////////////////////////////
// game state

function endRound() {
  console.log("end round");

  // add this round's recording to the history
  me.history.push(recording);

  // change game state
  gameState = "waiting";
}

function startRound() {
  console.log("start round");

  // not start frame
  roundStart = frameCount;

  // empty recording
  recording = [];

  // reset avatar
  me.x = 100;
  me.y = 100;

  // change game state
  gameState = "playing";
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
  background(220);
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(0);
  text("Press Any Key To\nStart Round", width / 2, height / 2);
}

function drawGame() {
  background(220);

  // draw all the ghosts
  for (const p of guests) {
    if (!p.ready) continue;
    for (const round of p.history) {
      const current_frame = frameCount - roundStart;
      if (!round[current_frame]) continue;
      drawAvatar(round[current_frame], p.color);
    }
  }

  // draw all the avatars
  for (const p of guests) {
    if (!p.ready) continue;
    drawAvatar(p, p.color);
  }

  // draw timer
  drawTimer();
}

function drawTimer() {
  push();
  const timerWidth = map(frameCount - roundStart, 0, ROUND_LENGTH, width, 0);
  fill(0);
  rect(0, height - 10, timerWidth, 10);
  pop();
}

function drawAvatar(a, c = "red") {
  push();
  fill(c);
  noStroke();
  ellipse(a.x, a.y, 20, 20);
  pop();
}
