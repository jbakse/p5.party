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

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "d12", "main1");
  shared = partyLoadShared("shared");
  me = partyLoadMyShared();
  players = partyLoadParticipantShareds();
  images.d12_1205 = loadImage("./images/d12_1205.png");
  images.player = loadImage("./images/player.png");
  font = loadFont("pixeldroidConsoleRegular/pixeldroidConsoleRegular.otf");
}

function setup() {
  createCanvas(VIEW_WIDTH * TILE_SIZE * SCALE, VIEW_HEIGHT * TILE_SIZE * SCALE);
  noStroke();
  me.row = 5;
  me.col = 5;
  moveCamera(me.row * TILE_SIZE, me.col * TILE_SIZE);
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
  scale(8);
  translate(-camera.x, -camera.y);
  translate(
    (VIEW_WIDTH - 1) * 0.5 * TILE_SIZE,
    (VIEW_HEIGHT - 1) * 0.5 * TILE_SIZE
  );

  drawView();
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
    console.log(message_input);
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
