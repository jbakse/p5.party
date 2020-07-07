/* global map_actions */

const SCALEX = 2;
const SCALEY = 2;
const TILE_SIZE = 8;
const VIEW_WIDTH = 12;
const VIEW_HEIGHT = 12;
const WALL_FLAG = 1;

// shared
let me;
let players;
let shared;

// local state
let mode = "move";
const camera = { x: 0, y: 0 };
const localPlayerData = new WeakMap();

// message
let startMessageOnRelease = false;
let message_input;
let messageTimeout;

// action message
let actionMessage = {
  string: "",
  row: 0,
  column: 0,
};

// resources
let font;
let p8map, p8char;

// p8 assets
let map;
let mapFlags;
let sprites;

function preload() {
  // get shared data
  partyConnect("wss://deepstream-server-1.herokuapp.com", "d12", "main");
  me = partyLoadMyShared();
  players = partyLoadParticipantShareds();
  shared = partyLoadShared("main");
  // load resources

  font = loadFont("pixeldroidConsoleRegular/pixeldroidConsoleRegular.otf");
  p8map = loadStrings("p8/d12.p8");
  p8char = loadStrings("p8/d12_chars.p8");
}

function setup() {
  pixelDensity(1);
  createCanvas(
    VIEW_WIDTH * TILE_SIZE * SCALEX,
    VIEW_HEIGHT * TILE_SIZE * SCALEY
  );

  // parse pico 8 data
  const p = [...defaultPalette];
  p[5] = "rgba(0,0,0,0)";
  const gfx = gfxFromP8(p8map, p);
  map = mapFromP8(p8map, gfx);
  mapFlags = mapFlagsFromP8(p8map);
  sprites = spritesFromSheet(gfxFromP8(p8char, p));

  // initilize self
  me.row = 5;
  me.col = 1;
  me.avatarId = randomInt(0, 4);

  moveCamera(me.row * TILE_SIZE, me.col * TILE_SIZE);
}

function draw() {
  // init local player data for new players
  for (const p of players) {
    if (!localPlayerData.has(p)) {
      localPlayerData.set(p, {
        x: p.col * TILE_SIZE,
        y: p.row * TILE_SIZE,
      });
    }
  }

  // step + draw
  input();
  step();
  drawGame();
  // drawScanlines();
}

function input() {
  checkPressedKeys();
}

////////////////////////////////////////////////////////
// GAME LOGIC

function step() {
  // move players
  for (const p of players) {
    const localP = localPlayerData.get(p);
    const goalP = { x: p.col * TILE_SIZE, y: p.row * TILE_SIZE };

    if (localP.x > goalP.x) localP.flipX = true;
    if (localP.x < goalP.x) localP.flipX = false;

    if (localP.x > goalP.x) localP.facing = "left";
    if (localP.x < goalP.x) localP.facing = "right";
    if (localP.y > goalP.y) localP.facing = "up";
    if (localP.y < goalP.y) localP.facing = "down";

    localP.moving = localP.x !== goalP.x || localP.y !== goalP.y;

    movePoint(localP, goalP, 1);
  }

  // move camera
  const localMe = localPlayerData.get(me);
  moveCamera(localMe.x, localMe.y);
}

function moveCamera(x, y, max) {
  movePoint(camera, { x, y }, max);
}

function movePoint(p1, p2, max = Infinity) {
  const dX = constrain(p2.x - p1.x, -max, max);
  const dY = constrain(p2.y - p1.y, -max, max);
  p1.x += dX;
  p1.y += dY;
}

function triggerAction(x, y) {
  const action = map_actions[x][y];
  if (action) {
    if (typeof action === "string") {
      say(x, y, action);
    }
    if (typeof action === "function") {
      action();
    }
    me.movedSinceAction = false;
    return true;
  }
  return false;
}

function say(x, y, msg) {
  actionMessage.string = msg;
  actionMessage.col = x;
  actionMessage.row = y;
  clearTimeout(actionMessage.timeout);
  actionMessage.timeout = setTimeout(() => (actionMessage.string = ""), 2000);
}

////////////////////////////////////////////////////////
// DRAWING

function drawGame() {
  background(0);

  push();

  // set camera transform
  scale(SCALEX, SCALEY);
  translate(-camera.x, -camera.y);
  translate(
    (VIEW_WIDTH - 1) * 0.5 * TILE_SIZE,
    (VIEW_HEIGHT - 1) * 0.5 * TILE_SIZE
  );

  // set draw modes
  noSmooth();
  noStroke();

  // draw map
  fill("#5E574F");
  rect(0, 0, map.width, map.height);
  image(map, 0, 0);

  // draw wall flags
  // fill("red");
  // for (let y = 0; y < mapFlags.length; y++) {
  //   for (let x = 0; x < 128; x++) {
  //     if (mapFlags[x][y] & WALL_FLAG) rect(x * 8 + 4, y * 8 + 4, 2, 2);
  //   }
  // }

  // draw players
  for (const p of players) {
    const localP = localPlayerData.get(p);
    if (!(typeof p.avatarId === "number")) continue;
    push();
    {
      translate(localP.x, localP.y);
      const shift = -2;
      const bounce = -floor(localP.x / 8 + localP.y / 8) % 2;
      const frame = localP.moving ? floor(localP.x / 8 + localP.y / 8) % 3 : 0;

      const playerSprite = sprites[4 + frame][p.avatarId];

      if (!localP.flipX) {
        image(playerSprite, 0, bounce + shift, TILE_SIZE, TILE_SIZE);
      } else {
        scale(-1, 1);
        image(playerSprite, 0, bounce + shift, -TILE_SIZE, TILE_SIZE);
      }
    }
    pop();

    if (p.message) drawMessage(p.message, localP.x, localP.y, "#222A54");
  }

  // draw action message

  if (actionMessage.string) {
    drawMessage(
      actionMessage.string,
      actionMessage.col * 8,
      actionMessage.row * 8,
      "#000000"
    );
  }

  pop();

  if (!shared.lightsOn) {
    push();
    blendMode(MULTIPLY);
    fill(50, 50, 255);
    rect(0, 0, width, height);
    pop();
  }
}

function drawMessage(s, x, y, c = "#16874E") {
  push();
  translate(4, -4);
  textFont(font, 16);
  textAlign(CENTER, BOTTOM);
  const w = textWidth(s) + 5;
  fill("white");
  rect(x - w * 0.5 - 1, y - 8, w + 2, 8);
  rect(x - w * 0.5, y - 8 - 1, w, 8 + 2);
  fill(c);
  rect(x - w * 0.5, y - 8, w, 8);

  fill("white");
  text(s, x, y);
  pop();
}

let scanlineScroll = 0;
function drawScanlines() {
  push();
  scanlineScroll += SCALEY / 24;
  translate(0, -scanlineScroll % (SCALEY * 2));
  for (let y = 0; y < height; y += SCALEY * 2) {
    stroke(255, 255, 255, 10);
    strokeWeight(SCALEY);

    line(0, y, width, y);
  }
  pop();

  // for (let y = 0; y < height; y += SCALEY) {
  //   strokeWeight(1);
  //   stroke(0, 0, 0, 50);
  //   line(0, y, width, y);
  //   stroke(0, 0, 0, 100);
  //   line(0, y + 1, width, y + 1);
  // }

  // for (let x = 0; x < width; x += SCALEX) {
  //   stroke(50, 50, 50, 200);
  //   strokeWeight(0.5);
  //   line(x, 0, x, height);
  // }
}

////////////////////////////////////////////////////////
// INPUT

function checkPressedKeys() {
  if (mode !== "move") return;

  const localMe = localPlayerData.get(me);
  if (!(localMe.x === me.col * 8 && localMe.y === me.row * 8)) return;

  if (keyIsDown(LEFT_ARROW) || keyIsDown(65 /*a*/)) move(-1, 0);
  else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68 /*d*/)) move(1, 0);
  else if (keyIsDown(UP_ARROW) || keyIsDown(87 /*w*/)) move(0, -1);
  else if (keyIsDown(DOWN_ARROW) || keyIsDown(83 /*s*/)) move(0, 1);
  else me.keysReleasedSinceAction = true;
}

function move(x, y) {
  const col = me.col + x;
  const row = me.row + y;
  if (me.keysReleasedSinceAction) {
    if (triggerAction(col, row)) me.keysReleasedSinceAction = false;
  }
  if (!(mapFlags[col][row] & WALL_FLAG)) {
    me.col = col;
    me.row = row;

    return;
  }
}

function keyPressed() {
  if (mode === "move") {
    if (key === " " || keyCode === RETURN) {
      startMessageOnRelease = true;
    }
    if (key === "q") {
      me.avatarId = ++me.avatarId % 4;
    }
    // if (key === "f") {
    //   performAction();
    // }
  }

  if (mode === "message") {
    if (keyCode === RETURN) sendMessage();
    if (keyCode === ESCAPE) cancelMessage();
  }
}

function keyReleased() {
  if (startMessageOnRelease) {
    startMessageOnRelease = false;
    startMessage();
    return;
  }
}

function startMessage() {
  message_input = createInput("");
  message_input.id("message-input");
  message_input.attribute("autocomplete", "off");
  message_input.attribute("maxlength", "16");
  message_input.elt.focus();
  mode = "message";
}

function sendMessage() {
  // set message
  me.message = message_input.value();
  message_input.remove();

  // start a timer to clear message
  clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    me.message = undefined;
  }, 5000);

  mode = "move";
}

function cancelMessage() {
  message_input.remove();
  mode = "move";
}

////////////////////////////////////////////////////////
// pico 8

const defaultPalette = [
  "#000000", // black
  "#222A54", // navy
  "#7B2654", // plum
  "#16874E", // dark green
  "#A75433", // brown
  "#5E574F", // gray
  "#C2C3C7", // light gray
  "#FEF1E7", // white
  "#F8154C", // red
  "#F9A500", // orange
  "#FAEE00", // yellow
  "#21E515", // green
  "#4CABFF", // blue
  "#84759D", // purple
  "#FA78A9", // pink
  "#FBCDA8", // peach
];

function gfxFromP8(s, palette) {
  // default palette
  palette = palette || defaultPalette;

  // find __gfx__ strings
  const gfx_s = s.slice(s.indexOf("__gfx__") + 1, s.indexOf("__gff__"));

  // draw pixels
  const gfx = createImage(128, gfx_s.length);
  gfx.loadPixels();
  for (let y = 0; y < gfx_s.length; y++) {
    for (let x = 0; x < 128; x++) {
      const i = parseInt(gfx_s[y][x], 16);

      gfx.set(x, y, color(palette[i]));
    }
  }
  gfx.updatePixels();

  return gfx;
}

function mapDataFromP8(s) {
  // find __map__ strings
  const map_s = s.slice(
    s.indexOf("__map__") + 1,
    s.indexOf("__map__") + 1 + 32
  );

  // find shared portion of __gfx__ strings
  const shared_s = s.slice(
    s.indexOf("__gfx__") + 1 + 64, // skip to shared part
    s.indexOf("__gff__")
  );

  // shared portion of __gfx__ is in different format than __map__ data
  // need to join pairs of lines
  // need to flip nibble order "abcd" -> "badc"
  function reversePairs(s) {
    let out = "";
    for (let i = 0; i < s.length; i += 2) {
      out += s[i + 1] + s[i];
    }
    return out;
  }

  let map_ext_s = shared_s.reduce((out, value, index, _in) => {
    if (index % 2 === 0) {
      out.push(reversePairs(_in[index] + _in[index + 1]));
    }
    return out;
  }, []);

  // add shared data to map data
  map_s.push(...map_ext_s);

  return map_s;
}

function mapFromP8(s, gfx) {
  gfx = gfx || gfxFromP8(s);
  const map_s = mapDataFromP8(s);
  const map = createImage(128 * 8, map_s.length * 8);

  // blit tiles into map
  for (let y = 0; y < map_s.length; y++) {
    for (let x = 0; x < 128; x++) {
      let sprite_x = parseInt(map_s[y][x * 2 + 1], 16);
      let sprite_y = parseInt(map_s[y][x * 2], 16);
      if (sprite_x === 0 && sprite_y === 0) continue;
      map.copy(gfx, sprite_x * 8, sprite_y * 8, 8, 8, x * 8, y * 8, 8, 8);
    }
  }

  return map;
}

function mapFlagsFromP8(s) {
  const map_s = mapDataFromP8(s);

  const gff_s = s.slice(s.indexOf("__gff__") + 1, s.indexOf("__map__"));

  const flags_hex = gff_s.join("");

  const flags = [];

  for (let x = 0; x < 128; x++) {
    flags[x] = [];
    for (let y = 0; y < map_s.length; y++) {
      let sprite_x = parseInt(map_s[y][x * 2 + 1], 16);
      let sprite_y = parseInt(map_s[y][x * 2], 16);
      const flags_index = (sprite_y * 16 + sprite_x) * 2;
      const f_int = parseInt(flags_hex.substr(flags_index, 2), 16);
      flags[x][y] = f_int;
    }
  }

  return flags;
}

////////////////////////////////////////////////////////
// UTILITY

function spritesFromSheet(gfx, w = 8, h = 8) {
  const sprites = [];
  for (let x = 0; x < gfx.width / w; x++) {
    sprites[x] = [];
    for (let y = 0; y < gfx.height / h; y++) {
      const i = createImage(w, h);
      i.copy(gfx, x * w, y * h, w, h, 0, 0, w, h);
      sprites[x][y] = i;
    }
  }
  return sprites;
}

function randomInt(min, max) {
  return floor(random(min, max));
}

function rateLimit(func, rate) {
  var timeout;
  return function () {
    if (!timeout) func.apply(this, arguments);
    clearTimeout(timeout);
    timeout = setTimeout(() => (timeout = null), rate);
  };
}

////////////////////////////////////////////////////////
// BROWSER

window.addEventListener(
  "keydown",
  function (e) {
    // arrow keys
    if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
  },
  false
);
