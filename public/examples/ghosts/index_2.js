// let guests;
// let me;

// function preload() {
//   partyConnect("wss://demoserver.p5party.org", "ghosts", "main");
//   me = partyLoadMyShared();
//   guests = partyLoadGuestShareds();
// }

const ROUND_LENGTH = 60; //frames
let roundStart;

const avatar = { x: 100, y: 100 };
let recording; // recording[frame] = {x, y}
const avatar_history = []; // avatar_history[round][frame] = {x, y}

/////////////////////////////////////////////////
// controls
const controls = { up: false, down: false, left: false, right: false };
function keyPressed() {
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
  startRound();
}

/////////////////////////////////////////////////
// game state

function endRound() {
  console.log("end round");
  // add this round's recording to the history
  avatar_history.push(recording);
}

function startRound() {
  roundStart = frameCount;

  // empty recording
  recording = [];

  // reset avatar
  avatar.x = 100;
  avatar.y = 100;
}

/////////////////////////////////////////////////
// game loop
function draw() {
  updateGame();
  drawGame();
}

function updateGame() {
  if (controls.up) avatar.y -= 5;
  if (controls.down) avatar.y += 5;
  if (controls.left) avatar.x -= 5;
  if (controls.right) avatar.x += 5;

  // record the current position
  recording.push({ x: avatar.x, y: avatar.y });

  if (frameCount - roundStart > ROUND_LENGTH) {
    endRound();
    startRound();
  }
}

function drawGame() {
  background(220);
  drawAvatar(avatar);

  // draw all the ghosts
  for (const round of avatar_history) {
    const current_frame = frameCount - roundStart;
    drawAvatar(round[current_frame]);
  }
}

function drawAvatar(a) {
  push();
  fill("red");
  noStroke();
  ellipse(a.x, a.y, 20, 20);
  pop();
}
