/**
 * Death Mountain
 *
 * Test your skills by climbing the death mountain and dealing
 * with the falling boulders!
 *
 * Use WASD to move + SPACE to attack
 *
 * Code by Nikunj Bafna
 */

/* global loadAnimation animation*/

import { RoleKeeper } from "../role_keeper/roleKeeper.js";

const BOULDER_SPEED = 6;
const PLAYER_SPEED = 3;
const ROAD_SPEED = 2;

const images = {};
const fonts = {};
const animations = {};

let shared, me, guests;

let roadY = 0;

// since this is a module, we need to export the functions to the `window`
// so that p5 can access them
Object.assign(window, {
  preload,
  draw,
  setup,
  keyPressed,
});

function preload() {
  // setup p5.party
  partyConnect("wss://demoserver.p5party.org", "death-mountain-dev");
  shared = partyLoadShared("shared", { boulders: [] });
  me = partyLoadMyShared({ role: "observer", x: 0, y: 0, score: 0 });
  guests = partyLoadGuestShareds();
  new RoleKeeper(["player1", "player2"], "observer");

  // load assets
  fonts.normal = loadFont("fonts/NormalFont.ttf");
  images.road = loadImage("images/road_map.png");
  images.player1Face = loadImage("images/player_1/face.png");
  images.player2Face = loadImage("images/player_2/face.png");
  images.weapon = loadImage("images/sword.png");
  images.box = loadImage("images/box.png");
  animations.player1Walk = loadAnimation("images/player_1/walk_sprites.png", {
    frameSize: [16, 16],
    frames: 4,
  });
  animations.player2Walk = loadAnimation("images/player_2/walk_sprites.png", {
    frameSize: [16, 16],
    frames: 4,
  });
  animations.boom = loadAnimation("images/boom_sprites.png", {
    frameSize: [48, 48],
    frames: 4,
  });
  animations.redBoulders = loadAnimation("images/red_boulder_sprites.png", {
    frameSize: [48, 48],
    frames: 5,
  });
  animations.blueBoulders = loadAnimation("images/blue_boulder_sprites.png", {
    frameSize: [48, 48],
    frames: 5,
  });
}

function setup() {
  createCanvas(320, 656);

  // conifigure p5
  rectMode(CENTER);
  textFont(fonts.normal);
  textSize(28);
  textAlign(CENTER);

  // init me
  me.x = me.role_keeper.role === "player1" ? width * 0.25 : width * 0.75;
  me.y = height - 80;
}

function update() {
  // handle input
  handlePlayerMovement();

  // move sprites
  if (partyIsHost()) {
    if (random(1) < 0.01) spawnBoulder();
    updateBoulders();
  }

  for (const boulder of shared.boulders) {
    collideBoulder(boulder);
  }

  // scroll the road
  roadY += ROAD_SPEED;
  if (roadY > height) {
    roadY = 0;
  }
}
function draw() {
  update();

  // draw road
  image(images.road, 0, roadY - height);
  image(images.road, 0, roadY);

  drawPlayers();
  drawBoulders();
  drawRole();

  drawScore();
}

function drawBoulders() {
  // p5.play animations keep track of the current frame automatically
  // but because we are reusing the same animation for multiple boulders
  // we need to track and set the frames ourselves
  // p5.play's SpriteAnimation doesn't seem to be set up well for this
  // this code uses a private property (.frame) to make it work
  // https://p5play.org/docs/SpriteAnimation.html
  for (const boulder of shared.boulders) {
    if (boulder.isDamaged) {
      animations.boom.frame = floor(boulder.explosionFrame);
      animation(animations.boom, boulder.x, boulder.y);
    } else if (boulder.color === "red") {
      animations.redBoulders.frame =
        floor(frameCount / 2) % animations.redBoulders.length;
      animation(animations.redBoulders, boulder.x, boulder.y);
    } else if (boulder.color === "blue") {
      animations.blueBoulders.frame =
        floor(frameCount / 2) % animations.blueBoulders.length;
      animation(animations.blueBoulders, boulder.x, boulder.y);
    }
  }
}
/// INPUT CODE

function handlePlayerMovement() {
  // A
  if (keyIsDown(65)) {
    me.x -= PLAYER_SPEED;
    me.isAttacking = false;
  }
  // D
  if (keyIsDown(68)) {
    me.x += PLAYER_SPEED;
    me.isAttacking = false;
  }
  // W
  if (keyIsDown(87)) {
    me.y -= PLAYER_SPEED;
    me.isAttacking = false;
  }
  // S
  if (keyIsDown(83)) {
    me.y += PLAYER_SPEED;
    me.isAttacking = false;
  }

  me.x = constrain(me.x, 80, width - 80);
  me.y = constrain(me.y, height - 150, height - 60);
}

function keyPressed() {
  if (keyCode === 32) me.isAttacking = true;
  return false;
}

/// UPDATE CODE

function updateBoulders() {
  // move boulders down
  for (const boulder of shared.boulders) {
    boulder.y += BOULDER_SPEED;
    boulder.x += random(-1, 1);

    // advance explosion animation
    if (boulder.isDamaged) boulder.explosionFrame += 0.5;

    // remove boulder after explosion animation
    if (boulder.explosionFrame >= animations.boom.length) {
      const index = shared.boulders.indexOf(boulder);
      shared.boulders.splice(index, 1);
    }
  }

  // remove boulders that are off bottom of screen
  for (let i = shared.boulders.length - 1; i >= 0; i--) {
    if (shared.boulders[i].y > height + 50) {
      shared.boulders.splice(i, 1);
    }
  }

  // note don't use .filter here because it causes a problem
  // with indexOf on the shared/proxied array
  // see tests/proxy.mjs for a test case

  // shared.boulders = shared.boulders.filter(
  //   (boulder) => boulder.y < height + 50
  // );
}

function spawnBoulder() {
  const boulder = {
    x: random(120, width - 120),
    y: -50,
    color: random(["red", "blue"]),
    isDamaged: false,
    explosionFrame: 0,
    isDangerous: true,
  };
  shared.boulders.push(boulder);
}

function collideBoulder(boulder) {
  // todo: multiple clients write to boulders
  // and boulders are written to frequently, so this will lead to conflicts

  // detects and handles collisions between boulder and "me"
  const playerColor = me.role_keeper.role === "player1" ? "red" : "blue";
  const hitDistance = dist(boulder.x, boulder.y, me.x, me.y);

  // no collision
  if (hitDistance > 20) return;

  // check if player can destroy boulder
  if (me.isAttacking && boulder.color === playerColor) {
    me.isAttacking = false;
    me.score++;

    boulder.isDangerous = false;
    boulder.isDamaged = true;

    return;
  }

  if (boulder.isDangerous) {
    me.score--;
    boulder.isDangerous = false;
  }
}

/// DRAWING CODE

function drawPlayers() {
  push();
  const p1 = guests.find((p) => p?.role_keeper?.role === "player1");
  if (p1) {
    animation(animations.player1Walk, p1.x, p1.y);
    if (p1.isAttacking) image(images.weapon, p1.x, p1.y - 20);
  }

  const p2 = guests.find((p) => p?.role_keeper?.role === "player2");
  if (p2) {
    animation(animations.player2Walk, p2.x, p2.y);
    if (p2.isAttacking) image(images.weapon, p2.x, p2.y - 20);
  }
  pop();
}

function drawRole() {
  push();
  fill(255);
  if (me.role_keeper.role === "observer") {
    text("OBSERVER 👀", width / 2, height - 20);
  } else if (me.role_keeper.role === "player1") {
    text("PLAYER 1: RED", width / 2, height - 20);
  } else if (me.role_keeper.role === "player2") {
    text("PLAYER 2: BLUE", width / 2, height - 20);
  }
  pop();
}

function drawScore() {
  push();
  image(images.box, 10, 10);
  image(images.player1Face, 25, 26);
  image(images.box, width - 135, 10);
  image(images.player2Face, width - 60, 26);

  fill("black");
  const p1 = guests.find((p) => p.role_keeper.role === "player1");
  if (p1) text(p1.score, 96, 52);

  const p2 = guests.find((p) => p.role_keeper.role === "player2");
  if (p2) text(p2.score, 226, 52);
  pop();
}
