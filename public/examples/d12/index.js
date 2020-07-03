const SCALE = 8;
const TILE_SIZE = 8;
const VIEW_WIDTH = 12;
const VIEW_HEIGHT = 12;
const WALL_FLAG = 1;

// shared
let me;
let players;

// local state
let mode = "move";
const camera = { x: 0, y: 0 };
const localPlayerData = new WeakMap();

// message
let startMessageOnRelease = false;
let message_input;
let messageTimeout;

// resources
let font;
let p8map, p8char;

// p8 assets
let map;
let mapFlags;
let sprites;

function preload() {
  // get shared data
  partyConnect("wss://deepstream-server-1.herokuapp.com", "d12", "main1");
  me = partyLoadMyShared();
  players = partyLoadParticipantShareds();

  // load resources

  font = loadFont("pixeldroidConsoleRegular/pixeldroidConsoleRegular.otf");
  p8map = loadStrings("p8/d12.p8");
  p8char = loadStrings("p8/d12_chars.p8");
}

function setup() {
  pixelDensity(1);
  createCanvas(VIEW_WIDTH * TILE_SIZE * SCALE, VIEW_HEIGHT * TILE_SIZE * SCALE);

  // parse pico 8 data
  const p = [...defaultPalette];
  p[5] = "rgba(0,0,0,0)";
  const gfx = gfxFromP8(p8map, p);
  map = mapFromP8(p8map, gfx);
  mapFlags = mapFlagsFromP8(p8map);
  sprites = spritesFromSheet(gfxFromP8(p8char, p));

  // initilize self
  me.row = 3;
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
  //drawScanlines();
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

const actions = [];
for (let i = 0; i < 128; i++) {
  actions[i] = [];
}
actions[1][3] = "circle";
actions[1][4] = "square";

function performAction() {
  console.log("action", me.col, me.row);
  let offsetX = 0;
  let offsetY = 0;
  const localMe = localPlayerData.get(me);
  if (localMe.facing === "left") offsetX = -1;
  if (localMe.facing === "right") offsetX = 1;
  if (localMe.facing === "up") offsetY = -1;
  if (localMe.facing === "down") offsetY = 1;

  const action = actions[me.col + offsetX][me.row + offsetY];
  if (action) {
    console.log(action);
  }
}

////////////////////////////////////////////////////////
// DRAWING

function drawGame() {
  background(0);

  push();

  // set camera transform
  scale(SCALE);
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
  // for (let y = 0; y < flags.length; y++) {
  //   for (let x = 0; x < 128; x++) {
  //     if (flags[x][y] & WALL_FLAG) rect(x * 8 + 3, y * 8 + 3, 2, 2);
  //   }
  // }

  // draw players
  for (const p of players) {
    const localP = localPlayerData.get(p);

    push();
    {
      translate(localP.x, localP.y);
      const shift = -2;
      const bounce = -floor(localP.x / 8 + localP.y / 8) % 2;
      const frame = (floor(localP.x / 8 + localP.y / 8) % 3) * localP.moving;
      const playerSprite = sprites[4 + frame][p.avatarId];

      if (!localP.flipX) {
        image(playerSprite, 0, bounce + shift, TILE_SIZE, TILE_SIZE);
      } else {
        scale(-1, 1);
        image(playerSprite, 0, bounce + shift, -TILE_SIZE, TILE_SIZE);
      }
    }
    pop();

    if (p.message) drawMessage(p.message, localP.x, localP.y);
  }

  pop();
}

function drawMessage(s, x, y) {
  push();
  translate(0, -4);
  textFont(font, 16);
  textAlign(CENTER, BOTTOM);
  fill("black");
  rect(x - textWidth(s) * 0.5 + 4, y - 8 + 1, textWidth(s) + 1, 7);
  rect(x - textWidth(s) * 0.5 + 4 + 1, y - 8, textWidth(s) + 1 - 2, 9);
  fill("white");
  text(s, x + 4, y);
  pop();
}

function drawScanlines() {
  for (let y = 0; y < height; y += SCALE) {
    stroke(0, 0, 0, 200);
    strokeWeight(SCALE / 4);

    line(0, y, width, y);
  }
  for (let x = 0; x < width; x += SCALE) {
    stroke(50, 50, 50, 20);
    strokeWeight(SCALE / 4);
    line(x, 0, x, height);
  }
}

////////////////////////////////////////////////////////
// INPUT

function checkPressedKeys() {
  if (mode !== "move") return;

  const localMe = localPlayerData.get(me);
  if (!(localMe.x === me.col * 8 && localMe.y === me.row * 8)) return;

  if (keyIsDown(LEFT_ARROW) || keyIsDown(65 /*a*/)) {
    if (!(mapFlags[me.col - 1][me.row] & WALL_FLAG)) {
      me.col -= 1;
      return;
    }
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68 /*d*/)) {
    if (!(mapFlags[me.col + 1][me.row] & WALL_FLAG)) {
      me.col += 1;
      return;
    }
  }
  if (keyIsDown(UP_ARROW) || keyIsDown(87 /*w*/)) {
    if (!(mapFlags[me.col][me.row - 1] & WALL_FLAG)) {
      me.row -= 1;
      return;
    }
  }
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83 /*s*/)) {
    if (!(mapFlags[me.col][me.row + 1] & WALL_FLAG)) {
      me.row += 1;
      return;
    }
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
    if (key === "f") {
      performAction();
    }
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
