// p5.party experimental
/* global partyEmit partySubscribe*/

// project utils
/* global Rect pointInRect */
/* global StatTracker */
/* global debugShow */

let stats;
let shared, me, participants;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "tanks", "main");
  shared = partyLoadShared("shared");
  me = partyLoadMyShared();
  participants = partyLoadParticipantShareds();
}

function setup() {
  createCanvas(400, 400).parent("canvas-wrap");
  stats = new StatTracker();

  if (partyIsHost()) {
    shared.bullets = [];
  }

  me.tank = { x: random(width), y: random(height), a: random(2 * PI), spin: 0 };

  // hosting can change mid-game so every client subscribes, and then checks if it is host on every event
  partySubscribe("createBullet", onCreateBullet);
}

function draw() {
  moveTank();
  if (partyIsHost()) stepGame();
  drawScene();

  stats.tick();
  debugShow({
    stats,
    participants,
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
  if (!pointInRect(b, new Rect(0, 0, 400, 400))) {
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
    me.tank.x += sin(me.tank.a) * 3;
    me.tank.y -= cos(me.tank.a) * 3;
  }

  // backward
  if (keyIsDown(83) /*s*/) {
    me.tank.x += sin(me.tank.a) * -1;
    me.tank.y -= cos(me.tank.a) * -1;
  }

  if (keyIsDown(65) /*a*/) me.tank.a -= radians(2);
  if (keyIsDown(68) /*d*/) me.tank.a += radians(2);

  for (const bullet of shared.bullets) {
    if (dist(bullet.x, bullet.y, me.tank.x, me.tank.y) < 15) {
      me.tank.spin = 0.4;
    }
  }

  me.tank.spin *= 0.98;
  me.tank.a += me.tank.spin;
}

function keyPressed() {
  if (key === " ") {
    partyEmit("createBullet", {
      x: me.tank.x + sin(me.tank.a) * 16,
      y: me.tank.y - cos(me.tank.a) * 16,
      dX: sin(me.tank.a) * 6,
      dY: -cos(me.tank.a) * 6,
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
  for (const p of participants) {
    if (p.tank) drawTank(p.tank);
  }
}

function drawTank(tank) {
  push();
  rectMode(CENTER);
  translate(tank.x, tank.y);
  rotate(tank.a);
  rect(0, 0, 30, 30);
  rect(0, -20, 5, 5);
  pop();
}

function drawBullet(b) {
  push();
  ellipse(b.x, b.y, 10, 10);
  pop();
}
