/* exported Rect */
class Rect {
  constructor(l = 0, t = 0, w = 0, h = 0) {
    this.l = l;
    this.t = t;
    this.w = w;
    this.h = h;
  }
}

function pointInRect(p, r) {
  return p.x > r.l && p.x < r.l + r.w && p.y > r.t && p.y < r.t + r.h;
}

const bounds = new Rect(0, 0, 400, 400);

let shared;
let new_bullets;
let me;
let guests;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "tanks_1", "main");
  shared = partyLoadShared("shared");
  new_bullets = partyLoadShared("new_bullets");
  me = partyLoadMyShared();
  guests = partyLoadGuestShareds();
}

function setup() {
  createCanvas(400, 400).parent("canvas-wrap");

  noStroke();

  if (partyIsHost()) {
    shared.bullets = [];
    new_bullets.bullets = [];
  }

  me.tank = { x: 100, y: 100, a: 0 };
}

function draw() {
  checkKeys();
  if (partyIsHost()) stepGame();
  drawScene();
  showData();
}

function stepGame() {
  // move sent bullets to main bullet array
  while (new_bullets.bullets.length) {
    shared.bullets.push(new_bullets.bullets.shift());
  }

  // step bullets
  shared.bullets.forEach(stepBullet);
}

function showData() {
  document.getElementById("shared").innerText = JSON.stringify(
    shared,
    null,
    "\t"
  );
}

function drawScene() {
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
  rect(0, 0, 30, 30);
  rect(0, -20, 5, 5);
  pop();
}

function stepBullet(b) {
  b.x += b.dX;
  b.y += b.dY;
  if (!pointInRect(b, bounds)) {
    const i = shared.bullets.indexOf(b);
    shared.bullets.splice(i, 1);
  }
}

function drawBullet(b) {
  push();
  ellipse(b.x, b.y, 10, 10);
  pop();
}

function keyPressed() {
  if (key === " ") {
    new_bullets.bullets.push({
      x: me.tank.x,
      y: me.tank.y,
      dX: sin(me.tank.a) * 6,
      dY: -cos(me.tank.a) * 6,
    });
  }

  return false;
}

function checkKeys() {
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
}
