// require https://cdn.jsdelivr.net/npm/p5@latest/lib/p5.min.js
// require https://cdn.jsdelivr.net/npm/p5@latest/lib/addons/p5.sound.js
// require https://cdn.jsdelivr.net/npm/p5.party@latest/dist/p5.party.js

/* global outputVolume */

/**
 * General Approach
 * Host: moves the traffic, writes a position for each lane to shared{}
 * Players: move themselves, check themselves for collisions, write to my{}
 * Local: copies data from shared{} and guests{} to local state, and draws scene.
 *
 * Accepted Issues
 * Its possible (but unlikely) for two clients to join as player1 or player2 at
 * the same time if they tie trying to join.
 *
 * tools used to create images and sounds
 * https://www.photopea.com/
 * https://www.lexaloffle.com/pico-8.php
 *
 * pixel font inspiration
 * https://nfggames.com/games/fontmaker/
 * http://arcade.photonstorm.com/
 *
 * game inspiration
 * https://en.wikipedia.org/wiki/Frogger
 */

const BLOCK_SIZE = 32; // this is the size of the game grid
const SPRITE_SIZE = 24; // the cars and frogs don't fill the grid

const truck = { sprite: 4, collides: true, length: 4 * SPRITE_SIZE };
const car = { sprite: 2, collides: true, length: 2 * SPRITE_SIZE };
const small_gap = { sprite: false, collides: false, length: 4 * SPRITE_SIZE };
const large_gap = { sprite: false, collides: false, length: 8 * SPRITE_SIZE };

// lanes defines the traffic pattern
const lanes = [
  {
    y: BLOCK_SIZE * 3, // tog of the lane
    speed: 1.5, // how fast the lane moves, pixels per frame
    pattern: [truck, large_gap], // repeated pattern of cars and gaps
  },
  {
    y: BLOCK_SIZE * 4,
    speed: 2,
    pattern: [car, small_gap, car, large_gap],
  },
  {
    y: BLOCK_SIZE * 5,
    speed: 0.5,
    pattern: [truck, large_gap, car, large_gap],
  },
  {
    y: BLOCK_SIZE * 6,
    speed: 2.5,
    pattern: [car, small_gap, car, small_gap, car, large_gap],
  },
  {
    y: BLOCK_SIZE * 7,
    speed: 1,
    pattern: [car, large_gap, car, large_gap],
  },
  {
    y: BLOCK_SIZE * 8,
    speed: 1.5,
    pattern: [car, large_gap, car, large_gap],
  },
];

// the frogs array holds all the data needed to draw the frogs
// it contains constant state: w, h, spawnX, spawnY, color
// it also holds a copy of mutable state from the current p1 and p2 shared object
// this mutable state is copied in each frame as it is more convienient to have
// all the frog data in one object for collion detection and drawing

const frogs = [
  {
    x: -32, // left of grid block containing frog
    y: 0, // tog of block
    direction: "up", // up | down | left | right: direction of last movement
    w: BLOCK_SIZE,
    h: BLOCK_SIZE,
    spawnX: 2 * BLOCK_SIZE, // where to spawn
    spawnY: 11 * BLOCK_SIZE,
    color: "#6f6", // color to tint sprite
  },
  {
    x: -32,
    y: 0,
    direction: "up",
    w: BLOCK_SIZE,
    h: BLOCK_SIZE,
    spawnX: 9 * BLOCK_SIZE,
    spawnY: 11 * BLOCK_SIZE,
    color: "#ff6",
  },
];

// assets
const soundLib = {}; // all loaded sounds
const imageLib = {}; // all loaded images

// p5.party shared objects
let shared;
// written by host only
// lanes[x].pos: current position of the lanes used to sync traffics

let me;
let guests;
// role: "player1" | "player2" | "observer"
// x, y, direction, state: frog state data

// global state
let gameState = "TITLE"; // TITLE, PLAYING
let legendVisible = false;
const cars = []; // can this be removed from global scope?

function preload() {
  imageLib.sprites = loadImage(`./assets/frogger_sprites.png`);

  imageLib.frogs_f = loadImage(`./assets/frogs_f.png`);
  imageLib.frogs_r = loadImage(`./assets/frogs_r.png`);
  imageLib.frogs_o = loadImage(`./assets/frogs_o.png`);
  imageLib.frogs_g = loadImage(`./assets/frogs_g.png`);
  imageLib.frogs_s = loadImage(`./assets/frogs_s.png`);

  imageLib.button_start_up = loadImage(`./assets/button_start_up.png`);
  imageLib.button_start_down = loadImage(`./assets/button_start_down.png`);

  imageLib.badge_join = loadImage(`./assets/badge_join.png`);
  imageLib.badge_p1 = loadImage(`./assets/badge_p1.png`);
  imageLib.badge_p2 = loadImage(`./assets/badge_p2.png`);
  imageLib.badge_watching = loadImage(`./assets/badge_watching.png`);

  imageLib.asdw = loadImage(`./assets/asdw.png`);
  imageLib.ldru = loadImage(`./assets/ldru.png`);

  soundLib.spawn = loadSound(`./assets/frogger_sfx_spawn.wav`);
  soundLib.jump = loadSound(`./assets/frogger_sfx_jump.wav`);
  soundLib.hit = loadSound(`./assets/frogger_sfx_hit.wav`);
  soundLib.die = loadSound(`./assets/frogger_sfx_die.wav`);
  soundLib.intro = loadSound(`./assets/frogger_sfx_intro.wav`);
  soundLib.title = loadSound(`./assets/frogger_sfx_title.wav`);

  partyConnect("wss://deepstream-server-1.herokuapp.com", "frogs", "main");
  shared = partyLoadShared("shared", {
    lanes: [
      { pos: 0 },
      { pos: 0 },
      { pos: 0 },
      { pos: 0 },
      { pos: 0 },
      { pos: 0 },
    ],
  });

  me = partyLoadMyShared({ role: "observer" });
  guests = partyLoadGuestShareds();
}

function setup() {
  createCanvas(BLOCK_SIZE * 12, BLOCK_SIZE * 13);

  // set up messages
  partySubscribe("playSound", playSound);

  // configure p5
  angleMode(DEGREES);
  outputVolume(0.3);
  noSmooth();
  noStroke();
}

function draw() {
  if (partyIsHost()) stepHost();

  if (gameState === "TITLE") {
    drawTitleScreen();
  }

  if (gameState === "PLAYING") {
    stepLocal();
    drawGame();
  }
}

function stepHost() {
  // move traffic
  shared.lanes.forEach((sharedLane, i) => {
    const localLane = lanes[i];
    sharedLane.pos -= localLane.speed;
  });
}

function stepLocal() {
  // sync traffic from shared to local
  shared.lanes.forEach((sharedLane, i) => {
    const localLane = lanes[i];
    localLane.pos = sharedLane.pos;
  });

  // find the current players, if they exist
  const p1 = guests.find((p) => p.role === "player1");
  const p2 = guests.find((p) => p.role === "player2");

  // hide frogs if they are not in the game
  if (!p1) frogs[0].x = -32;
  if (!p2) frogs[1].x = -32;

  // sync frog positions from shared to local
  const syncFrog = (frog, player) => {
    frog.x = player.x;
    frog.y = player.y;
    frog.state = player.state;
    frog.direction = player.direction;
  };
  if (p1) syncFrog(frogs[0], p1);
  if (p2) syncFrog(frogs[1], p2);

  // place traffic
  const createColliders = (lane) => {
    let x = lane.pos;

    while (x < width) {
      // eslint-disable-next-line no-loop-func
      lane.pattern.forEach((item) => {
        if (x + item.length > 0 && item.collides) {
          cars.push({
            x,
            y: lane.y,
            w: item.length,
            h: BLOCK_SIZE,
            sprite: item.sprite,
          });
        }
        x += item.length;
      });
    }
  };
  cars.length = 0;
  lanes.forEach(createColliders);

  // check collisions
  const checkCollisions = (frog) => {
    if (frog.state === "dead") return;
    const collision = Boolean(
      cars.find((r) => intersectRect(r, insetRect(frog, 4)))
    );
    if (collision) {
      me.state = "dead";
      broadcastSound("hit");
      setTimeout(() => broadcastSound("die"), 300);
      setTimeout(() => watchGame(), 3000);
    }
  };

  if (me.role === "player1") checkCollisions(frogs[0]);
  if (me.role === "player2") checkCollisions(frogs[1]);
}

function drawTitleScreen() {
  background("#153");

  // draw title
  const frogs_letters = [
    imageLib.frogs_f,
    imageLib.frogs_r,
    imageLib.frogs_o,
    imageLib.frogs_g,
    imageLib.frogs_s,
  ];

  push();
  translate(1 * 32, 96);
  frogs_letters.forEach((img, i) => {
    const h = 16; // jump height
    const f = 1; // jumps per second
    const s = 8; // amount to stagger jumps
    const y = max(sin(((-frameCount + i * s) / 60) * 360 * f), 0) * -h;
    image(img, i * 64, y, 64, 64);
  });
  pop();

  // draw start button
  push();
  if (mouseIsPressed) {
    image(imageLib.button_start_down, 3.5 * 32, 8 * 32, 160, 64);
  } else {
    image(imageLib.button_start_up, 3.5 * 32, 8 * 32, 160, 64);
  }
  pop();
}

function drawGame() {
  noSmooth();

  drawBackground();

  frogs.forEach((frog) => {
    if (frog.state === "dead") {
      drawDeadFrog(frog);
    } else {
      drawFrog(frog);
    }
  });

  drawTraffic();

  drawBadge();

  if (legendVisible) drawLegend();
}

function drawBadge() {
  push();
  let i = imageLib.badge_watching;
  if (
    !guests.find((p) => p.role === "player1") ||
    !guests.find((p) => p.role === "player2")
  ) {
    i = imageLib.badge_join;
  }
  if (me.role === "player1") i = imageLib.badge_p1;
  if (me.role === "player2") i = imageLib.badge_p2;
  image(i, (width - i.width) * 0.5, height - i.height * 1.5);
  pop();
}

function drawLegend() {
  push();

  if (me.role === "player1")
    translate(frogs[0].spawnX + 4, frogs[0].spawnY + 32);
  if (me.role === "player2")
    translate(frogs[1].spawnX + 4, frogs[1].spawnY + 32);

  if (frameCount % 120 < 60) {
    image(imageLib.asdw, 0, 0);
  } else {
    image(imageLib.ldru, 0, 0);
  }
  pop();
}

function drawTraffic() {
  push();
  cars.forEach((r) => {
    image(
      imageLib.sprites,
      r.x,
      r.y + 4,
      r.w,
      r.h - 8,
      r.sprite * 8,
      0,
      r.w / 3,
      8
    );
  });
  pop();
}

function drawFrog(frog) {
  push();
  translate(frog.x + 16, frog.y + 16);
  if (frog.direction === "left") rotate(-90);
  if (frog.direction === "right") rotate(90);
  if (frog.direction === "down") rotate(180);
  tint(frog.color);
  image(imageLib.sprites, -12, -12, 24, 24, 10 * 8, 0, 8, 8);
  pop();
}

function drawDeadFrog(frog) {
  push();
  translate(frog.x + 16, frog.y + 16);
  tint(frog.color);
  image(imageLib.sprites, -12, -12, 24, 24, 11 * 8, 0, 8, 8);
  tint("red");
  image(imageLib.sprites, -12, -12, 24, 24, 12 * 8, 0, 8, 8);
  pop();
}

function drawBackground() {
  push();
  // grass
  fill("#030");
  noStroke();
  rect(0, BLOCK_SIZE * 0, width, BLOCK_SIZE * 2);

  // shoulder
  fill("#555");
  noStroke();
  rect(0, BLOCK_SIZE * 2, width, Number(BLOCK_SIZE));

  // road
  fill("#222");
  noStroke();
  rect(0, BLOCK_SIZE * 3, width, BLOCK_SIZE * 6);

  // road markings
  noFill();
  stroke("white");
  strokeWeight(3);
  line(0, BLOCK_SIZE * 3 + 1.5, width, BLOCK_SIZE * 3 + 1.5);
  line(0, BLOCK_SIZE * 9 - 1.5, width, BLOCK_SIZE * 9 - 1.5);

  // shoulder
  fill("#555");
  noStroke();
  rect(0, BLOCK_SIZE * 9, width, Number(BLOCK_SIZE));

  // grass
  fill("#030");
  noStroke();
  rect(0, BLOCK_SIZE * 10, width, BLOCK_SIZE * 3);

  // fill("black");
  // rect(0, BLOCK_SIZE * 12, width, BLOCK_SIZE * 1);

  pop();
}

function keyPressed() {
  // try to join if not a player
  if (me.role !== "player1" && me.role !== "player2") {
    joinGame();
    return;
  }

  // reject input if dead
  if (me.state === "dead") return;

  // try to move if move keys are pressed
  if (keyCode === LEFT_ARROW || keyCode === 65) tryMove(-BLOCK_SIZE, 0); // left
  if (keyCode === RIGHT_ARROW || keyCode === 68) tryMove(BLOCK_SIZE, 0); // right
  if (keyCode === UP_ARROW || keyCode === 87) tryMove(0, -BLOCK_SIZE); // up
  if (keyCode === DOWN_ARROW || keyCode === 83) tryMove(0, BLOCK_SIZE); // down
}

function mouseReleased() {
  if (gameState === "TITLE") {
    soundLib.intro.play();
    gameState = "PLAYING";
  }
}

function tryMove(x, y) {
  // hide legend when player moves
  legendVisible = false;

  // constrain frog to play area
  const targetLocation = { x: me.x + x, y: me.y + y };
  const bounds = { x: 0, y: 0, w: width - 32, h: height - 32 };
  if (!pointInRect(targetLocation, bounds)) {
    soundLib.hit.play();
    return;
  }

  // move frog
  me.x += x;
  me.y += y;

  // face frog in direction of movement
  if (x < 0) me.direction = "left";
  if (x > 0) me.direction = "right";
  if (y < 0) me.direction = "up";
  if (y > 0) me.direction = "down";

  broadcastSound("jump");
}

function joinGame() {
  // don't let current players double join
  if (me.role === "player1" || me.role === "player2") return;

  if (!guests.find((p) => p.role === "player1")) {
    spawn(frogs[0]);
    me.role = "player1";
    return;
  }
  if (!guests.find((p) => p.role === "player2")) {
    spawn(frogs[1]);
    me.role = "player2";
  }
}

function watchGame() {
  me.role = "observer";
}

function spawn(frog) {
  me.x = frog.spawnX;
  me.y = frog.spawnY;
  me.direction = "up";
  me.state = "alive";
  broadcastSound("spawn");

  legendVisible = true;
}

function broadcastSound(name) {
  partyEmit("playSound", name);
}

function playSound(name) {
  soundLib[name].play();
}

function insetRect(r, amount) {
  const o = {};
  o.x = r.x + amount;
  o.y = r.y + amount;
  o.w = r.w - amount * 2;
  o.h = r.h - amount * 2;
  return o;
}

function pointInRect(p, r) {
  return (
    p.x >= r.x && // format wrapped
    p.x <= r.x + r.w &&
    p.y >= r.y &&
    p.y <= r.y + r.h
  );
}

function intersectRect(r1, r2) {
  return !(
    r2.x > r1.x + r1.w || // format wrapped
    r2.x + r2.w < r1.x ||
    r2.y > r1.y + r1.h ||
    r2.y + r2.h < r1.y
  );
}
