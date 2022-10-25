/**
 * gameStatePlay.js
 *
 * This module holds most of the main gameplay code. It contains the code for:
 * - moving and drawing ships
 * - moving and drawing rocks
 * - moving and drawing bullets
 * - handling user input
 *
 * The code for the rocks, ships, and bullets are structured in a similar way.
 * These types of entites would be good candidates for object oriented
 * programming but p5.party can't share OOP objects. So instead of using OOP
 * objects only the _data_ for each entity is kept on the shared objects. This
 * data is then passed to the functions that control the entities.
 *
 * Think "functions processing data" instead of "objects with methods".
 *
 * This file is complex enough that it might be better if the rock, ship,
 * and bullet code were in separate files.
 */

/* globals loadSound */
/* global partySetShared */
/* global partyEmit partySubscribe partyUnsubscribe */

import { gameStates, setGameState } from "./main.js";
import { config } from "./main.js";
import * as camera from "./camera.js";
import { guests, me, hostData } from "./party.js";

import {
  explodeParticles,
  updateParticles,
  drawParticles,
} from "./particles.js";

const sounds = {};

export function preload() {
  sounds.rock4 = loadSound("./sounds/rock4.wav");
  sounds.thrust = loadSound("./sounds/thrust.wav");
  sounds.shoot = loadSound("./sounds/shoot.wav");
  sounds.spawn = loadSound("./sounds/spawn.wav");
  sounds.die = loadSound("./sounds/die.wav");
  sounds.music = loadSound("./sounds/music.wav");
}
export function enter() {
  partySubscribe("rockHit", onRockHit);
  spawn();
  // sounds.music.loop(0, 1, 0.5);
}

export function update() {
  handleInput(me);
  updateShip(me);

  updateParticles();
}

export function draw() {
  push();
  background("black");
  modDraw(drawWorld);
  pop();
}

function drawWorld() {
  for (const guest of guests) {
    drawShip(guest);
  }

  for (const rock of hostData.rocks) {
    drawRock(rock);
  }

  drawParticles();
}

export function mousePressed() {
  setGameState(gameStates.title);
}

export function keyPressed() {
  if (keyCode === 32 /* Space */) fire();

  if (me.alive && (keyCode === UP_ARROW || keyCode === 87) /* W */)
    sounds.thrust.loop(0, 1, 0.5);
}

export function keyReleased() {
  if (keyCode === UP_ARROW || keyCode === 87 /* W */) sounds.thrust.stop();
}

export function leave() {
  partyUnsubscribe("rockHit", onRockHit);
  die();
  sounds.music.stop();
}

// //////////////////////////////////////////////////////
// INPUT

function handleInput(ship) {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65) /* A */) turnShip(ship, -0.05);
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68) /* D */) turnShip(ship, 0.05);
  if (keyIsDown(UP_ARROW) || keyIsDown(87) /* W */) thrustShip(ship, 0.1);
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83) /* S */) thrustShip(ship, -0.1);
  ship.thrusting = keyIsDown(UP_ARROW) || keyIsDown(87);
  ship.reversing = keyIsDown(DOWN_ARROW) || keyIsDown(83);
}

// //////////////////////////////////////////////////////
// SHIPS

function spawn() {
  partySetShared(me, initShip());
  sounds.spawn.play();
}

function die() {
  me.alive = false;
  explodeParticles(50, me.x, me.y, me.dX, me.dY, 2, 100);

  sounds.thrust.stop();
  sounds.die.play();
  camera.addShake(10);
}

function fire() {
  if (!me.alive) return;
  sounds.shoot.play();
  me.bullets.push({
    x: me.x,
    y: me.y,
    //   these commented out lines spawn the bullet taking into account the
    //   ship's velocity.
    //   dX: ship.dX + 5 * cos(ship.angle),
    //   dY: ship.dY + 5 * sin(ship.angle),
    dX: 5 * cos(me.angle),
    dY: 5 * sin(me.angle),
    age: 0,
  });
}

export function initShip() {
  // create an object with a new ships starting properties
  const ship = {};
  ship.alive = true;
  ship.x = config.width * 0.5;
  ship.y = config.height * 0.5;
  ship.dX = 0;
  ship.dY = 0;
  ship.angle = 0;
  ship.bullets = [];
  ship.thrusting = false;
  ship.reversing = false;
  return ship;
}

function updateShip(ship) {
  if (!ship.alive) return;

  // apply basic physics and world wrap
  ship.x += ship.dX;
  ship.y += ship.dY;
  ship.dX *= 0.99;
  ship.dY *= 0.99;
  if (ship.x > config.width) ship.x = 0;
  if (ship.x < 0) ship.x = config.width;
  if (ship.y > config.height) ship.y = 0;
  if (ship.y < 0) ship.y = config.height;

  // check for ship to rock collisions
  for (const rock of hostData.rocks) {
    if (dist(ship.x, ship.y, rock.x, rock.y) < rock.size * 0.5) {
      // let host know the rock was hit
      partyEmit("rockHit", rock);
      die();

      // wait 3 seconds and respawn
      setTimeout(() => {
        spawn();
      }, 3000);
    }
  }

  // update all of our own bullets
  for (const bullet of ship.bullets) {
    updateBullet(bullet);
  }

  // remove bullets that age out
  ship.bullets = ship.bullets.filter((bullet) => bullet.age < 100);
}

function turnShip(ship, angle) {
  ship.angle += angle;
}

function thrustShip(ship, thrust) {
  ship.dX += thrust * cos(ship.angle);
  ship.dY += thrust * sin(ship.angle);
}

function drawShip(ship) {
  if (!ship.alive) return;
  push();
  fill("white");
  noStroke();
  translate(ship.x, ship.y);
  rotate(ship.angle);
  triangle(-10, -10, 15, 0, -10, 10);
  pop();

  // draw thrust
  if (ship.thrusting) {
    push();
    stroke("white");
    noFill();
    translate(ship.x, ship.y);
    rotate(ship.angle);
    const offset1 = (frameCount * 0.6 + 0) % 10;
    const size1 = map(offset1, 0, 10, 8, 0);
    line(-10 - offset1, -size1, -10 - offset1, size1);
    const offset2 = (frameCount * 0.6 + 5) % 10;
    const size2 = map(offset2, 0, 10, 8, 0);
    line(-10 - offset2, -size2, -10 - offset2, size2);
    pop();
  }

  if (ship.reversing) {
    push();
    fill("#f00");
    translate(ship.x, ship.y);
    rotate(ship.angle);
    rect(-12, -6, 2, 4);
    rect(-12, 6, 2, -4);
    pop();
  }

  for (const bullet of ship.bullets) {
    drawBullet(bullet);
  }
}

// //////////////////////////////////////////////////
// BULLETS

function updateBullet(bullet) {
  bullet.age++;

  bullet.x += bullet.dX;
  bullet.y += bullet.dY;
  if (bullet.x > config.width) bullet.x = 0;
  if (bullet.x < 0) bullet.x = config.width;
  if (bullet.y > config.height) bullet.y = 0;
  if (bullet.y < 0) bullet.y = config.height;

  for (const rock of hostData.rocks) {
    if (dist(bullet.x, bullet.y, rock.x, rock.y) < rock.size * 0.5) {
      bullet.age += 1000000;
      partyEmit("rockHit", rock);
    }
  }
}

function drawBullet(bullet) {
  push();
  translate(bullet.x, bullet.y);
  fill("white");
  noStroke();
  ellipse(0, 0, 5);
  pop();
}

// //////////////////////////////////////////////////////
// ROCKS

export function initRocks() {
  const rocks = [];
  for (let i = 0; i < 10; i++) {
    rocks.push(initRock());
  }

  return rocks;
}

export function initRock(overrides = {}) {
  let x = random(0, config.width);
  const y = random(0, config.height);
  if (dist(x, y, config.width * 0.5, config.height * 0.5) < 100) {
    x = 0;
  }
  return {
    x,
    y,
    r: 0,
    dX: random(-1, 1),
    dY: random(-1, 1),
    dR: random(-0.01, 0.0),
    size: random([16, 32, 64]),
    id: random(), // random id, easy to use, unlikely to collide
    ...overrides,
  };
}

export function updateRocks() {
  for (const rock of hostData.rocks) {
    updateRock(rock);
  }
}

function updateRock(rock) {
  rock.x += rock.dX;
  rock.y += rock.dY;
  rock.r += rock.dR;
  if (rock.x > config.width) rock.x = 0;
  if (rock.x < 0) rock.x = config.width;
  if (rock.y > config.height) rock.y = 0;
  if (rock.y < 0) rock.y = config.height;
}

function onRockHit(rock) {
  sounds.rock4.play();
  camera.addShake(rock.size * 0.1);
  explodeParticles(rock.size * 0.25, rock.x, rock.y, rock.dX, rock.dY);
}

function drawRock(rock) {
  push();
  noFill();
  stroke("white");
  strokeWeight(2);
  translate(rock.x, rock.y);

  rotate(rock.r);
  const steps = 10;
  beginShape();
  for (let step = 0; step < steps; step++) {
    const a1 = map(step - 1, 0, steps, 0, 2 * PI);
    const n = map(noise(rock.id, step), 0, 1, 0.5, 1.5);
    const x1 = sin(a1) * rock.size * 0.5 * n;
    const y1 = cos(a1) * rock.size * 0.5 * n;
    vertex(x1, y1);
  }
  endShape(CLOSE);

  pop();
}

// modDraw
// objects in this game wrap when they go off the edge of the screen
// when an object overlaps the edge of the screen we need to draw it twice
// once for the part on the screen, and once on the other side for the part
// that wraps around
// rather than do that for each object we draw, this function repeats all the
// drawing done by the provided function `f` 9 times (upper left,
// upper center, upper right, etc)

function modDraw(f) {
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      push();
      translate(x * config.width, y * config.height);
      f?.();
      pop();
    }
  }
}
