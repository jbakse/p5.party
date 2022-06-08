// p5.party experimental

// project utils

// @todo: switch to modules, would clean up global declartions below

/* global Rect pointInRect */
/* global StatTracker */
/* global debugShow */

let stats;
let shared, my, guests;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "tanks_2", "main");
  shared = partyLoadShared("shared", { bullets: [] });
  my = partyLoadMyShared();
  guests = partyLoadGuestShareds();
}

function setup() {
  createCanvas(500, 400).parent("canvas-wrap");
  stats = new StatTracker();

  my.tank = { x: random(width), y: random(height), a: random(2 * PI), spin: 0 };

  // hosting can change mid-game so every client subscribes, and then checks if it is host on every message
  partySubscribe("createBullet", onCreateBullet);
}

function draw() {
  moveTank();
  if (partyIsHost()) stepGame();
  drawScene();

  stats.tick();
  debugShow({
    stats,
    guests: guests,
  });
}

///////////////////////////////////////////
// HOST CODE

function stepGame() {
  shared.bullets.forEach(stepBullet);
}

function stepBullet(b) {
  b.x += b.dX;
  b.y += b.dY;

  // remove out of bounds bullets
  if (!pointInRect(b, new Rect(0, 0, 500, 400))) {
    const i = shared.bullets.indexOf(b);
    shared.bullets.splice(i, 1);
  }
}

function onCreateBullet(b) {
  if (partyIsHost()) shared.bullets.push(b);
}

///////////////////////////////////////////
// CLIENT CODE - LOGIC

function moveTank() {
  // forward
  if (keyIsDown(87) /*w*/) {
    my.tank.x += sin(my.tank.a) * 3;
    my.tank.y -= cos(my.tank.a) * 3;
  }

  // backward
  if (keyIsDown(83) /*s*/) {
    my.tank.x += sin(my.tank.a) * -1;
    my.tank.y -= cos(my.tank.a) * -1;
  }

  if (keyIsDown(65) /*a*/) my.tank.a -= radians(2);
  if (keyIsDown(68) /*d*/) my.tank.a += radians(2);

  for (const bullet of shared.bullets) {
    if (dist(bullet.x, bullet.y, my.tank.x, my.tank.y) < 15) {
      my.tank.spin = 0.4;
    }
  }

  my.tank.spin *= 0.98;
  my.tank.a += my.tank.spin;
}

function keyPressed() {
  if (key === " ") {
    partyEmit("createBullet", {
      x: my.tank.x + sin(my.tank.a) * 24,
      y: my.tank.y - cos(my.tank.a) * 24,
      dX: sin(my.tank.a) * 8,
      dY: -cos(my.tank.a) * 8,
    });
  }

  return false;
}

///////////////////////////////////////////
// CLIENT CODE - DRAW

function drawScene() {
  noStroke();
  background("#cc6666");
  shared.bullets.forEach(drawBullet);
  for (const p of guests) {
    if (p.tank) drawTank(p.tank);
  }
}

function drawTank(tank) {
  push();
  rectMode(CENTER);
  translate(tank.x, tank.y);
  rotate(tank.a);
  rect(0, 0, 32, 32);
  rect(0, -20, 5, 5);
  pop();
}

function drawBullet(b) {
  push();
  ellipse(b.x, b.y, 10, 10);
  pop();
}
