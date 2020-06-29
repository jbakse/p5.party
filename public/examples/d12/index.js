let me;
let players;
let shared;

const images = [];
const camera = { x: 0, y: 0 };

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "d12", "main1");
  shared = partyLoadShared("shared");
  me = partyLoadMyShared();
  players = partyLoadParticipantShareds();
  images.d12_1205 = loadImage("./images/d12_1205.png");
  images.player = loadImage("./images/player.png");
}

function setup() {
  createCanvas(16 * 8 * 8, 16 * 8 * 8);
  noStroke();
  me.x = 5;
  me.y = 5;
}

function mousePressed(e) {}

function draw() {
  background(0);

  if (camera.x < me.x * 8) {
    camera.x += 1;
  }
  if (camera.x > me.x * 8) {
    camera.x -= 1;
  }
  if (camera.y < me.y * 8) {
    camera.y += 1;
  }
  if (camera.y > me.y * 8) {
    camera.y -= 1;
  }

  scale(8);
  translate(-camera.x, -camera.y);
  translate(7.5 * 8, 7.5 * 8);

  rect(210, 10, 10, 10);
  drawGame();
}

function drawGame() {
  noSmooth();
  push();
  image(images.d12_1205, 4, 4, 128, 128);
  for (const p of players) {
    image(images.player, p.x * 8, p.y * 8, 8, 8);
  }
  pop();
}

function keyPressed() {
  if (keyCode === LEFT_ARROW || key === "a") {
    me.x -= 1;
  }
  if (keyCode === RIGHT_ARROW || key === "d") {
    me.x += 1;
  }
  if (keyCode === UP_ARROW || key === "w") {
    me.y -= 1;
  }
  if (keyCode === DOWN_ARROW || key === "s") {
    me.y += 1;
  }
}
