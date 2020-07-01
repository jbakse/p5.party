const SCALE = 8;
const TILE_SIZE = 8;
const VIEW_WIDTH = 12;
const VIEW_HEIGHT = 12;

// shared
let me;
let players;

// local state
const camera = { x: 0, y: 0 };
let mode = "move";
const localPlayerData = new WeakMap();

// message
let startMessageOnRelease = false;
let message_input;
let messageTimeout;

// resources
const images = [];
let font;
let p8file;
let map;

function preload() {
  // get shared data
  partyConnect("wss://deepstream-server-1.herokuapp.com", "d12", "main1");
  me = partyLoadMyShared();
  players = partyLoadParticipantShareds();

  // load resources
  images.player = loadImage("./images/player.png");
  font = loadFont("pixeldroidConsoleRegular/pixeldroidConsoleRegular.otf");
  p8file = loadStrings("p8/d12.p8");
}

function setup() {
  createCanvas(VIEW_WIDTH * TILE_SIZE * SCALE, VIEW_HEIGHT * TILE_SIZE * SCALE);

  me.row = 1;
  me.col = 1;
  moveCamera(me.row * TILE_SIZE, me.col * TILE_SIZE);

  const p = [...defaultPalette];
  p[5] = "rgba(0,0,0,0)";
  const gfx = gfxFromP8(p8file, p);
  map = mapFromP8(p8file, gfx);
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
  step();
  drawGame();
}

////////////////////////////////////////////////////////
// GAME LOGIC

function step() {
  // move players
  for (const p of players) {
    const localP = localPlayerData.get(p);
    const goalP = { x: p.col * TILE_SIZE, y: p.row * TILE_SIZE };
    localP.flip = localP.x > goalP.p;
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

////////////////////////////////////////////////////////
// DRAWING

function drawGame() {
  background(0);

  // set camera transform
  scale(8);
  translate(-camera.x, -camera.y);
  translate(
    (VIEW_WIDTH - 1) * 0.5 * TILE_SIZE,
    (VIEW_HEIGHT - 1) * 0.5 * TILE_SIZE
  );

  // set draw modes
  noSmooth();

  // draw map
  fill("gray");
  rect(0, 0, map.width, map.height);
  image(map, 0, 0);

  // draw players
  for (const p of players) {
    const localP = localPlayerData.get(p);
    image(images.player, localP.x, localP.y, TILE_SIZE, TILE_SIZE);
    if (localP.flip) {
      image(images.player, localP.x, localP.y, TILE_SIZE, TILE_SIZE);
    }
    if (p.message) drawMessage(p.message, localP.x, localP.y);
  }
}

function drawMessage(s, x, y) {
  push();
  textFont(font, 16);
  textAlign(CENTER, BOTTOM);
  fill("black");
  rect(x - textWidth(s) * 0.5 + 4, y - 8, textWidth(s) + 1, 8);
  fill("white");
  text(s, x + 4, y);
  pop();
}

////////////////////////////////////////////////////////
// INPUT

function keyPressed() {
  if (mode === "move") {
    if (keyCode === LEFT_ARROW || key === "a") {
      me.col -= 1;
    }
    if (keyCode === RIGHT_ARROW || key === "d") {
      me.col += 1;
    }
    if (keyCode === UP_ARROW || key === "w") {
      me.row -= 1;
    }
    if (keyCode === DOWN_ARROW || key === "s") {
      me.row += 1;
    }
    if (key === " " || keyCode === RETURN) {
      startMessageOnRelease = true;
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
// LOADING

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

  console.log("shared_s", gfx_s.length);

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
