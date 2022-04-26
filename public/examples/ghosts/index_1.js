// let shared;

// function preload() {
//   partyConnect("wss://deepstream-server-1.herokuapp.com", "ghosts", "main");
//   shared = partyLoadShared("shared");
// }

const avatar = { x: 100, y: 100 };

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
}

/////////////////////////////////////////////////
// game loop
function draw() {
  update();
  render();
}

function update() {
  if (controls.up) avatar.y -= 5;
  if (controls.down) avatar.y += 5;
  if (controls.left) avatar.x -= 5;
  if (controls.right) avatar.x += 5;
}

function render() {
  background(220);
  renderAvatar(avatar);
}

function renderAvatar(a) {
  push();
  fill("red");
  noStroke();
  ellipse(a.x, a.y, 20, 20);
  pop();
}
