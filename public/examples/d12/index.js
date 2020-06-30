const SCALE = 8;
const TILE_SIZE = 8;
const VIEW_WIDTH = 16;
const VIEW_HEIGHT = 8;

let mode = "move";

let me;
let players;
let shared;

const images = [];
const camera = { x: 0, y: 0 };
const localPlayerData = new WeakMap();

let message_input;
let messageTimeout;

let font;

let p8file;
let gfx;
let map;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "d12", "main1");
  shared = partyLoadShared("shared");
  me = partyLoadMyShared();
  players = partyLoadParticipantShareds();
  images.d12_1205 = loadImage("./images/d12_1205.png");
  images.player = loadImage("./images/player.png");
  font = loadFont("pixeldroidConsoleRegular/pixeldroidConsoleRegular.otf");
  p8file = loadStrings("p8/test.p8");
}

function setup() {
  createCanvas(VIEW_WIDTH * TILE_SIZE * SCALE, VIEW_HEIGHT * TILE_SIZE * SCALE);
  noStroke();
  me.row = 5;
  me.col = 5;
  moveCamera(me.row * TILE_SIZE, me.col * TILE_SIZE);
  gfx = gfxFromP8(p8file);
  map = mapFromP8(p8file, gfx);
}

function mousePressed(e) {}

function draw() {
  background(0);

  // init local player data for new players
  for (const p of players) {
    if (!localPlayerData.has(p)) {
      localPlayerData.set(p, {
        x: p.col * TILE_SIZE,
        y: p.row * TILE_SIZE,
      });
    }
  }

  // move players
  for (const p of players) {
    const localP = localPlayerData.get(p);
    movePoint(
      localP,
      {
        x: p.col * TILE_SIZE,
        y: p.row * TILE_SIZE,
      },
      1
    );
  }

  // move camera
  const localMe = localPlayerData.get(me);
  moveCamera(localMe.x, localMe.y);

  // set camera
  push();
  {
    scale(8);
    translate(-camera.x, -camera.y);
    translate(
      (VIEW_WIDTH - 1) * 0.5 * TILE_SIZE,
      (VIEW_HEIGHT - 1) * 0.5 * TILE_SIZE
    );

    drawView();
  }
  pop();

  noSmooth();

  image(gfx, 0, 0, 256, 256);
  image(map, 256, 0);
}

function drawView() {
  noSmooth();
  push();
  image(images.d12_1205, 4, 4, 128, 128);
  for (const p of players) {
    const localP = localPlayerData.get(p);
    image(images.player, localP.x, localP.y, TILE_SIZE, TILE_SIZE);
    if (p.message) {
      textFont(font, 16);
      textAlign(CENTER, BOTTOM);
      fill("black");
      rect(
        localP.x - textWidth(p.message) * 0.5 + 4,
        localP.y - 8,
        textWidth(p.message) + 1,
        8
      );
      fill("white");
      text(p.message, localP.x + 4, localP.y);
    }
  }
  pop();
}

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
      showInputOnRelease = true;
    }
  }

  if (mode === "message") {
    if (keyCode === RETURN) {
      me.message = message_input.value();
      clearTimeout(messageTimeout);
      messageTimeout = setTimeout(() => {
        me.message = undefined;
      }, 5000);

      message_input.remove();
      mode = "move";
    }
    if (keyCode === ESCAPE) {
      message_input.remove();
      mode = "move";
    }
  }
}

let showInputOnRelease = false;
function keyReleased() {
  if (showInputOnRelease) {
    mode = "message";
    message_input = createInput("");
    message_input.id("message-input");
    message_input.attribute("autocomplete", "off");

    message_input.elt.focus();

    showInputOnRelease = false;
    return;
  }
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

function gfxFromP8(s) {
  console.log("gfxFromP8");

  const gfx_s = s.slice(
    s.indexOf("__gfx__") + 1,
    s.indexOf("__gfx__") + 1 + 128
  );

  const colors = [
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

  const gfx = createImage(128, 128);
  gfx.loadPixels();
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const i = parseInt(gfx_s[y][x], 16);
      gfx.set(x, y, color(colors[i]));
    }
  }
  gfx.updatePixels();
  return gfx;
}

function mapFromP8(s, gfx) {
  gfx = gfx || gfxFromP8(s);

  const map_s = s.slice(
    s.indexOf("__map__") + 1,
    s.indexOf("__map__") + 1 + 32
  );

  const map = createImage(128 * 8, 32 * 8);
  // map.loadPixels();
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 128; x++) {
      const sprite_x = parseInt(map_s[y][x * 2 + 1], 16);
      const sprite_y = parseInt(map_s[y][x * 2], 16);
      if (sprite_x === 0 && sprite_y === 0) continue;
      map.copy(gfx, sprite_x * 8, sprite_y * 8, 8, 8, x * 8, y * 8, 8, 8);
    }
  }
  // map.updatePixels();
  return map;
}
